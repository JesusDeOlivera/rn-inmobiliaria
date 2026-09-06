// =============================================================
//  Escrituras del panel sobre el modelo normalizado.
//
//  La vista `v_propiedades` tiene joins y no es actualizable, así que
//  el alta/edición escribe sobre `propiedades` y `imagenes` por separado.
// =============================================================

/**
 * Separa una dirección de texto libre en los subatributos del compuesto
 * `direccion`: si termina en número, ese número es la altura.
 * @param {string} direccion
 * @returns {{calle: string|null, altura: string|null}}
 */
export function separarDireccion(direccion) {
  const texto = (direccion || '').trim()
  if (!texto) return { calle: null, altura: null }

  const m = texto.match(/^(.*?)[\s,]+(\d+)$/)
  if (m) return { calle: m[1].trim(), altura: m[2] }
  return { calle: texto, altura: null }
}

/**
 * Reemplaza la galería de una propiedad (entidad débil IMAGEN).
 * La primera pasa a ser la portada — RN-06: solo una portada.
 */
export async function guardarImagenes(client, idPropiedad, urls) {
  const { error: errBorrado } = await client
    .from('imagenes')
    .delete()
    .eq('id_propiedad', idPropiedad)
  if (errBorrado) return { error: errBorrado.message }

  if (!urls || urls.length === 0) return { error: null }

  const filas = urls.map((url, i) => ({
    id_propiedad: idPropiedad,
    nro_orden: i + 1,
    url,
    es_portada: i === 0,
  }))

  const { error } = await client.from('imagenes').insert(filas)
  return { error: error ? error.message : null }
}

/**
 * Alta o edición de una propiedad.
 * @param {object} client
 * @param {object} datos  campos ya normalizados del formulario
 * @param {string|null} id  si viene, es edición
 * @returns {Promise<{ id: string|null, error: string|null }>}
 */
export async function guardarPropiedad(client, datos, id = null) {
  const { calle, altura } = separarDireccion(datos.direccion)

  const fila = {
    titulo: datos.titulo,
    descripcion: datos.descripcion,
    precio: parseFloat(datos.precio) || 0,
    moneda: datos.moneda,
    estado_interno: datos.estado,
    // `estado` es la columna legacy que duplica `estado_interno`.
    estado: datos.estado,
    habitaciones: parseInt(datos.dormitorios, 10) || 0,
    banos: parseInt(datos.banos, 10) || 0,
    metros_cuadrados: parseFloat(datos.superficie_m2) || 0,
    direccion: datos.direccion || null,
    calle,
    altura,
    id_barrio: Number(datos.id_barrio),
    id_tipo: Number(datos.id_tipo),
    id_agente: datos.id_agente,
    latitud: datos.latitud ?? null,
    longitud: datos.longitud ?? null,
    publicado: Boolean(datos.publicado),
    destacado: Boolean(datos.destacado),
  }

  if (id) {
    const { error } = await client.from('propiedades').update(fila).eq('id', id)
    return { id, error: error ? error.message : null }
  }

  const { data, error } = await client
    .from('propiedades')
    .insert([fila])
    .select('id')
    .single()

  return { id: data?.id || null, error: error ? error.message : null }
}

/** Borra una propiedad. Las imágenes caen por ON DELETE CASCADE. */
export async function borrarPropiedad(client, id) {
  const { error } = await client.from('propiedades').delete().eq('id', id)
  return { error: error ? error.message : null }
}

/** Cambio rápido de estado desde el listado. */
export async function cambiarEstado(client, id, estado) {
  const { error } = await client
    .from('propiedades')
    .update({ estado_interno: estado, estado })
    .eq('id', id)
  return { error: error ? error.message : null }
}

/** Publicar / despublicar. */
export async function cambiarPublicado(client, id, publicado) {
  const { error } = await client.from('propiedades').update({ publicado }).eq('id', id)
  return { error: error ? error.message : null }
}
