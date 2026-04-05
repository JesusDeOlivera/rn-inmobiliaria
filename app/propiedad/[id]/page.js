'use client'
import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { supabase } from '../../../lib/supabase'
import Link from 'next/link'

export default function PropiedadDetalle() {
  const { id } = useParams()
  const router = useRouter()
  const [propiedad, setPropiedad] = useState(null)
  const [similares, setSimilares] = useState([]) // NUEVO: Estado para similares
  const [cargando, setCargando] = useState(true)
  const [sesion, setSesion] = useState(null)
  
  const [imagenActiva, setImagenActiva] = useState(0)
  const [isLightboxOpen, setIsLightboxOpen] = useState(false)
  
  // ESTADO PARA FAVORITOS
  const [favoritos, setFavoritos] = useState([])

  useEffect(() => {
    const cargarDatos = async () => {
      // 1. Cargar Propiedad Actual
      const { data: propActual } = await supabase.from('propiedades').select('*').eq('id', id).single()
      
      if (propActual) {
        setPropiedad(propActual)

        // 2. NUEVO: Cargar Propiedades Similares (Mismo tipo, distinto ID, máximo 3)
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

    // Chequear Sesión para el Navbar
    supabase.auth.getSession().then(({ data: { session } }) => setSesion(session))
    
    // Cargar favoritos guardados
    const favsGuardados = JSON.parse(localStorage.getItem('rn_favoritos')) || []
    setFavoritos(favsGuardados)
  }, [id])

  // Lógica para el botón de favoritos
  const toggleFavorito = (e, idProp) => {
    if (e) e.preventDefault() // Para evitar que el Link se active si clickeamos el corazón en las tarjetas similares
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
      <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '60px 20px' }}>
        
        {/* BOTÓN VOLVER */}
        <Link href="/propiedades" style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#64748b', textDecoration: 'none', fontWeight: '700', marginBottom: '30px', fontSize: '0.9rem' }}>
          <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><path d="M15 19l-7-7 7-7"></path></svg>
          VOLVER AL CATÁLOGO
        </Link>

        {/* CONTENIDO PRINCIPAL DE LA PROPIEDAD */}
        <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr', gap: '50px', alignItems: 'start' }}>
          
          {/* COLUMNA IZQUIERDA: GALERÍA */}
          <div>
            <div style={{ position: 'relative', borderRadius: '32px', overflow: 'hidden', height: '550px', backgroundColor: '#fff', boxShadow: '0 20px 40px rgba(0,0,0,0.05)' }}>
               {propiedad.estado_interno !== 'Disponible' && (
                <div style={{ position: 'absolute', top: '30px', left: '30px', backgroundColor: propiedad.estado_interno === 'Reservada' ? '#F59E0B' : '#EF4444', color: 'white', padding: '10px 25px', borderRadius: '15px', fontWeight: '900', zIndex: 10, fontSize: '0.8rem', letterSpacing: '1px' }}>
                    {propiedad.estado_interno?.toUpperCase()}
                </div>
               )}
               <img 
                onClick={() => setIsLightboxOpen(true)}
                src={imagenes[imagenActiva]} 
                style={{ width: '100%', height: '100%', objectFit: 'cover', cursor: 'zoom-in' }} 
               />
            </div>

            {/* MINIATURAS */}
            {imagenes.length > 1 && (
              <div style={{ display: 'flex', gap: '15px', marginTop: '20px', overflowX: 'auto', paddingBottom: '10px' }}>
                {imagenes.map((img, idx) => (
                  <img 
                    key={idx} 
                    src={img} 
                    onClick={() => setImagenActiva(idx)}
                    style={{ width: '100px', height: '80px', objectFit: 'cover', borderRadius: '16px', cursor: 'pointer', border: imagenActiva === idx ? '3px solid #020617' : '3px solid transparent', opacity: imagenActiva === idx ? 1 : 0.6, transition: '0.2s' }}
                  />
                ))}
              </div>
            )}

            {/* DESCRIPCIÓN */}
            <div style={{ marginTop: '50px', backgroundColor: 'white', padding: '40px', borderRadius: '32px', border: '1px solid #f1f5f9' }}>
               <h3 style={{ fontWeight: '900', fontSize: '1.5rem', color: '#020617', marginBottom: '20px' }}>Descripción</h3>
               <p style={{ color: '#475569', lineHeight: '1.8', fontSize: '1.1rem', whiteSpace: 'pre-line' }}>{propiedad.descripcion}</p>
            </div>
          </div>

          {/* COLUMNA DERECHA: INFO Y CONTACTO */}
          <div style={{ position: 'sticky', top: '130px' }}>
            <div style={{ backgroundColor: 'white', padding: '40px', borderRadius: '32px', border: '1px solid #f1f5f9', boxShadow: '0 10px 30px rgba(0,0,0,0.02)', position: 'relative' }}>
              
              {/* BOTÓN FAVORITO GRANDE */}
              <button 
                onClick={(e) => toggleFavorito(e, propiedad.id)}
                style={{ position: 'absolute', top: '35px', right: '35px', backgroundColor: '#f1f5f9', border: 'none', width: '50px', height: '50px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', fontSize: '1.5rem', transition: '0.2s', transform: favoritos.includes(propiedad.id) ? 'scale(1.1)' : 'scale(1)' }}
                title={favoritos.includes(propiedad.id) ? "Quitar de favoritos" : "Guardar en favoritos"}
              >
                {favoritos.includes(propiedad.id) ? '❤️' : '🤍'}
              </button>

              <span style={{ color: '#F59E0B', fontWeight: '900', fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '2px' }}>📍 {propiedad.zona}</span>
              <h1 style={{ fontSize: '2.5rem', fontWeight: '900', color: '#020617', margin: '15px 0', lineHeight: 1.1, paddingRight: '50px' }}>{propiedad.titulo}</h1>
              
              <div style={{ margin: '30px 0', display: 'flex', alignItems: 'baseline', gap: '10px' }}>
                <span style={{ fontSize: '1.5rem', fontWeight: '800', color: '#64748b' }}>{propiedad.moneda}</span>
                <span style={{ fontSize: '3.5rem', fontWeight: '900', color: '#020617', letterSpacing: '-2px' }}>{Number(propiedad.precio).toLocaleString('es-AR')}</span>
              </div>

              {/* FEATURES GRID */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px', marginBottom: '40px' }}>
                 <div style={{ padding: '20px', backgroundColor: '#F8FAFC', borderRadius: '20px', textAlign: 'center' }}>
                    <span style={{ display: 'block', fontSize: '1.5rem', marginBottom: '5px' }}>🛏️</span>
                    <span style={{ fontWeight: '900', color: '#020617' }}>{propiedad.habitaciones} Dorm.</span>
                 </div>
                 <div style={{ padding: '20px', backgroundColor: '#F8FAFC', borderRadius: '20px', textAlign: 'center' }}>
                    <span style={{ display: 'block', fontSize: '1.5rem', marginBottom: '5px' }}>🚿</span>
                    <span style={{ fontWeight: '900', color: '#020617' }}>{propiedad.banos} Baños</span>
                 </div>
              </div>

              {/* BOTONES DE CONTACTO */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <a href={`https://wa.me/${vendedorTelefono}?text=${encodeURIComponent(mensajeWsp)}`} target="_blank" style={{ textDecoration: 'none', backgroundColor: '#22c55e', color: 'white', textAlign: 'center', padding: '20px', borderRadius: '18px', fontWeight: '900', fontSize: '1rem', boxShadow: '0 10px 20px rgba(34, 197, 94, 0.2)' }}>
                  WHATSAPP VENDEDOR
                </a>
                <a href={`mailto:${vendedorEmail}`} style={{ textDecoration: 'none', backgroundColor: '#020617', color: 'white', textAlign: 'center', padding: '20px', borderRadius: '18px', fontWeight: '900', fontSize: '1rem' }}>
                  ENVIAR EMAIL
                </a>
              </div>
              <p style={{ textAlign: 'center', color: '#94a3b8', fontSize: '0.8rem', marginTop: '15px', fontWeight: '600' }}>Atendido por: {vendedorNombre}</p>
            </div>

            {/* MAPA */}
            {propiedad.direccion && (
              <div style={{ marginTop: '30px', borderRadius: '32px', overflow: 'hidden', border: '1px solid #f1f5f9' }}>
                <iframe 
                  width="100%" height="300" style={{ border: 0 }}
                  src={`https://www.google.com/maps?q=${encodeURIComponent(propiedad.direccion + ", Misiones, Argentina")}&output=embed`}
                ></iframe>
              </div>
            )}
          </div>
        </div>

        {/* =========================================
            NUEVA SECCIÓN: PROPIEDADES SIMILARES 
            ========================================= */}
        {similares.length > 0 && (
          <div style={{ marginTop: '100px', borderTop: '2px solid #e2e8f0', paddingTop: '80px', paddingBottom: '40px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '40px' }}>
                <h2 style={{ fontSize: '2.2rem', fontWeight: '900', color: '#020617', letterSpacing: '-1px', margin: 0 }}>También te puede interesar...</h2>
                <Link href="/propiedades" style={{ color: '#4F46E5', fontWeight: '800', textDecoration: 'none' }}>Ver más opciones →</Link>
            </div>
            
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))', gap: '40px' }}>
              {similares.map(p => (
                  <div key={p.id} style={{ position: 'relative' }}>
                    {/* Botón de Corazón en la tarjeta similar */}
                    <button 
                      onClick={(e) => toggleFavorito(e, p.id)}
                      style={{ position: 'absolute', top: '15px', right: '15px', zIndex: 20, backgroundColor: 'white', border: 'none', width: '40px', height: '40px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', boxShadow: '0 4px 10px rgba(0,0,0,0.1)', fontSize: '1.2rem', transition: '0.2s', transform: favoritos.includes(p.id) ? 'scale(1.1)' : 'scale(1)' }}
                    >
                      {favoritos.includes(p.id) ? '❤️' : '🤍'}
                    </button>

                    <Link href={`/propiedad/${p.id}`} style={{ textDecoration: 'none', color: 'inherit' }}>
                    <div style={{ backgroundColor: 'white', borderRadius: '32px', overflow: 'hidden', boxShadow: '0 10px 30px rgba(0,0,0,0.04)', border: '1px solid #f1f5f9', transition: '0.3s' }}>
                        <div style={{ height: '280px', position: 'relative' }}>
                            <div style={{ position: 'absolute', top: '20px', left: '20px', backgroundColor: '#22c55e', color: 'white', padding: '6px 14px', borderRadius: '10px', fontSize: '0.7rem', fontWeight: '900', zIndex: 10 }}>VENTA</div>
                            <div style={{ position: 'absolute', bottom: '20px', left: '20px', backgroundColor: 'white', padding: '10px 20px', borderRadius: '16px', fontWeight: '900', fontSize: '1.4rem', color: '#020617', boxShadow: '0 4px 15px rgba(0,0,0,0.1)' }}>
                                {p.moneda} {Number(p.precio).toLocaleString('es-AR')}
                            </div>
                            <img src={p.imagenes?.[0]} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                        </div>
                        <div style={{ padding: '30px' }}>
                            <p style={{ color: '#F59E0B', fontSize: '0.85rem', margin: '0 0 10px', fontWeight: '800', textTransform: 'uppercase' }}>📍 {p.zona}</p>
                            <h3 style={{ fontSize: '1.3rem', fontWeight: '900', color: '#020617', margin: '0 0 20px', lineHeight: 1.2, height: '3.1rem', overflow: 'hidden' }}>{p.titulo}</h3>
                            
                            <div style={{ display: 'flex', gap: '20px', borderTop: '1px solid #f1f5f9', paddingTop: '20px', color: '#475569', fontWeight: '800' }}>
                                <span>🛏️ {p.habitaciones} Dorm.</span>
                                <span>🚿 {p.banos} Baños</span>
                            </div>
                        </div>
                    </div>
                    </Link>
                  </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* LIGHTBOX */}
      {isLightboxOpen && (
        <div onClick={() => setIsLightboxOpen(false)} style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(2, 6, 23, 0.98)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'zoom-out' }}>
           <img src={imagenes[imagenActiva]} style={{ maxWidth: '90%', maxHeight: '85vh', borderRadius: '20px', boxShadow: '0 0 50px rgba(0,0,0,0.5)' }} />
           <div style={{ position: 'absolute', top: '40px', right: '40px', color: 'white', fontSize: '2rem', fontWeight: '100' }}>×</div>
        </div>
      )}

    </main>
  )
}