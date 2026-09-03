// =============================================================
//  Configuración central del sitio.
//  Todo lo que antes estaba hardcodeado y repetido (teléfonos,
//  emails, URL pública) vive acá. Si algo cambia, se cambia una vez.
// =============================================================

// URL pública del sitio (para metadata / OpenGraph / sitemap).
export const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL || 'https://rn-inmobiliaria.vercel.app'

export const SITE_NAME = 'RN Inmobiliaria'
export const SITE_DESCRIPTION =
  'Tu agencia inmobiliaria de confianza en Misiones. Compra, venta y alquiler de propiedades en Posadas, Garupá y Candelaria.'

// -------------------------------------------------------------
//  Contactos
//  Número confirmado en el commit 1561df0 ("Update WhatsApp contact
//  number in page.js"): +54 9 376 417-0186.
//  Se puede sobrescribir por entorno con NEXT_PUBLIC_WHATSAPP.
// -------------------------------------------------------------
export const WHATSAPP_PRINCIPAL =
  process.env.NEXT_PUBLIC_WHATSAPP || '5493764170186'

export const CONTACTOS = {
  papa: {
    id: 'papa',
    nombre: 'RN Inmobiliaria',
    tel: WHATSAPP_PRINCIPAL,
    email: 'negocioinmobiliariorn@gmail.com',
  },
  socio: {
    id: 'socio',
    nombre: 'Socio RN',
    // TODO(negocio): completar datos reales del socio.
    tel: process.env.NEXT_PUBLIC_WHATSAPP_SOCIO || WHATSAPP_PRINCIPAL,
    email: 'socio@rninmobiliaria.com',
  },
}

// Datos que se muestran en la sección "Contacto" del home.
export const OFICINA = {
  ciudad: 'Posadas, Misiones (con cita previa)',
  whatsappDisplay: '+54 9 376 417-0186',
}

// Redes / links externos opcionales.
export const REDES = {
  instagram: process.env.NEXT_PUBLIC_INSTAGRAM || '',
  facebook: process.env.NEXT_PUBLIC_FACEBOOK || '',
}
