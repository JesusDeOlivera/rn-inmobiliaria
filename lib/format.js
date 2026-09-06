// =============================================================
//  Helpers de formato reutilizables.
// =============================================================

/**
 * Formatea el precio de una propiedad de forma consistente en toda la app.
 * Si no hay precio (0, null, undefined, NaN) devuelve "Consultar precio".
 * @param {{ precio?: number|string, moneda?: string }} propiedad
 * @returns {string}
 */
export function formatPrecio(propiedad) {
  const valor = Number(propiedad?.precio)
  if (!valor || Number.isNaN(valor) || valor <= 0) return 'Consultar precio'
  const moneda = propiedad?.moneda || 'USD'
  return `${moneda} ${valor.toLocaleString('es-AR')}`
}

/**
 * Arma un link de WhatsApp con texto pre-cargado.
 * @param {string} telefono - solo dígitos, ej "5493765067519"
 * @param {string} texto
 * @returns {string}
 */
export function waLink(telefono, texto = '') {
  const num = String(telefono || '').replace(/\D/g, '')
  const base = `https://wa.me/${num}`
  return texto ? `${base}?text=${encodeURIComponent(texto)}` : base
}

/**
 * Devuelve la primera imagen de una propiedad o un placeholder.
 * @param {{ imagenes?: string[] }} propiedad
 * @returns {string}
 */
export function imagenPrincipal(propiedad) {
  const img = propiedad?.imagenes?.[0]
  return img || PLACEHOLDER_IMG
}

export const PLACEHOLDER_IMG =
  'data:image/svg+xml;charset=utf-8,' +
  encodeURIComponent(
    `<svg xmlns="http://www.w3.org/2000/svg" width="800" height="600"><rect width="100%" height="100%" fill="#e2e8f0"/><text x="50%" y="50%" dominant-baseline="middle" text-anchor="middle" fill="#94a3b8" font-family="system-ui" font-size="28">Sin foto</text></svg>`
  )
