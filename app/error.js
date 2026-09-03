'use client'

import { useEffect } from 'react'

// Error boundary de la app. En Next 16 el prop de reintento es `unstable_retry`.
export default function Error({ error, unstable_retry }) {
  useEffect(() => {
    console.error(error)
  }, [error])

  return (
    <div
      style={{
        minHeight: '70vh',
        display: 'flex',
        flexDirection: 'column',
        gap: '16px',
        alignItems: 'center',
        justifyContent: 'center',
        textAlign: 'center',
        padding: '40px 20px',
        fontFamily: 'system-ui, sans-serif',
      }}
    >
      <div style={{ fontSize: '2.5rem' }}>⚠️</div>
      <h1 style={{ fontWeight: 900, color: '#020617', margin: 0, fontSize: '1.5rem' }}>
        Algo salió mal
      </h1>
      <p style={{ color: '#64748b', maxWidth: '420px', margin: 0 }}>
        No pudimos cargar esta sección. Revisá tu conexión y probá de nuevo.
      </p>
      <button
        onClick={() => (unstable_retry ? unstable_retry() : window.location.reload())}
        style={{
          marginTop: '8px',
          backgroundColor: '#4F46E5',
          color: 'white',
          border: 'none',
          padding: '14px 28px',
          borderRadius: '14px',
          fontWeight: 800,
          cursor: 'pointer',
        }}
      >
        Reintentar
      </button>
    </div>
  )
}
