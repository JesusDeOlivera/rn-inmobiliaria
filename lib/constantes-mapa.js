// Constantes de mapa compartidas entre servidor y cliente.
// (Van acá y no en geocodificar.js porque ese módulo es `server-only`.)

/** Centro de Posadas: vista por defecto del mapa y sesgo de geocodificación. */
export const CENTRO_POSADAS = { lat: -27.3671, lng: -55.8961 }

/** Zoom inicial cuando no hay propiedades que encuadrar. */
export const ZOOM_CIUDAD = 13
