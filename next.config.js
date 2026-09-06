/** @type {import('next').NextConfig} */

// Derivamos el hostname del proyecto Supabase desde la env var,
// con un fallback al proyecto actual para que el build no falle.
let supabaseHost = 'daipvxjkxfxfsmwsoxfr.supabase.co'
try {
  if (process.env.NEXT_PUBLIC_SUPABASE_URL) {
    supabaseHost = new URL(process.env.NEXT_PUBLIC_SUPABASE_URL).hostname
  }
} catch {
  /* URL inválida: usamos el fallback */
}

const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: supabaseHost,
        pathname: '/storage/v1/object/public/**',
      },
      // Imágenes de ejemplo usadas en algunos hero / placeholders.
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
      },
    ],
  },
}

module.exports = nextConfig
