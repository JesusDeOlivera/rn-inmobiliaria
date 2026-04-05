import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

// Si las variables no están (pasa a veces en el build), usamos un link de backup 
// para que el proceso no explote. Total, en vivo sí usará las reales.
export const supabase = createClient(
  supabaseUrl || 'https://daipvxjkxfxfsmwsoxfr.supabase.co', 
  supabaseAnonKey || 'placeholder-key'
)