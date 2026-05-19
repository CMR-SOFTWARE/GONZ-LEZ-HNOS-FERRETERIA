-- =============================================================================
-- Arreglo: admin no puede crear / editar / borrar productos ni subir fotos
-- Ejecutar en Supabase → SQL Editor (proyecto ldyaktxwgzurxgnjkeag)
-- =============================================================================

-- Función auxiliar (evita fallos raros de RLS al comprobar app_admins)
create or replace function public.is_app_admin()
returns boolean
language sql
security definer
set search_path = public
stable
as $$
  select exists (
    select 1 from public.app_admins where user_id = auth.uid()
  );
$$;

revoke all on function public.is_app_admin() from public;
grant execute on function public.is_app_admin() to authenticated;

-- ----- Tabla products -----
alter table public.products enable row level security;

drop policy if exists "products_select_public" on public.products;
drop policy if exists "products_insert_public" on public.products;
drop policy if exists "products_update_public" on public.products;
drop policy if exists "products_delete_public" on public.products;
drop policy if exists "products_insert_admin" on public.products;
drop policy if exists "products_update_admin" on public.products;
drop policy if exists "products_delete_admin" on public.products;

create policy "products_select_public"
on public.products for select
using (true);

create policy "products_insert_admin"
on public.products for insert
to authenticated
with check (public.is_app_admin());

create policy "products_update_admin"
on public.products for update
to authenticated
using (public.is_app_admin())
with check (public.is_app_admin());

create policy "products_delete_admin"
on public.products for delete
to authenticated
using (public.is_app_admin());

-- ----- app_admins -----
alter table public.app_admins enable row level security;

drop policy if exists "app_admins_self_read" on public.app_admins;
create policy "app_admins_self_read"
on public.app_admins for select
to authenticated
using (user_id = auth.uid());

-- ----- Storage: bucket product-images -----
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'product-images',
  'product-images',
  true,
  5242880,
  array['image/jpeg', 'image/png', 'image/webp']
)
on conflict (id) do update set
  public = excluded.public,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

drop policy if exists "product_images_public_read" on storage.objects;
drop policy if exists "product_images_admin_insert" on storage.objects;
drop policy if exists "product_images_admin_update" on storage.objects;
drop policy if exists "product_images_admin_delete" on storage.objects;
drop policy if exists "product_images_admin_all" on storage.objects;

create policy "product_images_public_read"
on storage.objects for select
to public
using (bucket_id = 'product-images');

create policy "product_images_admin_all"
on storage.objects for all
to authenticated
using (bucket_id = 'product-images' and public.is_app_admin())
with check (bucket_id = 'product-images' and public.is_app_admin());

-- ----- Registrar tu usuario admin (REEMPLAZÁ el UUID) -----
-- Authentication → Users → User UID → pegar abajo y ejecutar solo estas 3 líneas:

-- insert into public.app_admins (user_id) values
--   ('TU-UUID-AQUI')
-- on conflict (user_id) do nothing;

-- Ver admins:
-- select user_id from public.app_admins;
