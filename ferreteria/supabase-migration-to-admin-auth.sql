-- Ejecutar en SQL Editor si ya tenías el esquema antiguo (anon con escritura abierta).
-- Después: crear usuario en Authentication, copiar su UUID y:
--   insert into public.app_admins (user_id) values ('<uuid>');
-- En Auth → Providers: desactivá "Sign up" si no querés registros públicos.

create table if not exists public.app_admins (
  user_id uuid primary key references auth.users (id) on delete cascade
);

alter table public.app_admins enable row level security;

drop policy if exists "app_admins_self_read" on public.app_admins;
create policy "app_admins_self_read"
on public.app_admins
for select
to authenticated
using (user_id = auth.uid());

drop policy if exists "products_select_public" on public.products;
drop policy if exists "products_insert_public" on public.products;
drop policy if exists "products_update_public" on public.products;
drop policy if exists "products_delete_public" on public.products;
drop policy if exists "products_insert_admin" on public.products;
drop policy if exists "products_update_admin" on public.products;
drop policy if exists "products_delete_admin" on public.products;

create policy "products_select_public"
on public.products
for select
using (true);

create policy "products_insert_admin"
on public.products
for insert
to authenticated
with check (
  exists (
    select 1 from public.app_admins a where a.user_id = auth.uid()
  )
);

create policy "products_update_admin"
on public.products
for update
to authenticated
using (
  exists (
    select 1 from public.app_admins a where a.user_id = auth.uid()
  )
)
with check (
  exists (
    select 1 from public.app_admins a where a.user_id = auth.uid()
  )
);

create policy "products_delete_admin"
on public.products
for delete
to authenticated
using (
  exists (
    select 1 from public.app_admins a where a.user_id = auth.uid()
  )
);
