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
    
    const ids = JSON.parse(localStorage.getItem('rn_favoritos') || '[]')
    setFavoritos(ids)
    
    const onStorage = () => setFavoritos(JSON.parse(localStorage.getItem('rn_favoritos') || '[]'))
    window.addEventListener('storage', onStorage)
    
    return () => {
      subscription.unsubscribe()
      window.removeEventListener('storage', onStorage)
    }
  }, [])

  // Cerrar al cambiar de ruta
  useEffect(() => {
    setAbierto(false)
  }, [pathname])

  // Bloquear scroll cuando está abierto
  useEffect(() => {
    if (abierto) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }
    return () => { document.body.style.overflow = '' }
  }, [abierto])

  const toggle = (e) => {
    e.preventDefault()
    e.stopPropagation()
    console.log('Toggle:', !abierto) // Debug
    setAbierto(!abierto)
  }

  const links = [
    { href: '/', label: '🏠 Inicio' },
    { href: '/propiedades', label: '🏘️ Propiedades' },
    { href: '/catalogo', label: '🔍 Búsqueda Avanzada' },
  ]

  return (
    <>
      {/* Header fijo */}
      <header style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        height: '70px',
        background: 'rgba(255,255,255,0.95)',
        backdropFilter: 'blur(10px)',
        borderBottom: '1px solid #f1f5f9',
        zIndex: 100,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '0 5%',
      }}>
        <Link href="/" style={{
          textDecoration: 'none',
          display: 'flex',
          alignItems: 'center',
          gap: '10px',
          fontWeight: 900,
          color: '#020617',
          fontSize: '1.1rem',
        }}>
          <div style={{
            background: '#020617',
            color: 'white',
            padding: '8px 12px',
            borderRadius: '10px',
            fontSize: '0.9rem',
          }}>
            RN
          </div>
          <span className="hidden sm:block">INMOBILIARIA</span>
        </Link>

        {/* Desktop */}
        <nav className="hidden md:flex items-center gap-2">
          {links.map(({ href, label }) => (
            <Link
              key={href}
              href={href}
              style={{
                padding: '8px 16px',
                borderRadius: '10px',
                textDecoration: 'none',
                color: pathname === href ? '#4F46E5' : '#64748b',
                background: pathname === href ? '#EEF2FF' : 'transparent',
                fontWeight: 700,
                fontSize: '0.9rem',
              }}
            >
              {label.replace(/^[^\s]+\s/, '')}
            </Link>
          ))}
          
          <Link href="/favoritos" style={{ 
            padding: '8px 16px', 
            color: '#ef4444',
            textDecoration: 'none',
            fontWeight: 700,
          }}>
            ❤️ {favoritos.length > 0 && <span>({favoritos.length})</span>}
          </Link>

          {!sesion ? (
            <Link href="/login" style={{
              padding: '8px 16px',
              color: '#020617',
              textDecoration: 'none',
              fontWeight: 700,
            }}>
              Ingresar
            </Link>
          ) : (
            <Link href="/admin" style={{
              background: '#020617',
              color: 'white',
              padding: '8px 16px',
              borderRadius: '10px',
              textDecoration: 'none',
              fontWeight: 700,
              fontSize: '0.85rem',
            }}>
              Admin
            </Link>
          )}
        </nav>

        {/* Botón Hamburguesa - Móvil */}
        <button
          onClick={toggle}
          onTouchStart={(e) => {
            e.preventDefault()
            toggle(e)
          }}
          style={{
            display: 'flex', // Visible solo en móvil (usar clases de Tailwind si es necesario)
            width: '48px',
            height: '48px',
            background: '#f3f4f6',
            border: 'none',
            borderRadius: '12px',
            alignItems: 'center',
            justifyContent: 'center',
            flexDirection: 'column',
            gap: '5px',
            cursor: 'pointer',
            position: 'relative',
            zIndex: 110,
            WebkitTapHighlightColor: 'rgba(0,0,0,0.1)',
          }}
          className="md:hidden"
          type="button"
          aria-label="Menu"
        >
          <span style={{
            display: 'block',
            width: '22px',
            height: '2px',
            background: '#020617',
            borderRadius: '2px',
            transition: 'transform 0.3s',
            transform: abierto ? 'translateY(7px) rotate(45deg)' : 'none',
          }} />
          <span style={{
            display: 'block',
            width: '22px',
            height: '2px',
            background: '#020617',
            borderRadius: '2px',
            transition: 'opacity 0.3s',
            opacity: abierto ? 0 : 1,
          }} />
          <span style={{
            display: 'block',
            width: '22px',
            height: '2px',
            background: '#020617',
            borderRadius: '2px',
            transition: 'transform 0.3s',
            transform: abierto ? 'translateY(-7px) rotate(-45deg)' : 'none',
          }} />
        </button>
      </header>

      {/* Spacer para el contenido (para que no quede detrás del header) */}
      <div style={{ height: '70px' }} />

      {/* BOTTOM SHEET - Menú desde abajo (patrón nativo móvil) */}
      <div style={{
        position: 'fixed',
        inset: 0,
        background: 'rgba(0,0,0,0.5)',
        zIndex: 90,
        opacity: abierto ? 1 : 0,
        pointerEvents: abierto ? 'auto' : 'none',
        transition: 'opacity 0.3s',
      }} onClick={() => setAbierto(false)} />

      <div style={{
        position: 'fixed',
        bottom: 0,
        left: 0,
        right: 0,
        background: 'white',
        borderRadius: '24px 24px 0 0',
        padding: '24px',
        paddingBottom: 'max(24px, env(safe-area-inset-bottom))',
        zIndex: 95,
        transform: abierto ? 'translateY(0)' : 'translateY(100%)',
        transition: 'transform 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
        boxShadow: '0 -10px 40px rgba(0,0,0,0.2)',
        maxHeight: '85vh',
        overflowY: 'auto',
      }}>
        {/* Handle visual */}
        <div style={{
          width: '40px',
          height: '4px',
          background: '#e2e8f0',
          borderRadius: '2px',
          margin: '0 auto 20px',
        }} />

        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          {links.map(({ href, label }) => (
            <Link
              key={href}
              href={href}
              onClick={() => setAbierto(false)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                padding: '16px',
                borderRadius: '16px',
                textDecoration: 'none',
                color: pathname === href ? '#4F46E5' : '#020617',
                background: pathname === href ? '#EEF2FF' : 'transparent',
                fontWeight: 700,
                fontSize: '1.1rem',
              }}
            >
              {label}
            </Link>
          ))}

          <Link
            href="/favoritos"
            onClick={() => setAbierto(false)}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              padding: '16px',
              borderRadius: '16px',
              textDecoration: 'none',
              color: '#ef4444',
              background: '#fef2f2',
              fontWeight: 700,
              fontSize: '1.1rem',
              marginTop: '8px',
            }}
          >
            ❤️ Favoritos
            {favoritos.length > 0 && (
              <span style={{ marginLeft: 'auto', background: 'white', padding: '4px 12px', borderRadius: '20px', fontSize: '0.9rem' }}>
                {favoritos.length}
              </span>
            )}
          </Link>

          <div style={{ height: '1px', background: '#f1f5f9', margin: '16px 0' }} />

          {!sesion ? (
            <Link
              href="/login"
              onClick={() => setAbierto(false)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                padding: '16px',
                borderRadius: '16px',
                textDecoration: 'none',
                color: '#020617',
                fontWeight: 700,
                fontSize: '1.1rem',
              }}
            >
              👤 Ingresar
            </Link>
          ) : (
            <Link
              href="/admin"
              onClick={() => setAbierto(false)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                padding: '16px',
                borderRadius: '16px',
                textDecoration: 'none',
                color: '#4F46E5',
                background: '#EEF2FF',
                fontWeight: 700,
                fontSize: '1.1rem',
              }}
            >
              ⚙️ Panel Admin
            </Link>
          )}
        </div>
      </div>
    </>
  )
}