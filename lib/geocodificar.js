import 'server-only'

// =============================================================
//  Geocodificación de direcciones con Nominatim (OpenStreetMap).
//  Gratis y sin API key. Su política de uso pide:
//    - User-Agent identificable
//    - máximo 1 consulta por segundo
//  Por eso corre solo en el servidor (route handler), nunca en el browser.
// =============================================================

const NOMINATIM = 'https://nominatim.openstreetmap.org/search'
const USER_AGENT = 'rn-inmobiliaria/1.0 (https://rn-inmobiliaria.vercel.app)'

export { CENTRO_POSADAS } from './constantes-mapa'

// Si el match de calle cae a más de esta distancia del barrio declarado,
// desconfiamos: en Posadas hay calles con el mismo nombre en zonas distintas
// y un pin en el lugar equivocado es peor que uno aproximado pero correcto.
const KM_MAX_DESVIO = 2.5

/** Distancia aproximada en km entre dos puntos (fórmula de haversine). */
function distanciaKm(a, b) {
  const R = 6371
  const dLat = ((b.lat - a.lat) * Math.PI) / 180
  const dLng = ((b.lng - a.lng) * Math.PI) / 180
  const lat1 = (a.lat * Math.PI) / 180
  const lat2 = (b.lat * Math.PI) / 180
  const h =
    Math.sin(dLat / 2) ** 2 +
    Math.sin(dLng / 2) ** 2 * Math.cos(lat1) * Math.cos(lat2)
  return 2 * R * Math.asin(Math.sqrt(h))
}

/**
 * Convierte una dirección de texto libre en coordenadas.
 *
 * Las direcciones cargadas suelen ser imprecisas ("Lopez y Planes y Las Heras"),
 * así que se prueba calle y barrio por separado y se contrastan: si el match de
 * calle queda lejos del barrio declarado, gana el barrio.
 *
 * @param {string} direccion
 * @param {string} [zona] barrio
 * @returns {Promise<{lat: number, lng: number, etiqueta: string, precision: 'calle'|'barrio'}|null>}
 */
export async function geocodificar(direccion, zona) {
  const limpia = (direccion || '').trim()

  const porCalle = limpia
    ? await consultarNominatim(`${limpia}, Posadas, Misiones, Argentina`)
    : null

  const porBarrio = zona
    ? await consultarNominatim(`${zona}, Posadas, Misiones, Argentina`)
    : null

  // Solo uno de los dos resolvió.
  if (porCalle && !porBarrio) return { ...porCalle, precision: 'calle' }
  if (!porCalle && porBarrio) return { ...porBarrio, precision: 'barrio' }
  if (!porCalle && !porBarrio) return null

  // Ambos resolvieron: nos quedamos con la calle solo si es coherente
  // con el barrio declarado.
  return distanciaKm(porCalle, porBarrio) <= KM_MAX_DESVIO
    ? { ...porCalle, precision: 'calle' }
    : { ...porBarrio, precision: 'barrio' }
}

async function consultarNominatim(consulta) {
  const url = new URL(NOMINATIM)
  url.searchParams.set('format', 'json')
  url.searchParams.set('limit', '1')
  url.searchParams.set('countrycodes', 'ar')
  url.searchParams.set('q', consulta)

  try {
    const res = await fetch(url, {
      headers: { 'User-Agent': USER_AGENT, 'Accept-Language': 'es' },
      // Cacheamos: la misma dirección siempre da el mismo punto.
      next: { revalidate: 60 * 60 * 24 * 30 },
    })
    if (!res.ok) return null

    const datos = await res.json()
    const primero = Array.isArray(datos) ? datos[0] : null
    if (!primero) return null

    const lat = Number(primero.lat)
    const lng = Number(primero.lon)
    if (Number.isNaN(lat) || Number.isNaN(lng)) return null

    return { lat, lng, etiqueta: primero.display_name || consulta }
  } catch {
    return null
  }
}
