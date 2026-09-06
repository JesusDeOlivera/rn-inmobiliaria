// Spinner / estado de carga reutilizable.
export default function Spinner({ texto = 'Cargando...' }) {
  return (
    <div
      style={{
        minHeight: '60vh',
        display: 'flex',
        flexDirection: 'column',
        gap: '18px',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#ffffff',
      }}
    >
      <div
        style={{
          width: '40px',
          height: '40px',
          border: '4px solid #f1f5f9',
          borderTop: '4px solid #020617',
          borderRadius: '50%',
          animation: 'rn-spin 1s linear infinite',
        }}
      />
      <p style={{ fontWeight: 800, color: '#64748b', fontSize: '0.9rem' }}>{texto}</p>
      <style>{`@keyframes rn-spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  )
}
