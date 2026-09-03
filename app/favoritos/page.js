'use client'
import { useEffect, useState } from 'react'
import Link from 'next/link'
import { supabase } from '../../lib/supabase'
import { listarPorIds } from '../../lib/propiedades'
import { useFavoritos } from '../../lib/useFavoritos'
import { formatPrecio, imagenPrincipal } from '../../lib/format'
import Foto from '../../components/Foto'

export default function FavoritosPage() {
  const { favoritos, quitarFavorito } = useFavoritos()
  const [propiedades, setPropiedades] = useState([])
  const [cargando, setCargando] = useState(true)
  const [error, setError] = useState(null)

  const claveFavs = favoritos.map(String).sort().join(',')

  useEffect(() => {
    let activo = true
    const cargar = async () => {
      setCargando(true)
      const { data, error } = await listarPorIds(supabase, favoritos)
      if (!activo) return
      if (error) setError(error)
      else setPropiedades(data)
      setCargando(false)
    }
    cargar()
    return () => {
      activo = false
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [claveFavs])

  return (
    <main style={{ minHeight: '100vh', backgroundColor: '#f8fafc', fontFamily: 'system-ui, sans-serif' }}>

      <style>{`
        *, *::before, *::after { box-sizing: border-box; }

        .favs-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(min(100%, 320px), 1fr));
          gap: 24px;
        }
        .fav-card {
          background: white; border-radius: 24px;
          overflow: hidden; border: 1px solid #f1f5f9;
          transition: transform 0.2s, box-shadow 0.2s;
        }
        .fav-card:active { transform: scale(0.98); }
        @media (hover: hover) {
          .fav-card:hover { transform: translateY(-3px); box-shadow: 0 16px 32px rgba(0,0,0,0.08); }
        }
        .btn-quitar {
          position: absolute; top: 14px; right: 14px; z-index: 10;
          background: #ef4444; border: none; color: white;
          padding: 0 14px; border-radius: 10px; font-weight: 800;
          font-size: 0.72rem; cursor: pointer;
          min-height: 36px; display: flex; align-items: center;
          -webkit-tap-highlight-color: transparent;
          letter-spacing: 0.5px;
        }
        .btn-quitar:active { opacity: 0.8; transform: scale(0.96); }
        .empty-state {
          text-align: center; padding: 60px 24px;
          background: white; border-radius: 28px; border: 1px solid #e2e8f0;
        }
        @media (min-width: 768px) { .empty-state { padding: 100px; } }
        .page-pad { padding: 50px 6%; }
        @media (min-width: 768px) { .page-pad { padding: 60px 8%; } }
      `}</style>

      <div className="page-pad" style={{ maxWidth: '1400px', margin: '0 auto' }}>
        <h1 style={{ fontSize: 'clamp(2rem, 6vw, 3rem)', fontWeight: '900', color: '#020617', marginBottom: '8px', letterSpacing: '-2px' }}>
          Mis Favoritos ❤️
        </h1>
        <p style={{ color: '#64748b', fontSize: '1.05rem', marginBottom: '40px' }}>
          Estas son las propiedades que te interesaron.
        </p>

        {error && (
          <div className="empty-state">
            <p style={{ fontSize: '1.1rem', fontWeight: '700', color: '#64748b' }}>
              No pudimos cargar tus favoritos. Probá recargar la página.
            </p>
          </div>
        )}

        {!error && cargando && (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(min(100%, 300px), 1fr))', gap: '24px' }}>
            {[1, 2, 3].map(i => (
              <div key={i} style={{ borderRadius: '24px', overflow: 'hidden', border: '1px solid #f1f5f9' }}>
                <div style={{ height: '200px', background: 'linear-gradient(90deg, #f1f5f9 25%, #e2e8f0 50%, #f1f5f9 75%)', backgroundSize: '200% 100%', animation: 'shimmer 1.5s infinite' }} />
                <div style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  <div style={{ height: '20px', borderRadius: '8px', background: '#f1f5f9', width: '70%' }} />
                  <div style={{ height: '16px', borderRadius: '8px', background: '#f1f5f9', width: '40%' }} />
                </div>
              </div>
            ))}
            <style>{`@keyframes shimmer { 0%{background-position:200% 0} 100%{background-position:-200% 0} }`}</style>
          </div>
        )}

        {!error && !cargando && propiedades.length === 0 && (
          <div className="empty-state">
            <div style={{ fontSize: '3rem', marginBottom: '16px' }}>💔</div>
            <p style={{ fontSize: '1.3rem', fontWeight: '700', color: '#64748b', marginBottom: '20px' }}>
              Aún no guardaste ninguna propiedad.
            </p>
            <Link href="/propiedades" style={{ color: '#4F46E5', fontWeight: '800', fontSize: '1rem', textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: '6px', minHeight: '44px' }}>
              Explorar catálogo →
            </Link>
          </div>
        )}

        {!error && !cargando && propiedades.length > 0 && (
          <div className="favs-grid">
            {propiedades.map(p => (
              <div key={p.id} style={{ position: 'relative' }}>
                <button type="button" className="btn-quitar" onClick={() => quitarFavorito(p.id)}>
                  QUITAR ✕
                </button>
                <Link href={`/propiedad/${p.id}`} style={{ textDecoration: 'none', color: 'inherit' }}>
                  <div className="fav-card">
                    <div style={{ position: 'relative', height: '210px' }}>
                      <Foto src={imagenPrincipal(p)} alt={p.titulo} sizes="(max-width: 768px) 100vw, 320px" />
                    </div>
                    <div style={{ padding: '20px' }}>
                      <span style={{ color: '#F59E0B', fontWeight: '800', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '1px' }}>
                        📍 {p.zona}
                      </span>
                      <h3 style={{ fontSize: 'clamp(1.1rem, 3vw, 1.3rem)', fontWeight: '900', color: '#020617', margin: '8px 0 10px', lineHeight: 1.2 }}>
                        {p.titulo}
                      </h3>
                      <p style={{ color: '#4F46E5', fontWeight: '800', fontSize: '1.1rem', margin: 0 }}>
                        {formatPrecio(p)}
                      </p>
                      {(p.habitaciones || p.banos) && (
                        <div style={{ display: 'flex', gap: '16px', marginTop: '12px', paddingTop: '12px', borderTop: '1px solid #f1f5f9', color: '#64748b', fontWeight: '700', fontSize: '0.9rem' }}>
                          {p.habitaciones ? <span>🛏️ {p.habitaciones} Dorm.</span> : null}
                          {p.banos ? <span>🚿 {p.banos} Baños</span> : null}
                        </div>
                      )}
                    </div>
                  </div>
                </Link>
              </div>
            ))}
          </div>
        )}
      </div>

      <footer style={{ textAlign: 'center', padding: '40px 6%', marginTop: '60px', borderTop: '1px solid #e2e8f0' }}>
        <p style={{ color: '#94a3b8', fontSize: '0.85rem', fontWeight: '700', letterSpacing: '2px' }}>
          © 2026 RN INMOBILIARIA · POSADAS, MISIONES
        </p>
      </footer>
    </main>
  )
}
