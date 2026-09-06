// =============================================================
//  Capa de acceso a datos de "propiedades".
//  Centraliza las consultas a Supabase y el manejo de errores,
//  para que las páginas no repitan .from('propiedades')...
//
//  IMPORTANTE: todas las consultas públicas filtran por
//  `publicado = true`. La tabla tiene esa columna desde siempre
//  pero ninguna consulta la usaba: los borradores se mostraban
//  en el catálogo público.
// =============================================================

/**
 * @typedef {Object} Propiedad
 * @property {string} id                       uuid
 * @property {string} titulo
 * @property {string|null} descripcion
 * @property {number} precio
 * @property {string|null} moneda              'USD' | 'ARS'
 * @property {string} tipo
 * @property {string} zona
 * @property {string|null} direccion
 * @property {string[]|null} imagenes
 * @property {number|null} habitaciones
 * @property {number|null} banos
 * @property {number|null} metros_cuadrados
 * @property {string|null} estado              columna legacy, duplica estado_interno
 * @property {string|null} estado_interno      'Disponible' | 'Reservada' | 'Vendida'
 * @property {boolean|null} publicado          visible en el sitio público
 * @property {boolean|null} destacado          aparece en el home
 * @property {string|null} nombre_vendedor
 * @property {string|null} telefono_vendedor
 * @property {string|null} email_vendedor
 * @property {string|null} vendedor_asignado
 * @property {string} created_at
 */

const TABLA = 'propiedades'

/** Aplica el filtro de publicadas salvo que se pida explícitamente todo. */
function base(client, { incluirNoPublicadas = false } = {}) {
  const query = client.from(TABLA).select('*')
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
 * Propiedades para el home: primero las marcadas como destacadas y,
 * si no alcanzan, se completan con las más recientes.
 * @param {import('@supabase/supabase-js').SupabaseClient} client
 * @param {number} [limite]
 */
export async function listarDestacadas(client, limite = 3) {
  const { data: destacadas, error } = await base(client)
    .eq('destacado', true)
    .order('created_at', { ascending: false })
    .limit(limite)

  if (error) return { data: [], error: error.message }
  if (destacadas.length >= limite) return { data: destacadas, error: null }

  // Completamos con las más recientes que no estén ya en la lista.
  const yaIncluidas = new Set(destacadas.map((p) => p.id))
  const { data: recientes } = await listarPropiedades(client, {
    limite: limite + destacadas.length,
  })
  const relleno = recientes.filter((p) => !yaIncluidas.has(p.id))

  return {
    data: [...destacadas, ...relleno].slice(0, limite),
    error: null,
  }
}

/**
 * Trae una propiedad por id.
 * @param {import('@supabase/supabase-js').SupabaseClient} client
 * @param {string} id
 * @param {{ incluirNoPublicadas?: boolean }} [opts]
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

/**
 * Trae propiedades similares (mismo tipo, distinta a la actual).
 * @param {import('@supabase/supabase-js').SupabaseClient} client
 * @param {Propiedad} propiedad
 * @param {number} [limite]
 */
export async function listarSimilares(client, propiedad, limite = 3) {
  const { data, error } = await base(client)
    .eq('tipo', propiedad.tipo)
    .neq('id', propiedad.id)
    .limit(limite)
  return { data: data || [], error: error ? error.message : null }
}

/**
 * Trae varias propiedades por sus ids (para la página de favoritos).
 * @param {import('@supabase/supabase-js').SupabaseClient} client
 * @param {string[]} ids
 */
export async function listarPorIds(client, ids) {
  if (!ids || ids.length === 0) return { data: [], error: null }
  const { data, error } = await base(client).in('id', ids)
  return { data: data || [], error: error ? error.message : null }
}
