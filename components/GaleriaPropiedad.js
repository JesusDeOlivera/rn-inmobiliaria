'use client'

import { useState } from 'react'
import Image from 'next/image'
import Foto from './Foto'

// Galería de la ficha de propiedad: foto grande, miniaturas y lightbox.
// Es lo único que necesita estado en esa página; el resto se renderiza
// en el servidor para que Google vea el contenido.
export default function GaleriaPropiedad({ imagenes = [], titulo, estadoInterno }) {
  const [imagenActiva, setImagenActiva] = useState(0)
  const [lightboxAbierto, setLightboxAbierto] = useState(false)

  return (
    <>
      <div
        style={{
          position: 'relative',
          borderRadius: '24px',
          overflow: 'hidden',
          height: 'auto',
          aspectRatio: '4/3',
          maxHeight: '550px',
          backgroundColor: '#fff',
          boxShadow: '0 15px 35px rgba(0,0,0,0.05)',
        }}
      >
        {estadoInterno && estadoInterno !== 'Disponible' && (
          <div
            style={{
              position: 'absolute',
              top: '20px',
              left: '20px',
              backgroundColor: estadoInterno === 'Reservada' ? '#F59E0B' : '#EF4444',
              color: 'white',
              padding: '8px 20px',
              borderRadius: '12px',
              fontWeight: '900',
              zIndex: 10,
              fontSize: '0.75rem',
            }}
          >
            {estadoInterno.toUpperCase()}
          </div>
        )}
        <Foto
          onClick={() => setLightboxAbierto(true)}
          src={imagenes[imagenActiva]}
          alt={`${titulo} — foto ${imagenActiva + 1}`}
          priority
          sizes="(max-width: 768px) 100vw, 650px"
          style={{ cursor: 'zoom-in' }}
        />
      </div>

      {imagenes.length > 1 && (
        <div
          style={{
            display: 'flex',
            gap: '12px',
            marginTop: '15px',
            overflowX: 'auto',
            paddingBottom: '10px',
            scrollbarWidth: 'none',
          }}
        >
          {imagenes.map((img, idx) => (
            <Image
              key={idx}
              src={img}
              alt={`${titulo} — miniatura ${idx + 1}`}
              width={90}
              height={70}
              onClick={() => setImagenActiva(idx)}
              style={{
                flexShrink: 0,
                width: '90px',
                height: '70px',
                objectFit: 'cover',
                borderRadius: '12px',
                cursor: 'pointer',
                border: imagenActiva === idx ? '3px solid #4F46E5' : '3px solid transparent',
                transition: '0.2s',
              }}
            />
          ))}
        </div>
      )}

      {lightboxAbierto && (
        <div
          onClick={() => setLightboxAbierto(false)}
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(2, 6, 23, 0.98)',
            zIndex: 10000,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          {/* eslint-disable-next-line @next/next/no-img-element -- lightbox: dimensiones dinámicas, no aplica next/image */}
          <img
            src={imagenes[imagenActiva]}
            alt={`${titulo} — foto ${imagenActiva + 1}`}
            style={{ maxWidth: '95%', maxHeight: '80vh', borderRadius: '12px' }}
          />
          <button
            type="button"
            aria-label="Cerrar"
            onClick={(e) => {
              e.stopPropagation()
              setLightboxAbierto(false)
            }}
            style={{
              position: 'absolute',
              top: '20px',
              right: '20px',
              background: 'white',
              border: 'none',
              width: '44px',
              height: '44px',
              borderRadius: '50%',
              fontSize: '1.5rem',
              fontWeight: 'bold',
              cursor: 'pointer',
            }}
          >
            ×
          </button>
        </div>
      )}
    </>
  )
}
