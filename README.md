# RN Inmobiliaria

Sitio web de RN Inmobiliaria (Posadas, Misiones). Catálogo público de
propiedades en venta + panel de administración para cargar y gestionar el
listado.

## Stack

- **Next.js 16** (App Router)
- **React 19**
- **Supabase** — base de datos (`propiedades`, `consultas`), auth del panel y
  storage de imágenes (`imagenes_propiedades`)
- **Tailwind CSS 4** (usado en `/login`; el resto usa estilos inline)

## Puesta en marcha

```bash
# 1. Instalar dependencias
npm install

# 2. Configurar variables de entorno
cp .env.example .env.local   # y completar los valores

# 3. Levantar el servidor de desarrollo
npm run dev
```

Abrir http://localhost:3000

### Variables de entorno

Ver [`.env.example`](.env.example). Las obligatorias son
`NEXT_PUBLIC_SUPABASE_URL` y `NEXT_PUBLIC_SUPABASE_ANON_KEY`.

### Base de datos

Ejecutar [`supabase/schema.sql`](supabase/schema.sql) en el SQL Editor de
Supabase. Ese script activa **Row Level Security** (sin él, cualquiera con la
anon key puede editar/borrar propiedades), crea la tabla `consultas` para los
leads del formulario de contacto y define las políticas del bucket de imágenes.

## Estructura

```
app/
  page.js                 Home (hero, destacadas, servicios, contacto)
  propiedades/            Catálogo con filtros simples
  catalogo/               Búsqueda avanzada (filtros + vista mapa)
  propiedad/[id]/         Ficha de propiedad (+ metadata OG dinámica)
  favoritos/              Favoritos guardados en localStorage
  login/                  Login del panel (Supabase Auth)
  admin/                  Panel: alta / edición / baja / estado
  sitemap.js, robots.js   SEO
lib/
  config.js               Contactos, URLs, WhatsApp (centralizado)
  barrios.js              Listas de barrios y tipos de inmueble
  supabase.js             Cliente para el navegador
  supabaseServer.js       Cliente para el servidor (metadata, sitemap)
  propiedades.js          Consultas a la tabla `propiedades`
  format.js               formatPrecio / waLink / placeholder de imagen
  useFavoritos.js         Hook de favoritos (sincroniza entre pestañas)
  useSesion.js            Hook de sesión de Supabase
components/
  Navbar.js               Navbar compartido
  Spinner.js              Estado de carga
supabase/
  schema.sql              RLS + tabla consultas + políticas de storage
```

## Scripts

| Comando         | Descripción                     |
| --------------- | ------------------------------- |
| `npm run dev`   | Servidor de desarrollo          |
| `npm run build` | Build de producción             |
| `npm run start` | Sirve el build                  |
| `npm run lint`  | ESLint                          |

## Deploy

Pensado para **Vercel**. Cargar las variables de entorno en el proyecto y
apuntar el dominio final en `NEXT_PUBLIC_SITE_URL`.

## Arquitectura de renderizado

Las páginas públicas son **Server Components**: traen los datos en el servidor
con `supabaseServer` y se los pasan como props a componentes cliente chicos que
solo aportan interactividad (`FormularioContacto`, `BotonFavorito`,
`GaleriaPropiedad`, los filtros del catálogo).

Esto importa para SEO: antes todo era `'use client'` con el fetch en un
`useEffect`, así que el HTML que recibía Google no contenía ninguna propiedad.

- `/`, `/propiedades`, `/catalogo` → estáticas con ISR de 60s
- `/propiedad/[id]` → `generateStaticParams` pre-genera una página por
  propiedad publicada; las nuevas se renderizan on-demand y quedan cacheadas
- La ficha incluye JSON-LD (`schema.org/RealEstateListing`)

> **Ojo con `loading.js`**: agregar uno en estas rutas reintroduce un límite de
> Suspense que deja todo el `<main>` dentro de un `<div hidden>` a la espera de
> un swap por JavaScript. Como las páginas ya están cacheadas por ISR no aporta
> nada y perjudica a los crawlers que no ejecutan JS.

## Pendiente / ideas

- Paginar el catálogo desde Supabase en lugar de traer todo y filtrar en el
  navegador (hoy alcanza de sobra; importa a partir de ~200 propiedades).
- Reemplazar `confirm()` del panel por un modal propio.
- Borrar la columna legacy `estado` (ver el final de `supabase/schema.sql`).
- Activar "Leaked password protection" en Supabase Auth — **requiere plan Pro**;
  en Free se puede subir el largo mínimo y exigir caracteres.
