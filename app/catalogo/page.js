import { supabaseServer } from '../../lib/supabaseServer'
import { listarPropiedades } from '../../lib/propiedades'
import CatalogoCliente from './catalogo-cliente'

// Server Component: los datos se traen en el servidor; el cliente solo filtra.
export const revalidate = 60

export const metadata = {
  title: 'Búsqueda avanzada de propiedades',
  description:
    'Filtrá propiedades en Misiones por precio, superficie, ambientes, tipo y ubicación. Vista en grilla o mapa.',
}

export default async function CatalogoPage() {
  const { data: propiedades } = await listarPropiedades(supabaseServer)
  return <CatalogoCliente propiedades={propiedades} />
}
