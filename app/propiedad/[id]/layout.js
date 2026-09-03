import { supabaseServer } from '../../../lib/supabaseServer'
import { obtenerPropiedad } from '../../../lib/propiedades'
import { SITE_URL, SITE_NAME } from '../../../lib/config'
import { formatPrecio, imagenPrincipal } from '../../../lib/format'

// Corre en el servidor: genera el título / descripción / imagen que ven
// WhatsApp, Google y las redes al compartir el link de una propiedad.
// En Next 16 `params` es una promesa: hay que await-earla.
export async function generateMetadata({ params }) {
  const { id } = await params

  const { data: propiedad } = await obtenerPropiedad(supabaseServer, id)

  if (!propiedad) {
    return {
      title: 'Propiedad no encontrada',
      description: 'Esta propiedad ya no está disponible.',
    }
  }

  const titulo = `${propiedad.titulo} en ${propiedad.zona}`
  const descripcion = `${formatPrecio(propiedad)} | ${propiedad.habitaciones} dorm., ${propiedad.banos} baños. Mirá más fotos y detalles en ${SITE_NAME}.`
  const imagen = imagenPrincipal(propiedad)
  const url = `${SITE_URL}/propiedad/${propiedad.id}`

  return {
    title: titulo,
    description: descripcion,
    alternates: { canonical: url },
    openGraph: {
      title: titulo,
      description: descripcion,
      url,
      siteName: SITE_NAME,
      images: [{ url: imagen, width: 1200, height: 630, alt: titulo }],
      locale: 'es_AR',
      type: 'website',
    },
    twitter: {
      card: 'summary_large_image',
      title: titulo,
      description: descripcion,
      images: [imagen],
    },
  }
}

export default function PropiedadLayout({ children }) {
  return children
}
