-- Ejecutar TODO este archivo en Supabase → SQL Editor (una sola vez, o después de borrar el usuario anterior).
-- Crea la tabla app_admins (si falta), el usuario de Auth + identidad + fila en app_admins.
--
-- Para que el admin pueda cargar/editar productos, la tabla public.products debe tener
-- las políticas RLS de administrador (ver supabase-schema.sql o supabase-migration-to-admin-auth.sql).
--
-- En el sitio podés iniciar sesión con:
--   Usuario: HermanosGonzalez   (sin @; se convierte a correo interno)
--   Contraseña: (la que configuraste en Supabase Authentication → Users)
--
-- El correo guardado en Supabase es: hermanosgonzalez@ferreteria.local
-- Si este script falla por columnas distintas en tu proyecto, creá el usuario
-- en Authentication → Users con ese correo y contraseña, y ejecutá solo:
--   insert into public.app_admins (user_id) values ('<uuid del usuario>');

create extension if not exists "pgcrypto";

-- Tabla de administradores (necesaria para el panel). Creala si aún no existe.
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

do $$
declare
  v_user_id uuid := gen_random_uuid();
  v_email text := 'hermanosgonzalez@ferreteria.local';
  v_password text := 'REEMPLAZAR_CON_CONTRASEÑA_REAL';
  v_encrypted text := crypt(v_password, gen_salt('bf'));
begin
  delete from public.app_admins
  where user_id in (select id from auth.users where lower(email) = lower(v_email));

  delete from auth.identities
  where user_id in (select id from auth.users where lower(email) = lower(v_email));

  delete from auth.users
  where lower(email) = lower(v_email);

  insert into auth.users (
    instance_id,
    id,
    aud,
    role,
    email,
    encrypted_password,
    email_confirmed_at,
    invited_at,
    confirmation_token,
    confirmation_sent_at,
    recovery_token,
    recovery_sent_at,
    email_change_token_new,
    email_change,
    email_change_sent_at,
    last_sign_in_at,
    raw_app_meta_data,
    raw_user_meta_data,
    is_super_admin,
    created_at,
    updated_at,
    phone,
    phone_confirmed_at,
    phone_change,
    phone_change_token,
    phone_change_sent_at,
    email_change_token_current,
    email_change_confirm_status,
    banned_until,
    reauthentication_token,
    reauthentication_sent_at,
    is_sso_user
  ) values (
    '00000000-0000-0000-0000-000000000000',
    v_user_id,
    'authenticated',
    'authenticated',
    v_email,
    v_encrypted,
    now(),
    null,
    '',
    now(),
    '',
    null,
    '',
    '',
    null,
    now(),
    '{"provider":"email","providers":["email"]}'::jsonb,
    '{}'::jsonb,
    null,
    now(),
    now(),
    null,
    null,
    '',
    '',
    null,
    '',
    0,
    null,
    '',
    null,
    false
  );

  insert into auth.identities (
    id,
    user_id,
    identity_data,
    provider,
    provider_id,
    last_sign_in_at,
    created_at,
    updated_at
  ) values (
    gen_random_uuid(),
    v_user_id,
    jsonb_build_object('sub', v_user_id::text, 'email', v_email),
    'email',
    v_user_id::text,
    now(),
    now(),
    now()
  );

  insert into public.app_admins (user_id)
  values (v_user_id)
  on conflict (user_id) do nothing;
end $$;
