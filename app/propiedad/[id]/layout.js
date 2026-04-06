import { supabase } from '../../../lib/supabase'

// Esta función corre en el servidor y le "avisa" a WhatsApp y Google de qué trata la página
export async function generateMetadata({ params }) {
  const id = params.id
  
  // Buscamos los datos de la propiedad directo en la base de datos
  const { data: propiedad } = await supabase
    .from('propiedades')
    .select('*')
    .eq('id', id)
    .single()

  // Si alguien pone un link roto, mostramos esto:
  if (!propiedad) {
    return { 
      title: 'Propiedad no encontrada | RN Inmobiliaria',
      description: 'Esta propiedad ya no está disponible.'
    }
  }

  // Armamos el texto que va a salir en WhatsApp
  const tituloWhatsApp = `${propiedad.titulo} en ${propiedad.zona}`
  
  // Armamos la descripción (Ej: USD 150.000 - 3 Dorm. - 2 Baños)
  const precioFormateado = Number(propiedad.precio).toLocaleString('es-AR')
  const descripcionWhatsApp = `${propiedad.moneda} ${precioFormateado} | ${propiedad.habitaciones} Dormitorios, ${propiedad.banos} Baños. Hacé clic para ver más fotos y detalles en RN Inmobiliaria.`
  
  // Agarramos la primera foto de la casa (o un logo por defecto si no hay foto)
  const imagenWhatsApp = propiedad.imagenes?.[0] || 'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=800&q=80'

  return {
    title: tituloWhatsApp,
    description: descripcionWhatsApp,
    openGraph: {
      title: tituloWhatsApp,
      description: descripcionWhatsApp,
      url: `https://rn-inmobiliaria.vercel.app`, // Acá el día de mañana pones tu .com
      siteName: 'RN Inmobiliaria',
      images: [
        {
          url: imagenWhatsApp,
          width: 800,
          height: 600,
          alt: tituloWhatsApp,
        },
      ],
      locale: 'es_AR',
      type: 'website',
    },
    twitter: {
      card: 'summary_large_image',
      title: tituloWhatsApp,
      description: descripcionWhatsApp,
      images: [imagenWhatsApp],
    },
  }
}

// Este layout simplemente envuelve a tu página actual sin cambiarle el diseño
export default function PropiedadLayout({ children }) {
  return <>{children}</>
}