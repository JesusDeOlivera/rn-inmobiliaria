-- ============================================================
--  RN Inmobiliaria — Seguridad y esquema
--  Proyecto Supabase: daipvxjkxfxfsmwsoxfr
--
--  Ejecutar en el SQL Editor de Supabase.
--
--  CONTEXTO: al auditar el proyecto en producción se encontró que
--  RLS ya estaba activo en `propiedades`, PERO con dos agujeros:
--
--    1. Policy "Permitir insertar propiedades a todos" -> INSERT
--       abierto al rol `public`. Cualquiera con la anon key (que
--       viaja al navegador) podía crear propiedades.
--
--    2. Policy "Public Access" en storage.objects -> cmd = ALL para
--       el rol `public` sobre el bucket imagenes_propiedades.
--       Cualquiera podía subir, sobrescribir y BORRAR las fotos.
--
--  Este script cierra ambos y agrega la tabla `consultas`.
-- ============================================================


-- ------------------------------------------------------------
-- 1) propiedades: cerrar el INSERT público
-- ------------------------------------------------------------
-- SELECT público se mantiene (es un catálogo). UPDATE y DELETE ya
-- estaban correctamente limitados a `authenticated`.

drop policy if exists "Permitir insertar propiedades a todos" on public.propiedades;

drop policy if exists "propiedades_insert_auth" on public.propiedades;
create policy "propiedades_insert_auth"
  on public.propiedades
  for insert
  to authenticated
  with check (true);


-- ------------------------------------------------------------
-- 2) storage: separar lectura pública de escritura autenticada
-- ------------------------------------------------------------
-- "Public Access" era cmd = ALL para public: permitía DELETE de
-- cualquier archivo del bucket a cualquier visitante.

drop policy if exists "Public Access" on storage.objects;
drop policy if exists "Permitir subir imagenes a todos jpvprs_0" on storage.objects;

drop policy if exists "img_props_select_publico" on storage.objects;
create policy "img_props_select_publico"
  on storage.objects
  for select
  to public
  using (bucket_id = 'imagenes_propiedades');

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
  using (bucket_id = 'imagenes_propiedades')
  with check (bucket_id = 'imagenes_propiedades');

drop policy if exists "img_props_delete_auth" on storage.objects;
create policy "img_props_delete_auth"
  on storage.objects
  for delete
  to authenticated
  using (bucket_id = 'imagenes_propiedades');


-- ------------------------------------------------------------
-- 3) storage: límites del bucket
-- ------------------------------------------------------------
-- Estaba sin límite de tamaño ni de tipo MIME: se podía subir
-- cualquier archivo de cualquier peso.

update storage.buckets
set file_size_limit = 10485760,  -- 10 MB
    allowed_mime_types = array['image/jpeg','image/png','image/webp','image/avif']
where id = 'imagenes_propiedades';


-- ------------------------------------------------------------
-- 4) Tabla consultas — leads del formulario de contacto
-- ------------------------------------------------------------
-- OJO: propiedades.id es UUID, no bigint.

create table if not exists public.consultas (
  id           uuid primary key default gen_random_uuid(),
  created_at   timestamptz not null default timezone('utc', now()),
  nombre       text not null,
  email        text,
  telefono     text,
  mensaje      text not null,
  propiedad_id uuid references public.propiedades(id) on delete set null,
  origen       text,                       -- 'home' | 'propiedad' | etc.
  atendida     boolean not null default false
);

create index if not exists consultas_created_at_idx
  on public.consultas (created_at desc);

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
-- 5) Índices y default del teléfono
-- ------------------------------------------------------------
-- El catálogo público filtra por publicado y ordena por fecha.
create index if not exists propiedades_publicado_created_idx
  on public.propiedades (publicado, created_at desc);

create index if not exists propiedades_destacado_idx
  on public.propiedades (destacado)
  where destacado = true;

-- El default apuntaba al número viejo (5493765067519).
alter table public.propiedades
  alter column telefono_vendedor set default '5493764170186';


-- ------------------------------------------------------------
-- 6) Defensa en profundidad: quitarle a `anon` los GRANT de más
-- ------------------------------------------------------------
-- RLS ya bloquea estas operaciones, pero el rol `anon` seguía
-- teniendo los GRANT de tabla. Si algún día se agrega una policy
-- permisiva por error, los grants siguen frenando el acceso.

-- El sitio público solo LEE propiedades.
revoke insert, update, delete, truncate, references, trigger
  on public.propiedades from anon;

-- El formulario de contacto solo INSERTA consultas.
-- Sin SELECT: los leads no deben poder leerse sin iniciar sesión.
-- (supabase-js usa Prefer: return=minimal salvo que encadenes
--  .select(), así que el insert sigue funcionando sin SELECT.)
revoke select, update, delete, truncate, references, trigger
  on public.consultas from anon;


-- ------------------------------------------------------------
-- 7) Limpieza pendiente (NO se ejecuta: revisar antes)
-- ------------------------------------------------------------
-- La tabla tiene DOS columnas de estado: `estado` (legacy) y
-- `estado_interno` (la que usa la app). El panel ahora las mantiene
-- sincronizadas. Cuando confirmes que nada más lee `estado`:
--
--   alter table public.propiedades drop column estado;
