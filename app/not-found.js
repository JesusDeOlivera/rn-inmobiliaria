import Link from 'next/link'

export default function NotFound() {
  return (
    <div
      style={{
        minHeight: '70vh',
        display: 'flex',
        flexDirection: 'column',
        gap: '14px',
        alignItems: 'center',
        justifyContent: 'center',
        textAlign: 'center',
        padding: '40px 20px',
        fontFamily: 'system-ui, sans-serif',
      }}
    >
      <div style={{ fontSize: '3rem', fontWeight: 900, color: '#020617' }}>404</div>
      <h1 style={{ fontWeight: 900, color: '#020617', margin: 0, fontSize: '1.4rem' }}>
        Página no encontrada
      </h1>
      <p style={{ color: '#64748b', margin: 0 }}>
        El enlace no existe o la propiedad ya no está publicada.
      </p>
      <Link
        href="/"
        style={{
          marginTop: '8px',
          color: '#4F46E5',
          fontWeight: 800,
          textDecoration: 'none',
        }}
      >
        Volver al inicio →
      </Link>
    </div>
  )
}
