'use client'

import { useFavoritos } from '../lib/useFavoritos'

// Botón de favorito. Es la única parte interactiva de las cards, así que
// se aísla acá para que el resto de la card pueda renderizarse en el servidor.
//
// variante 'card'   -> círculo flotante arriba a la derecha de la card
// variante 'detalle'-> círculo dentro del panel de info en la ficha
export default function BotonFavorito({ id, variante = 'card' }) {
  const { esFavorito, toggleFavorito } = useFavoritos()
  const activo = esFavorito(id)

  const estiloBase = {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: '50%',
    cursor: 'pointer',
    transition: '0.2s',
  }

  const estilos =
    variante === 'detalle'
      ? {
          ...estiloBase,
          position: 'absolute',
          top: '30px',
          right: '30px',
          width: '45px',
          height: '45px',
          backgroundColor: '#f8fafc',
          border: '1px solid #e2e8f0',
          fontSize: '1.3rem',
        }
      : {
          ...estiloBase,
          position: 'absolute',
          top: '15px',
          right: '15px',
          zIndex: 20,
          width: '40px',
          height: '40px',
          backgroundColor: 'white',
          border: 'none',
          boxShadow: '0 4px 10px rgba(0,0,0,0.1)',
          fontSize: '1.2rem',
          transform: activo ? 'scale(1.1)' : 'scale(1)',
        }

  return (
    <button
      type="button"
      aria-label={activo ? 'Quitar de favoritos' : 'Agregar a favoritos'}
      aria-pressed={activo}
      onClick={(e) => toggleFavorito(id, e)}
      style={estilos}
    >
      {activo ? '❤️' : '🤍'}
    </button>
  )
}
