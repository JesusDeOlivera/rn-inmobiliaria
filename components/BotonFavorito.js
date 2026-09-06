'use client'

import { useFavoritos } from '../lib/useFavoritos'

// Botón de favorito. Es la única parte interactiva de las tarjetas, así que
// se aísla acá para que el resto pueda renderizarse en el servidor.
export default function BotonFavorito({ id, className = '' }) {
  const { esFavorito, toggleFavorito } = useFavoritos()
  const activo = esFavorito(id)

  return (
    <button
      type="button"
      className={`btn-fav ${className}`}
      aria-label={activo ? 'Quitar de favoritos' : 'Agregar a favoritos'}
      aria-pressed={activo}
      onClick={(e) => toggleFavorito(id, e)}
    >
      <span aria-hidden="true">{activo ? '❤️' : '🤍'}</span>
    </button>
  )
}
