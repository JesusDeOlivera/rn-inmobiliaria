import Image from 'next/image'
import { PLACEHOLDER_IMG } from '../lib/format'

// Wrapper de next/image para las fotos de propiedades.
//
//  - `fill`: la imagen ocupa el contenedor padre (que debe tener
//    position relative/absolute y un tamaño definido).
//  - Si la src es el placeholder (data URI) usamos `unoptimized`
//    porque el optimizador de Next no procesa data: URIs.
export default function Foto({ src, alt, sizes = '100vw', priority = false, style, onClick }) {
  const finalSrc = src || PLACEHOLDER_IMG
  const esPlaceholder = finalSrc.startsWith('data:')

  return (
    <Image
      src={finalSrc}
      alt={alt || ''}
      fill
      sizes={sizes}
      priority={priority}
      unoptimized={esPlaceholder}
      onClick={onClick}
      style={{ objectFit: 'cover', ...style }}
    />
  )
}
