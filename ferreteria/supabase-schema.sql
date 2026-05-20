create extension if not exists "pgcrypto";

create table if not exists public.products (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  price numeric(12, 2) not null check (price >= 0),
  unit text not null check (unit in ('unidad', 'metro', 'litro', 'caja')),
  stock integer not null check (stock >= 0),
  image_url text not null,
  category text not null check (category in ('Herramientas', 'Electricidad', 'Plomería', 'Pinturas', 'Vehículo', 'Varios')),
  description text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists trg_products_updated_at on public.products;
create trigger trg_products_updated_at
before update on public.products
for each row execute function public.set_updated_at();

-- Quién puede usar el panel: filas = user_id de auth.users (creados en Authentication del dashboard).
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

alter table public.products enable row level security;

drop policy if exists "products_select_public" on public.products;
drop policy if exists "products_insert_public" on public.products;
drop policy if exists "products_update_public" on public.products;
drop policy if exists "products_delete_public" on public.products;
drop policy if exists "products_insert_admin" on public.products;
drop policy if exists "products_update_admin" on public.products;
drop policy if exists "products_delete_admin" on public.products;

-- Catálogo: lectura para visitantes (anon) y para sesión autenticada (admin).
create policy "products_select_public"
on public.products
for select
using (true);

-- Escritura solo usuarios en app_admins (JWT de Supabase Auth).
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
