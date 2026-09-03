import { SITE_URL } from '../lib/config'
import { supabaseServer } from '../lib/supabaseServer'
import { listarPropiedades } from '../lib/propiedades'

// Revalida el sitemap cada hora.
export const revalidate = 3600

export default async function sitemap() {
  const rutasBase = ['', '/propiedades', '/catalogo', '/favoritos'].map((ruta) => ({
    url: `${SITE_URL}${ruta}`,
    lastModified: new Date(),
    changeFrequency: ruta === '' ? 'weekly' : 'daily',
    priority: ruta === '' ? 1 : 0.8,
  }))

  try {
    const { data } = await listarPropiedades(supabaseServer)
    const rutasPropiedades = data.map((p) => ({
      url: `${SITE_URL}/propiedad/${p.id}`,
      lastModified: p.created_at ? new Date(p.created_at) : new Date(),
      changeFrequency: 'weekly',
      priority: 0.7,
    }))
    return [...rutasBase, ...rutasPropiedades]
  } catch {
    return rutasBase
  }
}
