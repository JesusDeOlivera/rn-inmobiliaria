import 'server-only'
import { createClient } from '@supabase/supabase-js'

// Cliente de Supabase para el SERVIDOR (Server Components, generateMetadata,
// sitemap, route handlers). No persiste sesión: se usa solo para lecturas
// públicas con la anon key.
//
// Si en el futuro necesitás leer datos protegidos por RLS del usuario logueado,
// migrá a @supabase/ssr y leé la cookie de sesión.

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error(
    'Faltan las variables de entorno de Supabase (ver .env.example).'
  )
}

export const supabaseServer = createClient(supabaseUrl, supabaseAnonKey, {
  auth: { persistSession: false, autoRefreshToken: false },
})
