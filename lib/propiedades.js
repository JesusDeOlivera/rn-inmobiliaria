// =============================================================
//  Capa de acceso a datos de "propiedades".
//  Centraliza las consultas a Supabase y el manejo de errores,
//  para que las páginas no repitan .from('propiedades')...
// =============================================================

/**
 * @typedef {Object} Propiedad
 * @property {string|number} id
 * @property {string} titulo
 * @property {string} descripcion
 * @property {number} precio
 * @property {'USD'|'ARS'} moneda
 * @property {string} tipo
 * @property {string} zona
 * @property {string} [direccion]
 * @property {string[]} imagenes
 * @property {number} habitaciones
 * @property {number} banos
 * @property {number} [metros_cuadrados]
 * @property {'Disponible'|'Reservada'|'Vendida'} estado_interno
 * @property {string} [nombre_vendedor]
 * @property {string} [telefono_vendedor]
 * @property {string} [email_vendedor]
 * @property {string} [created_at]
 */

const TABLA = 'propiedades'

/**
 * Trae propiedades ordenadas por fecha (más nuevas primero).
 * @param {import('@supabase/supabase-js').SupabaseClient} client
 * @param {{ limite?: number }} [opts]
 * @returns {Promise<{ data: Propiedad[], error: string|null }>}
 */
export async function listarPropiedades(client, { limite } = {}) {
  let query = client
    .from(TABLA)
    .select('*')
    .order('created_at', { ascending: false })
  if (limite) query = query.limit(limite)

  const { data, error } = await query
  return { data: data || [], error: error ? error.message : null }
}

/**
 * Trae una propiedad por id.
 * @param {import('@supabase/supabase-js').SupabaseClient} client
 * @param {string|number} id
 * @returns {Promise<{ data: Propiedad|null, error: string|null }>}
 */
export async function obtenerPropiedad(client, id) {
  const { data, error } = await client
    .from(TABLA)
    .select('*')
    .eq('id', id)
    .single()
  return { data: data || null, error: error ? error.message : null }
}

/**
 * Trae propiedades similares (mismo tipo, distinta a la actual).
 * @param {import('@supabase/supabase-js').SupabaseClient} client
 * @param {Propiedad} propiedad
 * @param {number} [limite]
 */
export async function listarSimilares(client, propiedad, limite = 3) {
  const { data, error } = await client
    .from(TABLA)
    .select('*')
    .eq('tipo', propiedad.tipo)
    .neq('id', propiedad.id)
    .limit(limite)
  return { data: data || [], error: error ? error.message : null }
}

/**
 * Trae varias propiedades por sus ids (para la página de favoritos).
 * @param {import('@supabase/supabase-js').SupabaseClient} client
 * @param {Array<string|number>} ids
 */
export async function listarPorIds(client, ids) {
  if (!ids || ids.length === 0) return { data: [], error: null }
  const { data, error } = await client.from(TABLA).select('*').in('id', ids)
  return { data: data || [], error: error ? error.message : null }
}
