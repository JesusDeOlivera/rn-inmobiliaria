'use client'
export const dynamic = 'force-dynamic'
import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { supabase } from '../../../lib/supabase'
import Link from 'next/link'

export default function PropiedadDetalle() {
  const { id } = useParams()
  const router = useRouter()
  const [propiedad, setPropiedad] = useState(null)
  const [similares, setSimilares] = useState([])
  const [cargando, setCargando] = useState(true)
  const [sesion, setSesion] = useState(null)
  const [imagenActiva, setImagenActiva] = useState(0)
  const [isLightboxOpen, setIsLightboxOpen] = useState(false)
  const [favoritos, setFavoritos] = useState([])

  useEffect(() => {
    const cargarDatos = async () => {
      const { data: propActual } = await supabase.from('propiedades').select('*').eq('id', id).single()
      if (propActual) {
        setPropiedad(propActual)
        const { data: propSimilares } = await supabase
          .from('propiedades')
          .select('*')
          .eq('tipo', propActual.tipo)
          .neq('id', propActual.id)
          .limit(3)
        if (propSimilares) setSimilares(propSimilares)
      }
      setCargando(false)
    }
    cargarDatos()
    supabase.auth.getSession().then(({ data: { session } }) => setSesion(session))
    const favsGuardados = JSON.parse(localStorage.getItem('rn_favoritos')) || []
    setFavoritos(favsGuardados)
  }, [id])

  const toggleFavorito = (e, idProp) => {
    if (e) e.preventDefault()
    let nuevosFavs = [...favoritos]
    if (nuevosFavs.includes(idProp)) {
        nuevosFavs = nuevosFavs.filter(favId => favId !== idProp)
    } else {
        nuevosFavs.push(idProp)
    }
    setFavoritos(nuevosFavs)
    localStorage.setItem('rn_favoritos', JSON.stringify(nuevosFavs))
  }

  if (cargando) return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: '#ffffff' }}>
      <div style={{ width: '40px', height: '40px', border: '4px solid #f3f4f6', borderTop: '4px solid #020617', borderRadius: '50%', animation: 'spin 1s linear infinite' }}></div>
      <style>{`@keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }`}</style>
    </div>
  )

  if (!propiedad) return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
      <h1 style={{ fontWeight: '900', color: '#020617' }}>Propiedad no encontrada</h1>
      <Link href="/" style={{ color: '#F59E0B', fontWeight: 'bold' }}>Volver al inicio</Link>
    </div>
  )

  const vendedorNombre = propiedad.nombre_vendedor || 'RN Inmobiliaria';
  const vendedorTelefono = propiedad.telefono_vendedor || '5493765067519';
  const vendedorEmail = propiedad.email_vendedor || 'rninmobiliaria@gmail.com';
  const mensajeWsp = `Hola ${vendedorNombre}, me interesa la propiedad "${propiedad.titulo}" que vi en la web.`;
  const imagenes = propiedad.imagenes || []

  return (
    <main style={{ minHeight: '100vh', backgroundColor: '#F8FAFC', fontFamily: 'system-ui, sans-serif' }}>
      <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '40px 20px' }}>
        
        {/* BOTÓN VOLVER */}
        <Link href="/propiedades" style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#64748b', textDecoration: 'none', fontWeight: '700', marginBottom: '25px', fontSize: '0.85rem' }}>
          <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="3" viewBox="0 0 24 24"><path d="M15 19l-7-7 7-7"></path></svg>
          VOLVER AL CATÁLOGO
        </Link>

        {/* CONTENIDO PRINCIPAL: FLEX WRAP PARA RESPONSIVIDAD */}
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '30px', alignItems: 'start' }}>
          
          {/* COLUMNA IZQUIERDA: GALERÍA (Toma todo el ancho en móvil) */}
          <div style={{ flex: '1 1 650px', minWidth: '300px' }}>
            <div style={{ 
                position: 'relative', borderRadius: '24px', overflow: 'hidden', 
                height: 'auto', aspectRatio: '4/3', // Mantiene la forma en cualquier pantalla
                maxHeight: '550px', backgroundColor: '#fff', boxShadow: '0 15px 35px rgba(0,0,0,0.05)' 
            }}>
               {propiedad.estado_interno !== 'Disponible' && (
                <div style={{ position: 'absolute', top: '20px', left: '20px', backgroundColor: propiedad.estado_interno === 'Reservada' ? '#F59E0B' : '#EF4444', color: 'white', padding: '8px 20px', borderRadius: '12px', fontWeight: '900', zIndex: 10, fontSize: '0.75rem' }}>
                    {propiedad.estado_interno?.toUpperCase()}
                </div>
               )}
               <img 
                onClick={() => setIsLightboxOpen(true)}
                src={imagenes[imagenActiva]} 
                style={{ width: '100%', height: '100%', objectFit: 'cover', cursor: 'zoom-in' }} 
               />
            </div>

            {/* MINIATURAS (Scroll horizontal táctil mejorado) */}
            {imagenes.length > 1 && (
              <div style={{ display: 'flex', gap: '12px', marginTop: '15px', overflowX: 'auto', paddingBottom: '10px', scrollbarWidth: 'none' }}>
                {imagenes.map((img, idx) => (
                  <img 
                    key={idx} src={img} 
                    onClick={() => setImagenActiva(idx)}
                    style={{ 
                        flexShrink: 0, width: '90px', height: '70px', objectFit: 'cover', 
                        borderRadius: '12px', cursor: 'pointer', 
                        border: imagenActiva === idx ? '3px solid #4F46E5' : '3px solid transparent',
                        transition: '0.2s' 
                    }}
                  />
                ))}
              </div>
            )}

            {/* DESCRIPCIÓN (Abajo de la galería en celu) */}
            <div style={{ marginTop: '30px', backgroundColor: 'white', padding: '30px', borderRadius: '24px', border: '1px solid #f1f5f9' }}>
               <h3 style={{ fontWeight: '900', fontSize: '1.4rem', color: '#020617', marginBottom: '15px' }}>Descripción</h3>
               <p style={{ color: '#475569', lineHeight: '1.7', fontSize: '1rem', whiteSpace: 'pre-line' }}>{propiedad.descripcion}</p>
            </div>
          </div>

          {/* COLUMNA DERECHA: INFO (Baja sola en celu) */}
          <div style={{ flex: '1 1 350px', minWidth: '300px' }}>
            <div style={{ backgroundColor: 'white', padding: '35px', borderRadius: '24px', border: '1px solid #f1f5f9', boxShadow: '0 10px 30px rgba(0,0,0,0.02)', position: 'relative' }}>
              
              <button 
                onClick={(e) => toggleFavorito(e, propiedad.id)}
                style={{ position: 'absolute', top: '30px', right: '30px', backgroundColor: '#f8fafc', border: '1px solid #e2e8f0', width: '45px', height: '45px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', fontSize: '1.3rem' }}
              >
                {favoritos.includes(propiedad.id) ? '❤️' : '🤍'}
              </button>

              <span style={{ color: '#F59E0B', fontWeight: '900', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '1px' }}>📍 {propiedad.zona}</span>
              <h1 style={{ fontSize: '2rem', fontWeight: '900', color: '#020617', margin: '12px 0', lineHeight: 1.2, paddingRight: '40px' }}>{propiedad.titulo}</h1>
              
              <div style={{ margin: '25px 0', display: 'flex', alignItems: 'baseline', gap: '8px' }}>
                <span style={{ fontSize: '1.3rem', fontWeight: '800', color: '#64748b' }}>{propiedad.moneda}</span>
                <span style={{ fontSize: '3rem', fontWeight: '900', color: '#020617', letterSpacing: '-2px' }}>{Number(propiedad.precio).toLocaleString('es-AR')}</span>
              </div>

              {/* FEATURES GRID */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '30px' }}>
                 <div style={{ padding: '15px', backgroundColor: '#F8FAFC', borderRadius: '16px', textAlign: 'center' }}>
                    <span style={{ display: 'block', fontSize: '1.2rem', marginBottom: '5px' }}>🛏️</span>
                    <span style={{ fontWeight: '800', color: '#020617', fontSize: '0.9rem' }}>{propiedad.habitaciones} Dorm.</span>
                 </div>
                 <div style={{ padding: '15px', backgroundColor: '#F8FAFC', borderRadius: '16px', textAlign: 'center' }}>
                    <span style={{ display: 'block', fontSize: '1.2rem', marginBottom: '5px' }}>🚿</span>
                    <span style={{ fontWeight: '800', color: '#020617', fontSize: '0.9rem' }}>{propiedad.banos} Baños</span>
                 </div>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <a href={`https://wa.me/${vendedorTelefono}?text=${encodeURIComponent(mensajeWsp)}`} target="_blank" style={{ textDecoration: 'none', backgroundColor: '#22c55e', color: 'white', textAlign: 'center', padding: '18px', borderRadius: '16px', fontWeight: '900', fontSize: '1rem' }}>
                  WHATSAPP VENDEDOR
                </a>
                <a href={`mailto:${vendedorEmail}`} style={{ textDecoration: 'none', backgroundColor: '#020617', color: 'white', textAlign: 'center', padding: '18px', borderRadius: '16px', fontWeight: '900', fontSize: '1rem' }}>
                  ENVIAR EMAIL
                </a>
              </div>
            </div>

            {/* MAPA (Corregido el URL del iframe) */}
            {propiedad.direccion && (
              <div style={{ marginTop: '25px', borderRadius: '24px', overflow: 'hidden', border: '1px solid #f1f5f9' }}>
                <iframe 
                  width="100%" height="250" style={{ border: 0 }}
                  src={`https://maps.google.com/maps?q=${encodeURIComponent(propiedad.direccion + ", Misiones, Argentina")}&output=embed`}
                ></iframe>
              </div>
            )}
          </div>
        </div>

        {/* SIMILARES (Ajustada la grilla para móvil) */}
        {similares.length > 0 && (
          <div style={{ marginTop: '80px', borderTop: '2px solid #e2e8f0', paddingTop: '60px' }}>
            <h2 style={{ fontSize: '1.8rem', fontWeight: '900', color: '#020617', marginBottom: '30px' }}>También te puede interesar...</h2>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(290px, 1fr))', gap: '25px' }}>
              {similares.map(p => (
                <Link key={p.id} href={`/propiedad/${p.id}`} style={{ textDecoration: 'none', color: 'inherit' }}>
                  <div style={{ backgroundColor: 'white', borderRadius: '24px', overflow: 'hidden', border: '1px solid #f1f5f9' }}>
                    <div style={{ height: '220px' }}><img src={p.imagenes?.[0]} style={{ width: '100%', height: '100%', objectFit: 'cover' }} /></div>
                    <div style={{ padding: '20px' }}>
                      <p style={{ color: '#F59E0B', fontSize: '0.75rem', fontWeight: '900' }}>📍 {p.zona}</p>
                      <h3 style={{ fontSize: '1.1rem', fontWeight: '900', margin: '5px 0 15px' }}>{p.titulo}</h3>
                      <div style={{ display: 'flex', gap: '15px', color: '#64748b', fontSize: '0.9rem', fontWeight: '700' }}>
                        <span>🛏️ {p.habitaciones}</span><span>🚿 {p.banos}</span>
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* LIGHTBOX RESPONSIVO */}
      {isLightboxOpen && (
        <div onClick={() => setIsLightboxOpen(false)} style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(2, 6, 23, 0.98)', zIndex: 10000, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <img src={imagenes[imagenActiva]} style={{ maxWidth: '95%', maxHeight: '80vh', borderRadius: '12px' }} />
            <button style={{ position: 'absolute', top: '20px', right: '20px', background: 'white', border: 'none', width: '40px', height: '40px', borderRadius: '50%', fontSize: '1.5rem', fontWeight: 'bold' }}>×</button>
        </div>
      )}
    </main>
  )
}