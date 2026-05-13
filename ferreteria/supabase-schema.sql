create extension if not exists "pgcrypto";

create table if not exists public.products (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  price numeric(12, 2) not null check (price >= 0),
  unit text not null check (unit in ('unidad', 'metro', 'litro', 'caja')),
  stock integer not null check (stock >= 0),
  image_url text not null,
  category text not null check (category in ('Herramientas', 'Electricidad', 'Plomería', 'Pinturas')),
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

alter table public.products enable row level security;

-- Demo: acceso abierto con anon key (lectura/escritura).
-- Para producción real: reemplazar por auth de Supabase y políticas por usuario/rol.
drop policy if exists "products_select_public" on public.products;
create policy "products_select_public"
on public.products
for select
to anon
using (true);

drop policy if exists "products_insert_public" on public.products;
create policy "products_insert_public"
on public.products
for insert
to anon
with check (true);

drop policy if exists "products_update_public" on public.products;
create policy "products_update_public"
on public.products
for update
to anon
using (true)
with check (true);

drop policy if exists "products_delete_public" on public.products;
create policy "products_delete_public"
on public.products
for delete
to anon
using (true);
