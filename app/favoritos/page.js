'use client'
import { useEffect, useState } from 'react'
import { supabase } from '../../lib/supabase'
import Link from 'next/link'
import { useRouter } from 'next/navigation'

export default function FavoritosPage() {
  const router = useRouter()
  const [propiedades, setPropiedades] = useState([])
  const [cargando, setCargando] = useState(true)
  const [favoritos, setFavoritos] = useState([])
  const [sesion, setSesion] = useState(null)          // ← FIX: estaba sin declarar
  const [menuAbierto, setMenuAbierto] = useState(false)

  useEffect(() => {
    // Sesión de Supabase
    supabase.auth.getSession().then(({ data: { session } }) => setSesion(session))
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_e, session) => setSesion(session))

    // Favoritos desde localStorage
    const ids = JSON.parse(localStorage.getItem('rn_favoritos') || '[]')
    setFavoritos(ids)
    if (ids.length > 0) {
      fetchPropiedadesFavoritas(ids)
    } else {
      setCargando(false)
    }

    return () => subscription.unsubscribe()
  }, [])

  // Cerrar menú al tocar afuera
  useEffect(() => {
    if (!menuAbierto) return
    const handler = () => setMenuAbierto(false)
    document.addEventListener('click', handler)
    return () => document.removeEventListener('click', handler)
  }, [menuAbierto])

  const fetchPropiedadesFavoritas = async (ids) => {
    const { data } = await supabase.from('propiedades').select('*').in('id', ids)
    if (data) setPropiedades(data)
    setCargando(false)
  }

  const quitarFavorito = (id) => {
    const nuevosFavs = favoritos.filter(favId => favId !== id)
    setFavoritos(nuevosFavs)
    setPropiedades(propiedades.filter(p => p.id !== id))
    localStorage.setItem('rn_favoritos', JSON.stringify(nuevosFavs))
  }

  return (
    <main style={{ minHeight: '100vh', backgroundColor: '#f8fafc', fontFamily: 'system-ui, sans-serif' }}>

      <style>{`
        *, *::before, *::after { box-sizing: border-box; }

        /* Hamburguesa */
        .hamburger {
          display: none; flex-direction: column; justify-content: center;
          align-items: center; gap: 5px;
          width: 44px; height: 44px; border: none; background: none;
          cursor: pointer; padding: 8px; border-radius: 10px;
          -webkit-tap-highlight-color: transparent;
        }
        .hamburger span {
          display: block; width: 22px; height: 2px;
          background: #020617; border-radius: 2px;
          transition: transform 0.25s, opacity 0.25s;
        }
        .hamburger.open span:nth-child(1) { transform: translateY(7px) rotate(45deg); }
        .hamburger.open span:nth-child(2) { opacity: 0; }
        .hamburger.open span:nth-child(3) { transform: translateY(-7px) rotate(-45deg); }

        /* Menú desplegable móvil */
        .mobile-menu {
          display: none; position: absolute; top: 80px; left: 0; right: 0;
          background: white; border-bottom: 1px solid #f1f5f9;
          padding: 12px 5%; flex-direction: column; gap: 4px;
          box-shadow: 0 8px 24px rgba(0,0,0,0.08); z-index: 99;
        }
        .mobile-menu.open { display: flex; }
        .mobile-menu a, .mobile-menu button {
          color: #020617; font-weight: 700; font-size: 1rem;
          text-decoration: none; padding: 14px 16px; border-radius: 12px;
          min-height: 48px; display: flex; align-items: center;
          border: none; background: none; cursor: pointer; width: 100%;
          -webkit-tap-highlight-color: transparent;
        }
        .mobile-menu a:active, .mobile-menu button:active { background: #f8fafc; }

        /* Desktop: links en línea */
        @media (min-width: 768px) {
          .hamburger { display: none !important; }
          .desktop-links { display: flex !important; }
          .hide-mobile { display: inline !important; }
        }
        /* Móvil: hamburguesa */
        @media (max-width: 767px) {
          .hamburger { display: flex !important; }
          .desktop-links { display: none !important; }
          .hide-mobile { display: none !important; }
        }

        /* Grid de cards */
        .favs-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(min(100%, 320px), 1fr));
          gap: 24px;
        }

        /* Card */
        .fav-card {
          background: white; border-radius: 24px;
          overflow: hidden; border: 1px solid #f1f5f9;
          transition: transform 0.2s, box-shadow 0.2s;
        }
        .fav-card:active { transform: scale(0.98); }
        @media (hover: hover) {
          .fav-card:hover { transform: translateY(-3px); box-shadow: 0 16px 32px rgba(0,0,0,0.08); }
        }

        /* Botón quitar */
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

        /* Empty state */
        .empty-state {
          text-align: center; padding: 60px 24px;
          background: white; border-radius: 28px; border: 1px solid #e2e8f0;
        }
        @media (min-width: 768px) { .empty-state { padding: 100px; } }

        /* Padding de página */
        .page-pad { padding: 50px 6%; }
        @media (min-width: 768px) { .page-pad { padding: 60px 8%; } }
      `}</style>

      {/* ── CONTENIDO ────────────────────────────── */}
      <div className="page-pad" style={{ maxWidth: '1400px', margin: '0 auto' }}>
        <h1 style={{ fontSize: 'clamp(2rem, 6vw, 3rem)', fontWeight: '900', color: '#020617', marginBottom: '8px', letterSpacing: '-2px' }}>
          Mis Favoritos ❤️
        </h1>
        <p style={{ color: '#64748b', fontSize: '1.05rem', marginBottom: '40px' }}>
          Estas son las propiedades que te interesaron.
        </p>

        {/* Estado: cargando */}
        {cargando && (
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

        {/* Estado: sin favoritos */}
        {!cargando && propiedades.length === 0 && (
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

        {/* Lista de favoritos */}
        {!cargando && propiedades.length > 0 && (
          <div className="favs-grid">
            {propiedades.map(p => (
              <div key={p.id} style={{ position: 'relative' }}>
                <button className="btn-quitar" onClick={() => quitarFavorito(p.id)}>
                  QUITAR ✕
                </button>
                <Link href={`/propiedad/${p.id}`} style={{ textDecoration: 'none', color: 'inherit' }}>
                  <div className="fav-card">
                    <img
                      src={p.imagenes?.[0]}
                      alt={p.titulo}
                      loading="lazy"
                      style={{ width: '100%', height: '210px', objectFit: 'cover', display: 'block' }}
                    />
                    <div style={{ padding: '20px' }}>
                      <span style={{ color: '#F59E0B', fontWeight: '800', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '1px' }}>
                        📍 {p.zona}
                      </span>
                      <h3 style={{ fontSize: 'clamp(1.1rem, 3vw, 1.3rem)', fontWeight: '900', color: '#020617', margin: '8px 0 10px', lineHeight: 1.2 }}>
                        {p.titulo}
                      </h3>
                      <p style={{ color: '#4F46E5', fontWeight: '800', fontSize: '1.1rem', margin: 0 }}>
                        {p.moneda} {Number(p.precio).toLocaleString('es-AR')}
                      </p>
                      {(p.habitaciones || p.banos) && (
                        <div style={{ display: 'flex', gap: '16px', marginTop: '12px', paddingTop: '12px', borderTop: '1px solid #f1f5f9', color: '#64748b', fontWeight: '700', fontSize: '0.9rem' }}>
                          {p.habitaciones && <span>🛏️ {p.habitaciones} Dorm.</span>}
                          {p.banos && <span>🚿 {p.banos} Baños</span>}
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

      {/* ── FOOTER MÍNIMO ────────────────────────── */}
      <footer style={{ textAlign: 'center', padding: '40px 6% max(40px, env(safe-area-inset-bottom))', marginTop: '60px', borderTop: '1px solid #e2e8f0' }}>
        <p style={{ color: '#94a3b8', fontSize: '0.85rem', fontWeight: '700', letterSpacing: '2px' }}>
          © 2026 RN INMOBILIARIA · POSADAS, MISIONES
        </p>
      </footer>
    </main>
  )
}