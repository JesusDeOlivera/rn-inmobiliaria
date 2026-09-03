-- ============================================================
--  RN Inmobiliaria — Esquema y políticas de seguridad (RLS)
--
--  Ejecutar en el SQL Editor de Supabase.
--  IMPORTANTE: sin estas políticas, cualquiera con la anon key
--  (que viaja al navegador) puede insertar/editar/borrar
--  propiedades. El chequeo de sesión en /admin es solo visual.
-- ============================================================

-- ------------------------------------------------------------
-- 1) Tabla propiedades — RLS
-- ------------------------------------------------------------
alter table public.propiedades enable row level security;

-- Lectura pública (catálogo).
drop policy if exists "propiedades_select_publico" on public.propiedades;
create policy "propiedades_select_publico"
  on public.propiedades
  for select
  using (true);

-- Escritura solo para usuarios autenticados (admins que iniciaron sesión).
drop policy if exists "propiedades_insert_auth" on public.propiedades;
create policy "propiedades_insert_auth"
  on public.propiedades
  for insert
  to authenticated
  with check (true);

drop policy if exists "propiedades_update_auth" on public.propiedades;
create policy "propiedades_update_auth"
  on public.propiedades
  for update
  to authenticated
  using (true)
  with check (true);

drop policy if exists "propiedades_delete_auth" on public.propiedades;
create policy "propiedades_delete_auth"
  on public.propiedades
  for delete
  to authenticated
  using (true);

-- (Opcional, más estricto) Si querés limitar a una lista de admins,
-- creá una tabla public.admins(user_id uuid primary key) y reemplazá
-- "to authenticated ... using (true)" por:
--   using (auth.uid() in (select user_id from public.admins))


-- ------------------------------------------------------------
-- 2) Tabla consultas — leads del formulario de contacto
-- ------------------------------------------------------------
create table if not exists public.consultas (
  id           bigint generated always as identity primary key,
  created_at   timestamptz not null default now(),
  nombre       text not null,
  email        text,
  telefono     text,
  mensaje      text not null,
  propiedad_id bigint references public.propiedades(id) on delete set null,
  origen       text,                       -- 'home' | 'propiedad' | etc.
  atendida     boolean not null default false
);

alter table public.consultas enable row level security;

-- Cualquiera puede CREAR una consulta (enviar el formulario)...
drop policy if exists "consultas_insert_publico" on public.consultas;
create policy "consultas_insert_publico"
  on public.consultas
  for insert
  to anon, authenticated
  with check (true);

-- ...pero solo los admins autenticados pueden LEERLAS.
drop policy if exists "consultas_select_auth" on public.consultas;
create policy "consultas_select_auth"
  on public.consultas
  for select
  to authenticated
  using (true);

drop policy if exists "consultas_update_auth" on public.consultas;
create policy "consultas_update_auth"
  on public.consultas
  for update
  to authenticated
  using (true)
  with check (true);


-- ------------------------------------------------------------
-- 3) Storage — bucket imagenes_propiedades
-- ------------------------------------------------------------
-- Asegurate de que el bucket exista y sea público para lectura:
--   insert into storage.buckets (id, name, public)
--   values ('imagenes_propiedades', 'imagenes_propiedades', true)
--   on conflict (id) do update set public = true;

-- Lectura pública de las imágenes.
drop policy if exists "img_props_select_publico" on storage.objects;
create policy "img_props_select_publico"
  on storage.objects
  for select
  using (bucket_id = 'imagenes_propiedades');

-- Subida / borrado solo para autenticados.
drop policy if exists "img_props_insert_auth" on storage.objects;
create policy "img_props_insert_auth"
  on storage.objects
  for insert
  to authenticated
  with check (bucket_id = 'imagenes_propiedades');

drop policy if exists "img_props_update_auth" on storage.objects;
create policy "img_props_update_auth"
  on storage.objects
  for update
  to authenticated
  using (bucket_id = 'imagenes_propiedades');

drop policy if exists "img_props_delete_auth" on storage.objects;
create policy "img_props_delete_auth"
  on storage.objects
  for delete
  to authenticated
  using (bucket_id = 'imagenes_propiedades');
