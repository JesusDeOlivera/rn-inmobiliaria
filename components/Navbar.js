'use client'

import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'
import Link from 'next/link'
import { usePathname } from 'next/navigation'

export default function Navbar() {
  const pathname = usePathname()
  const [sesion, setSesion] = useState(null)
  const [favoritos, setFavoritos] = useState([])
  const [abierto, setAbierto] = useState(false)

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => setSesion(session))
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_e, session) => setSesion(session))
    
    const cargarFavs = () => {
      const ids = JSON.parse(localStorage.getItem('rn_favoritos') || '[]')
      setFavoritos(ids)
    }

    cargarFavs()
    window.addEventListener('storage', cargarFavs)
    
    return () => {
      subscription.unsubscribe()
      window.removeEventListener('storage', cargarFavs)
    }
  }, [])

  useEffect(() => {
    setAbierto(false)
  }, [pathname])

  useEffect(() => {
    if (abierto) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }
  }, [abierto])

  return (
    <>
      {/* Header Fijo */}
      <header style={{
        position: 'fixed', top: 0, left: 0, right: 0, height: '75px',
        background: 'white', borderBottom: '1px solid #f1f5f9', zIndex: 1000,
        display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 6%'
      }}>
        
        {/* LOGO */}
        <Link href="/" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div style={{ background: '#020617', color: 'white', padding: '8px 12px', borderRadius: '12px', fontWeight: 900 }}>
            RN
          </div>
          {/* Texto que se oculta en pantallas muy chicas (< 400px) */}
          <span style={{ fontWeight: 900, color: '#020617', fontSize: '1rem', letterSpacing: '-1px' }} className="logo-texto">
            INMOBILIARIA
          </span>
        </Link>

        {/* Desktop (Se oculta en móvil con CSS) */}
        <nav className="nav-desktop" style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <Link href="/" style={navLinkStyle(pathname === '/')}>Inicio</Link>
          <Link href="/propiedades" style={navLinkStyle(pathname === '/propiedades')}>Propiedades</Link>
          <Link href="/catalogo" style={navLinkStyle(pathname === '/catalogo')}>Búsqueda</Link>
          <Link href="/favoritos" style={{ ...navLinkStyle(pathname === '/favoritos'), color: '#ef4444' }}>
            ❤️ {favoritos.length > 0 && `(${favoritos.length})`}
          </Link>
        </nav>

        {/* Botón Hamburguesa - LIMPIO - Sin onTouchStart raro */}
        <button
          onClick={() => setAbierto(!abierto)}
          style={{
            width: '45px', height: '45px', background: '#f8fafc', border: '1px solid #e2e8f0',
            borderRadius: '12px', display: 'flex', flexDirection: 'column', 
            justifyContent: 'center', alignItems: 'center', gap: '5px', cursor: 'pointer'
          }}
          className="btn-menu"
        >
          <div style={{ ...lineaStyle, transform: abierto ? 'translateY(7px) rotate(45deg)' : 'none' }} />
          <div style={{ ...lineaStyle, opacity: abierto ? 0 : 1 }} />
          <div style={{ ...lineaStyle, transform: abierto ? 'translateY(-7px) rotate(-45deg)' : 'none' }} />
        </button>
      </header>

      {/* Spacer */}
      <div style={{ height: '75px' }} />

      {/* Overlay del Menú */}
      {abierto && (
        <div 
          onClick={() => setAbierto(false)}
          style={{ position: 'fixed', inset: 0, background: 'rgba(2, 6, 23, 0.6)', zIndex: 1100, backdropFilter: 'blur(4px)' }} 
        />
      )}

      {/* Menú Desplegable (Bottom Sheet) */}
      <div style={{
        position: 'fixed', bottom: 0, left: 0, right: 0, background: 'white',
        borderRadius: '30px 30px 0 0', padding: '30px', zIndex: 1200,
        transform: abierto ? 'translateY(0)' : 'translateY(100%)',
        transition: 'transform 0.4s cubic-bezier(0.16, 1, 0.3, 1)',
        boxShadow: '0 -20px 40px rgba(0,0,0,0.1)'
      }}>
        {/* Handle visual para que sepan que es un menú */}
        <div style={{ width: '40px', height: '5px', background: '#e2e8f0', borderRadius: '10px', margin: '0 auto 25px' }} />

        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          <Link href="/" style={mobileLinkStyle(pathname === '/')}>🏠 Inicio</Link>
          <Link href="/propiedades" style={mobileLinkStyle(pathname === '/propiedades')}>🏘️ Propiedades</Link>
          <Link href="/catalogo" style={mobileLinkStyle(pathname === '/catalogo')}>🔍 Búsqueda Avanzada</Link>
          <Link href="/favoritos" style={{ ...mobileLinkStyle(pathname === '/favoritos'), color: '#ef4444', background: '#fef2f2' }}>
            ❤️ Mis Favoritos ({favoritos.length})
          </Link>
          <div style={{ height: '1px', background: '#f1f5f9', margin: '10px 0' }} />
          {!sesion ? (
            <Link href="/login" style={mobileLinkStyle(false)}>👤 Ingresar al Panel</Link>
          ) : (
            <Link href="/admin" style={{ ...mobileLinkStyle(true), background: '#020617', color: 'white' }}>⚙️ Panel Admin</Link>
          )}
        </div>
      </div>

      {/* CSS para el manejo de visibilidad sin Tailwind (por si falla) */}
      <style>{`
        @media (max-width: 768px) {
          .nav-desktop { display: none !important; }
          .btn-menu { display: flex !important; }
        }
        @media (min-width: 769px) {
          .nav-desktop { display: flex !important; }
          .btn-menu { display: none !important; }
        }
        @media (max-width: 450px) {
          .logo-texto { display: none; }
        }
      `}</style>
    </>
  )
}

// Estilos auxiliares para no repetir código
const navLinkStyle = (activo) => ({
  padding: '10px 18px', borderRadius: '10px', textDecoration: 'none',
  fontWeight: 700, fontSize: '0.9rem', transition: '0.2s',
  color: activo ? '#4F46E5' : '#64748b',
  background: activo ? '#EEF2FF' : 'transparent'
})

const mobileLinkStyle = (activo) => ({
  padding: '18px', borderRadius: '18px', textDecoration: 'none',
  fontWeight: 800, fontSize: '1.1rem', display: 'flex', alignItems: 'center', gap: '12px',
  color: activo ? '#4F46E5' : '#020617',
  background: activo ? '#EEF2FF' : '#f8fafc'
})

const lineaStyle = {
  width: '24px', height: '2px', background: '#020617', 
  borderRadius: '10px', transition: '0.3s'
}