'use client'
import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import { supabase } from '../../../lib/supabase'
import { obtenerPropiedad, listarSimilares } from '../../../lib/propiedades'
import { useFavoritos } from '../../../lib/useFavoritos'
import Image from 'next/image'
import { formatPrecio, imagenPrincipal, waLink } from '../../../lib/format'
import { CONTACTOS } from '../../../lib/config'
import Foto from '../../../components/Foto'

export default function PropiedadDetalle() {
  const { id } = useParams()
  const [propiedad, setPropiedad] = useState(null)
  const [similares, setSimilares] = useState([])
  const [cargando, setCargando] = useState(true)
  const [error, setError] = useState(null)
  const [imagenActiva, setImagenActiva] = useState(0)
  const [isLightboxOpen, setIsLightboxOpen] = useState(false)

  const { esFavorito, toggleFavorito } = useFavoritos()

  useEffect(() => {
    let activo = true
    const cargarDatos = async () => {
      setCargando(true)
      const { data, error } = await obtenerPropiedad(supabase, id)
      if (!activo) return
      if (error) {
        setError(error)
        setCargando(false)
        return
      }
      setPropiedad(data)
      if (data) {
        const { data: sim } = await listarSimilares(supabase, data)
        if (activo && sim) setSimilares(sim)
      }
      setCargando(false)
    }
    cargarDatos()
    return () => {
      activo = false
    }
  }, [id])

  if (cargando) return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: '#ffffff' }}>
      <div style={{ width: '40px', height: '40px', border: '4px solid #f3f4f6', borderTop: '4px solid #020617', borderRadius: '50%', animation: 'spin 1s linear infinite' }}></div>
      <style>{`@keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }`}</style>
    </div>
  )

  if (error) return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', gap: '12px', alignItems: 'center', justifyContent: 'center', padding: '20px', textAlign: 'center' }}>
      <h1 style={{ fontWeight: '900', color: '#020617' }}>No pudimos cargar la propiedad</h1>
      <p style={{ color: '#64748b' }}>Revisá tu conexión e intentá de nuevo.</p>
      <Link href="/propiedades" style={{ color: '#F59E0B', fontWeight: 'bold' }}>Volver al catálogo</Link>
    </div>
  )

  if (!propiedad) return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
      <h1 style={{ fontWeight: '900', color: '#020617' }}>Propiedad no encontrada</h1>
      <Link href="/" style={{ color: '#F59E0B', fontWeight: 'bold' }}>Volver al inicio</Link>
    </div>
  )

  const vendedorNombre = propiedad.nombre_vendedor || CONTACTOS.papa.nombre
  const vendedorTelefono = propiedad.telefono_vendedor || CONTACTOS.papa.tel
  const vendedorEmail = propiedad.email_vendedor || CONTACTOS.papa.email
  const mensajeWsp = `Hola ${vendedorNombre}, me interesa la propiedad "${propiedad.titulo}" que vi en la web.`
  const imagenes = propiedad.imagenes || []
  const esFav = esFavorito(propiedad.id)

  return (
    <main style={{ minHeight: '100vh', backgroundColor: '#F8FAFC', fontFamily: 'system-ui, sans-serif' }}>
      <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '40px 20px' }}>

        {/* BOTÓN VOLVER */}
        <Link href="/propiedades" style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#64748b', textDecoration: 'none', fontWeight: '700', marginBottom: '25px', fontSize: '0.85rem' }}>
          <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="3" viewBox="0 0 24 24" aria-hidden="true"><path d="M15 19l-7-7 7-7"></path></svg>
          VOLVER AL CATÁLOGO
        </Link>

        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '30px', alignItems: 'start' }}>

          {/* GALERÍA */}
          <div style={{ flex: '1 1 650px', minWidth: '300px' }}>
            <div style={{
                position: 'relative', borderRadius: '24px', overflow: 'hidden',
                height: 'auto', aspectRatio: '4/3',
                maxHeight: '550px', backgroundColor: '#fff', boxShadow: '0 15px 35px rgba(0,0,0,0.05)'
            }}>
               {propiedad.estado_interno !== 'Disponible' && (
                <div style={{ position: 'absolute', top: '20px', left: '20px', backgroundColor: propiedad.estado_interno === 'Reservada' ? '#F59E0B' : '#EF4444', color: 'white', padding: '8px 20px', borderRadius: '12px', fontWeight: '900', zIndex: 10, fontSize: '0.75rem' }}>
                    {propiedad.estado_interno?.toUpperCase()}
                </div>
               )}
               <Foto
                onClick={() => setIsLightboxOpen(true)}
                src={imagenes[imagenActiva]}
                alt={`${propiedad.titulo} — foto ${imagenActiva + 1}`}
                priority
                sizes="(max-width: 768px) 100vw, 650px"
                style={{ cursor: 'zoom-in' }}
               />
            </div>

            {/* MINIATURAS */}
            {imagenes.length > 1 && (
              <div style={{ display: 'flex', gap: '12px', marginTop: '15px', overflowX: 'auto', paddingBottom: '10px', scrollbarWidth: 'none' }}>
                {imagenes.map((img, idx) => (
                  <Image
                    key={idx} src={img}
                    alt={`${propiedad.titulo} — miniatura ${idx + 1}`}
                    width={90} height={70}
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

            {/* DESCRIPCIÓN */}
            <div style={{ marginTop: '30px', backgroundColor: 'white', padding: '30px', borderRadius: '24px', border: '1px solid #f1f5f9' }}>
               <h3 style={{ fontWeight: '900', fontSize: '1.4rem', color: '#020617', marginBottom: '15px' }}>Descripción</h3>
               <p style={{ color: '#475569', lineHeight: '1.7', fontSize: '1rem', whiteSpace: 'pre-line' }}>{propiedad.descripcion}</p>
            </div>
          </div>

          {/* INFO */}
          <div style={{ flex: '1 1 350px', minWidth: '300px' }}>
            <div style={{ backgroundColor: 'white', padding: '35px', borderRadius: '24px', border: '1px solid #f1f5f9', boxShadow: '0 10px 30px rgba(0,0,0,0.02)', position: 'relative' }}>

              <button
                type="button"
                aria-label={esFav ? 'Quitar de favoritos' : 'Agregar a favoritos'}
                onClick={(e) => toggleFavorito(propiedad.id, e)}
                style={{ position: 'absolute', top: '30px', right: '30px', backgroundColor: '#f8fafc', border: '1px solid #e2e8f0', width: '45px', height: '45px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', fontSize: '1.3rem' }}
              >
                {esFav ? '❤️' : '🤍'}
              </button>

              <span style={{ color: '#F59E0B', fontWeight: '900', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '1px' }}>📍 {propiedad.zona}</span>
              <h1 style={{ fontSize: '2rem', fontWeight: '900', color: '#020617', margin: '12px 0', lineHeight: 1.2, paddingRight: '40px' }}>{propiedad.titulo}</h1>

              <div style={{ margin: '25px 0', fontSize: '2.4rem', fontWeight: '900', color: '#020617', letterSpacing: '-2px' }}>
                {formatPrecio(propiedad)}
              </div>

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
                <a href={waLink(vendedorTelefono, mensajeWsp)} target="_blank" rel="noopener noreferrer" style={{ textDecoration: 'none', backgroundColor: '#22c55e', color: 'white', textAlign: 'center', padding: '18px', borderRadius: '16px', fontWeight: '900', fontSize: '1rem' }}>
                  WHATSAPP VENDEDOR
                </a>
                <a href={`mailto:${vendedorEmail}`} style={{ textDecoration: 'none', backgroundColor: '#020617', color: 'white', textAlign: 'center', padding: '18px', borderRadius: '16px', fontWeight: '900', fontSize: '1rem' }}>
                  ENVIAR EMAIL
                </a>
              </div>
            </div>

            {/* MAPA */}
            {propiedad.direccion && (
              <div style={{ marginTop: '25px', borderRadius: '24px', overflow: 'hidden', border: '1px solid #f1f5f9' }}>
                <iframe
                  title={`Mapa de ${propiedad.direccion}`}
                  loading="lazy"
                  width="100%" height="250" style={{ border: 0 }}
                  src={`https://maps.google.com/maps?q=${encodeURIComponent(propiedad.direccion + ', Misiones, Argentina')}&output=embed`}
                ></iframe>
              </div>
            )}
          </div>
        </div>

        {/* SIMILARES */}
        {similares.length > 0 && (
          <div style={{ marginTop: '80px', borderTop: '2px solid #e2e8f0', paddingTop: '60px' }}>
            <h2 style={{ fontSize: '1.8rem', fontWeight: '900', color: '#020617', marginBottom: '30px' }}>También te puede interesar...</h2>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(290px, 1fr))', gap: '25px' }}>
              {similares.map(p => (
                <Link key={p.id} href={`/propiedad/${p.id}`} style={{ textDecoration: 'none', color: 'inherit' }}>
                  <div style={{ backgroundColor: 'white', borderRadius: '24px', overflow: 'hidden', border: '1px solid #f1f5f9' }}>
                    <div style={{ position: 'relative', height: '220px' }}>
                      <Foto src={imagenPrincipal(p)} alt={p.titulo} sizes="(max-width: 768px) 100vw, 300px" />
                    </div>
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

      {/* LIGHTBOX */}
      {isLightboxOpen && (
        <div onClick={() => setIsLightboxOpen(false)} style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(2, 6, 23, 0.98)', zIndex: 10000, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            {/* eslint-disable-next-line @next/next/no-img-element -- lightbox: dimensiones dinámicas, no aplica next/image */}
            <img src={imagenes[imagenActiva]} alt={`${propiedad.titulo} — foto ${imagenActiva + 1}`} style={{ maxWidth: '95%', maxHeight: '80vh', borderRadius: '12px' }} />
            <button
              type="button"
              aria-label="Cerrar"
              onClick={(e) => { e.stopPropagation(); setIsLightboxOpen(false) }}
              style={{ position: 'absolute', top: '20px', right: '20px', background: 'white', border: 'none', width: '44px', height: '44px', borderRadius: '50%', fontSize: '1.5rem', fontWeight: 'bold', cursor: 'pointer' }}
            >
              ×
            </button>
        </div>
      )}
    </main>
  )
}
