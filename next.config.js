/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export',        // ← ESTO genera archivos estáticos (HTML)
  distDir: 'dist',         // ← Carpeta donde quedarán los archivos
  images: {
    unoptimized: true,     // ← Necesario para export estático
  },
  // Si tienes rutas dinámicas como /propiedad/[id], añade esto:
  trailingSlash: true,     // ← Genera carpetas con index.html
}

module.exports = nextConfig