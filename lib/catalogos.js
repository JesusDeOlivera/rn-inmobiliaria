// =============================================================
//  Catálogos del modelo: LOCALIDAD, BARRIO, TIPO_INMUEBLE y AGENTE.
//
//  Antes las listas de barrios y tipos vivían hardcodeadas en
//  lib/barrios.js. Ahora la fuente de verdad es la base (RN-09: el
//  administrador gestiona estos catálogos), y esto los consulta.
// =============================================================

/**
 * Barrios agrupados por localidad, listos para <optgroup>.
 * @returns {Promise<{ data: Array<{label: string, barrios: Array<{id: number, nombre: string}>}>, error: string|null }>}
 */
export async function listarBarriosAgrupados(client) {
  const { data, error } = await client
    .from('barrios')
    .select('id_barrio, nombre, localidades ( id_localidad, nombre )')
    .order('nombre')

  if (error) return { data: [], error: error.message }

  // Agrupamos preservando el orden Posadas → Garupá → Candelaria.
  const porLocalidad = new Map()
  for (const b of data) {
    const loc = b.localidades?.nombre || 'Sin localidad'
    if (!porLocalidad.has(loc)) porLocalidad.set(loc, [])
    porLocalidad.get(loc).push({ id: b.id_barrio, nombre: b.nombre })
  }

  const orden = ['Posadas', 'Garupá', 'Candelaria']
  const grupos = [...porLocalidad.entries()]
    .sort((a, b) => {
      const ia = orden.indexOf(a[0]); const ib = orden.indexOf(b[0])
      return (ia === -1 ? 99 : ia) - (ib === -1 ? 99 : ib)
    })
    .map(([label, barrios]) => ({ label: label.toUpperCase(), barrios }))

  return { data: grupos, error: null }
}

/** Tipos de inmueble (RI-02). */
export async function listarTipos(client) {
  const { data, error } = await client
    .from('tipos_inmueble')
    .select('id_tipo, nombre')
    .order('nombre')
  return { data: data || [], error: error ? error.message : null }
}

/** Localidades (RI-03). */
export async function listarLocalidades(client) {
  const { data, error } = await client
    .from('localidades')
    .select('id_localidad, nombre')
    .order('id_localidad')
  return { data: data || [], error: error ? error.message : null }
}

/** Agentes disponibles para asignar como responsables (RN-04). */
export async function listarAgentes(client) {
  const { data, error } = await client
    .from('agentes')
    .select('id_usuario, matricula, usuarios ( nombre, email )')

  if (error) return { data: [], error: error.message }

  return {
    data: (data || []).map((a) => ({
      id: a.id_usuario,
      nombre: a.usuarios?.nombre || a.usuarios?.email || 'Agente',
      email: a.usuarios?.email || null,
      matricula: a.matricula || null,
    })),
    error: null,
  }
}
