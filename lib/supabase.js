import { createClient } from '@supabase/supabase-js'

// Cliente de Supabase para el NAVEGADOR (client components).
// Mantiene la sesión del usuario en el storage del browser.

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error(
    'Faltan las variables de entorno de Supabase. ' +
      'Definí NEXT_PUBLIC_SUPABASE_URL y NEXT_PUBLIC_SUPABASE_ANON_KEY ' +
      '(ver .env.example).'
  )
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey)
