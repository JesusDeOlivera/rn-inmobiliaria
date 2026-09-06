// =============================================================
//  Capa de acceso a datos del catálogo.
//
//  Lee de la VISTA `v_propiedades`, que resuelve los joins del modelo
//  normalizado (barrio -> localidad, tipo, agente, imágenes) y calcula
//  el atributo derivado `precio_pesos` (RN-08).
//
//  Las escrituras NO van por acá: la vista tiene joins y no es
//  actualizable. El panel escribe sobre las tablas base (ver lib/admin.js).
// =============================================================

/**
 * @typedef {Object} Propiedad
 * @property {string} id                       uuid
 * @property {string} titulo
 * @property {string|null} descripcion
 * @property {number} precio
 * @property {'USD'|'ARS'} moneda
 * @property {number|null} precio_pesos        DERIVADO: no se persiste
 * @property {string} estado                   'Disponible' | 'Reservada' | 'Vendida'
 * @property {number|null} dormitorios
 * @property {number|null} banos
 * @property {number|null} superficie_m2
 * @property {string|null} calle               subatributo de `direccion`
 * @property {string|null} altura              subatributo de `direccion`
 * @property {string|null} direccion           dirección completa (texto original)
 * @property {string} fecha_publicacion
 * @property {number} id_barrio
 * @property {string} barrio
 * @property {number} id_localidad
 * @property {string} localidad
 * @property {number} id_tipo
 * @property {string} tipo
 * @property {string} id_agente
 * @property {string} agente_nombre
 * @property {string|null} agente_email
 * @property {string|null} agente_telefono
 * @property {string[]|null} imagenes
 * @property {string|null} imagen_portada
 * @property {number|null} latitud
 * @property {number|null} longitud
 * @property {boolean|null} publicado
 * @property {boolean|null} destacado
 * @property {string} created_at
 */

const VISTA = 'v_propiedades'

/** Aplica el filtro de publicadas salvo que se pida explícitamente todo. */
function base(client, { incluirNoPublicadas = false } = {}) {
  const query = client.from(VISTA).select('*')
  return incluirNoPublicadas ? query : query.eq('publicado', true)
}

/**
 * Trae propiedades ordenadas por fecha (más nuevas primero).
 * @param {import('@supabase/supabase-js').SupabaseClient} client
 * @param {{ limite?: number, incluirNoPublicadas?: boolean }} [opts]
 * @returns {Promise<{ data: Propiedad[], error: string|null }>}
 */
export async function listarPropiedades(client, opts = {}) {
  let query = base(client, opts).order('created_at', { ascending: false })
  if (opts.limite) query = query.limit(opts.limite)

  const { data, error } = await query
  return { data: data || [], error: error ? error.message : null }
}

/**
 * Propiedades para el home: primero las destacadas y, si no alcanzan, se
 * completa con las más recientes.
 */
export async function listarDestacadas(client, limite = 3) {
  const { data: destacadas, error } = await base(client)
    .eq('destacado', true)
    .order('created_at', { ascending: false })
    .limit(limite)

  if (error) return { data: [], error: error.message }
  if (destacadas.length >= limite) return { data: destacadas, error: null }

  const yaIncluidas = new Set(destacadas.map((p) => p.id))
  const { data: recientes } = await listarPropiedades(client, {
    limite: limite + destacadas.length,
  })
  const relleno = recientes.filter((p) => !yaIncluidas.has(p.id))

  return { data: [...destacadas, ...relleno].slice(0, limite), error: null }
}

/**
 * Trae una propiedad por id.
 * @returns {Promise<{ data: Propiedad|null, error: string|null, noEncontrada: boolean }>}
 */
export async function obtenerPropiedad(client, id, opts = {}) {
  const { data, error } = await base(client, opts).eq('id', id).maybeSingle()
  return {
    data: data || null,
    error: error ? error.message : null,
    noEncontrada: !error && !data,
  }
}

/** Propiedades similares: mismo tipo, distinta a la actual. */
export async function listarSimilares(client, propiedad, limite = 3) {
  const { data, error } = await base(client)
    .eq('id_tipo', propiedad.id_tipo)
    .neq('id', propiedad.id)
    .limit(limite)
  return { data: data || [], error: error ? error.message : null }
}

/** Varias propiedades por sus ids (página de favoritos). */
export async function listarPorIds(client, ids) {
  if (!ids || ids.length === 0) return { data: [], error: null }
  const { data, error } = await base(client).in('id', ids)
  return { data: data || [], error: error ? error.message : null }
}
