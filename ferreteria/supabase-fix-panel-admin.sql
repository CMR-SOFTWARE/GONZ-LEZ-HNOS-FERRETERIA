-- =============================================================================
-- Arreglo del panel admin + RLS en Supabase (WebMarket Ferretería)
-- =============================================================================
-- Dónde ejecutarlo: Supabase → SQL Editor → New query → Run
-- Orden: primero la SECCIÓN 1 (esquema + políticas). Después la SECCIÓN 2
-- (agregar administradores con tu UUID de Authentication → Users).
--
-- El UUID lo copiás en: Authentication → Users → clic en el usuario → "User UID"
-- =============================================================================

-- -----------------------------------------------------------------------------
-- SECCIÓN 1 — Tablas, trigger y políticas RLS (idempotente: podés re-ejecutar)
-- -----------------------------------------------------------------------------

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

-- Cualquiera puede leer el catálogo (tienda + panel cargan la lista).
create policy "products_select_public"
on public.products
for select
using (true);

-- Solo quien esté en app_admins puede crear / editar / borrar productos (logueado).
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

-- -----------------------------------------------------------------------------
-- SECCIÓN 2 — Registrar administrador(es) del negocio
-- -----------------------------------------------------------------------------
-- Reemplazá los UUID de ejemplo por el/los "User UID" de Authentication.
-- ON CONFLICT DO NOTHING evita el error "duplicate key" si ya estaba cargado.
-- Podés duplicar la línea insert para varios dueños o empleados.
-- -----------------------------------------------------------------------------

-- 1) Copiá tu User UID desde: Authentication → Users → (tu usuario).
-- 2) Descomentá las 3 líneas de abajo y pegá el UUID entre comillas.
-- 3) Ejecutá solo ese bloque (o todo el archivo si ya descomentaste).
-- ON CONFLICT DO NOTHING = si ya estabas en app_admins, no da error.

-- insert into public.app_admins (user_id) values
--   ('xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx')
-- on conflict (user_id) do nothing;

-- Más de un admin: otra query igual con otro UUID.

-- -----------------------------------------------------------------------------
-- SECCIÓN 3 — Comprobaciones (opcional, ejecutá aparte si querés ver estado)
-- -----------------------------------------------------------------------------

-- select user_id from public.app_admins;
-- select id, email, created_at from auth.users order by created_at desc;
