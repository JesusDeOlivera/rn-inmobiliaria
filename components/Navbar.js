'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useSesion } from '../lib/useSesion'
import { useFavoritos } from '../lib/useFavoritos'

const ENLACES = [
  { href: '/', etiqueta: 'Inicio', icono: '🏠' },
  { href: '/propiedades', etiqueta: 'Propiedades', icono: '🏘️' },
  { href: '/catalogo', etiqueta: 'Búsqueda', icono: '🔍' },
]

export default function Navbar() {
  const pathname = usePathname()
  const { sesion } = useSesion()
  const { favoritos } = useFavoritos()
  const [abierto, setAbierto] = useState(false)
  const [desplazado, setDesplazado] = useState(false)

  // Cerrar el menú al cambiar de ruta (patrón render-time, sin useEffect).
  const [rutaPrevia, setRutaPrevia] = useState(pathname)
  if (pathname !== rutaPrevia) {
    setRutaPrevia(pathname)
    setAbierto(false)
  }

  // La barra gana sombra y opacidad al bajar.
  useEffect(() => {
    const alScrollear = () => setDesplazado(window.scrollY > 12)
    alScrollear()
    window.addEventListener('scroll', alScrollear, { passive: true })
    return () => window.removeEventListener('scroll', alScrollear)
  }, [])

  useEffect(() => {
    document.body.style.overflow = abierto ? 'hidden' : ''
    return () => { document.body.style.overflow = '' }
  }, [abierto])

  const esActivo = (href) => pathname === href

  return (
    <>
      <header className={`nav ${desplazado ? 'nav-desplazado' : ''}`}>
        <Link href="/" className="nav-logo" aria-label="RN Inmobiliaria — Inicio">
          <span className="nav-logo-marca">RN</span>
          <span className="nav-logo-texto">
            <span className="nav-logo-nombre">Inmobiliaria</span>
            <span className="nav-logo-lugar">Posadas · Misiones</span>
          </span>
        </Link>

        <nav className="nav-links" aria-label="Principal">
          {ENLACES.map((e) => (
            <Link
              key={e.href}
              href={e.href}
              className={`nav-link ${esActivo(e.href) ? 'nav-link-activo' : ''}`}
            >
              {e.etiqueta}
            </Link>
          ))}
        </nav>

        <div className="nav-acciones">
          <Link
            href="/favoritos"
            className={`nav-fav ${esActivo('/favoritos') ? 'nav-fav-activo' : ''}`}
            aria-label={`Favoritos (${favoritos.length})`}
          >
            <span aria-hidden="true">{favoritos.length > 0 ? '❤️' : '🤍'}</span>
            {favoritos.length > 0 && <span className="nav-fav-burbuja">{favoritos.length}</span>}
          </Link>

          {sesion ? (
            <Link href="/admin" className="btn btn-primario nav-btn ocultar-movil">Panel</Link>
          ) : (
            <Link href="/login" className="btn btn-secundario nav-btn ocultar-movil">Ingresar</Link>
          )}

          <button
            type="button"
            onClick={() => setAbierto(!abierto)}
            className={`nav-hamburguesa ${abierto ? 'abierta' : ''}`}
            aria-label={abierto ? 'Cerrar menú' : 'Abrir menú'}
            aria-expanded={abierto}
          >
            <span /><span /><span />
          </button>
        </div>
      </header>

      <div className="nav-espaciador" />

      {/* Menú móvil */}
      {abierto && <div className="nav-velo" onClick={() => setAbierto(false)} />}
      <div className={`nav-hoja ${abierto ? 'abierta' : ''}`} aria-hidden={!abierto}>
        <div className="nav-hoja-tirador" />
        <nav className="nav-hoja-links">
          {ENLACES.map((e) => (
            <Link
              key={e.href}
              href={e.href}
              className={`nav-hoja-link ${esActivo(e.href) ? 'activo' : ''}`}
            >
              <span aria-hidden="true">{e.icono}</span> {e.etiqueta}
            </Link>
          ))}
          <Link
            href="/favoritos"
            className={`nav-hoja-link ${esActivo('/favoritos') ? 'activo' : ''}`}
          >
            <span aria-hidden="true">❤️</span> Mis favoritos ({favoritos.length})
          </Link>
          <div className="nav-hoja-separador" />
          {sesion ? (
            <Link href="/admin" className="nav-hoja-link destacado">
              <span aria-hidden="true">⚙️</span> Panel de administración
            </Link>
          ) : (
            <Link href="/login" className="nav-hoja-link">
              <span aria-hidden="true">👤</span> Ingresar al panel
            </Link>
          )}
        </nav>
      </div>

      <style>{`
        .nav {
          position: fixed; inset: 0 0 auto 0;
          height: var(--nav-alto);
          z-index: 1000;
          display: flex; align-items: center; justify-content: space-between;
          gap: 16px;
          padding-inline: clamp(16px, 5vw, 56px);
          background: rgba(253, 251, 247, 0.82);
          backdrop-filter: blur(14px);
          -webkit-backdrop-filter: blur(14px);
          border-bottom: 1px solid transparent;
          transition: border-color .25s ease, box-shadow .25s ease, background-color .25s ease;
        }
        .nav-desplazado {
          border-bottom-color: var(--borde-suave);
          box-shadow: 0 4px 24px rgba(74, 24, 9, 0.05);
          background: rgba(253, 251, 247, 0.94);
        }
        .nav-espaciador { height: var(--nav-alto); }

        .nav-logo { display: flex; align-items: center; gap: 11px; text-decoration: none; }
        .nav-logo-marca {
          display: grid; place-items: center;
          width: 42px; height: 42px;
          border-radius: 13px;
          background: var(--tierra-600);
          color: #fff;
          font-family: var(--fuente-titulo);
          font-weight: 600; font-size: 1.06rem;
          letter-spacing: -0.02em;
          box-shadow: 0 5px 14px rgba(156, 58, 30, 0.3);
        }
        .nav-logo-texto { display: flex; flex-direction: column; line-height: 1.15; }
        .nav-logo-nombre {
          font-family: var(--fuente-titulo);
          font-size: 1.02rem; font-weight: 600;
          color: var(--tinta-900); letter-spacing: -0.02em;
        }
        .nav-logo-lugar {
          font-size: 0.63rem; font-weight: 600;
          letter-spacing: 0.11em; text-transform: uppercase;
          color: var(--tinta-400);
        }

        .nav-links { display: flex; align-items: center; gap: 4px; }
        .nav-link {
          position: relative;
          padding: 9px 15px;
          border-radius: var(--r-full);
          font-size: 0.93rem; font-weight: 500;
          color: var(--tinta-500);
          text-decoration: none;
          transition: color .18s, background-color .18s;
        }
        .nav-link:hover { color: var(--tinta-900); background: var(--arena-100); }
        .nav-link-activo { color: var(--tierra-600); font-weight: 600; }
        .nav-link-activo::after {
          content: ''; position: absolute;
          left: 15px; right: 15px; bottom: 2px;
          height: 2px; border-radius: 2px;
          background: var(--tierra-600);
        }

        .nav-acciones { display: flex; align-items: center; gap: 10px; }

        .nav-fav {
          position: relative;
          display: grid; place-items: center;
          width: 42px; height: 42px;
          border-radius: var(--r-full);
          text-decoration: none; font-size: 1.05rem;
          transition: background-color .18s;
        }
        .nav-fav:hover, .nav-fav-activo { background: var(--tierra-50); }
        .nav-fav-burbuja {
          position: absolute; top: 1px; right: 0;
          min-width: 18px; height: 18px; padding: 0 5px;
          display: grid; place-items: center;
          border-radius: var(--r-full);
          background: var(--tierra-600); color: #fff;
          font-size: 0.66rem; font-weight: 700;
          border: 2px solid var(--arena-50);
        }

        .nav-btn { min-height: 42px; padding: 10px 22px; font-size: 0.9rem; }

        .nav-hamburguesa {
          display: none;
          flex-direction: column; align-items: center; justify-content: center;
          gap: 5px;
          width: 42px; height: 42px;
          border: 1px solid var(--borde);
          border-radius: 13px;
          background: var(--superficie);
        }
        .nav-hamburguesa span {
          display: block; width: 17px; height: 1.8px;
          border-radius: 2px; background: var(--tinta-900);
          transition: transform .25s ease, opacity .2s ease;
        }
        .nav-hamburguesa.abierta span:nth-child(1) { transform: translateY(6.8px) rotate(45deg); }
        .nav-hamburguesa.abierta span:nth-child(2) { opacity: 0; }
        .nav-hamburguesa.abierta span:nth-child(3) { transform: translateY(-6.8px) rotate(-45deg); }

        .nav-velo {
          position: fixed; inset: 0; z-index: 1100;
          background: rgba(10, 33, 25, 0.5);
          backdrop-filter: blur(3px);
          animation: aparecer .25s ease;
        }
        @keyframes aparecer { from { opacity: 0 } to { opacity: 1 } }

        .nav-hoja {
          position: fixed; inset: auto 0 0 0; z-index: 1200;
          background: var(--superficie);
          border-radius: var(--r-xl) var(--r-xl) 0 0;
          padding: 14px 20px max(24px, env(safe-area-inset-bottom));
          transform: translateY(100%);
          transition: transform .42s cubic-bezier(0.16, 1, 0.3, 1);
          box-shadow: 0 -20px 50px rgba(10, 33, 25, 0.18);
        }
        .nav-hoja.abierta { transform: translateY(0); }
        .nav-hoja-tirador {
          width: 40px; height: 4px; border-radius: var(--r-full);
          background: var(--arena-300); margin: 0 auto 18px;
        }
        .nav-hoja-links { display: flex; flex-direction: column; gap: 4px; }
        .nav-hoja-link {
          display: flex; align-items: center; gap: 13px;
          padding: 15px 16px;
          border-radius: var(--r-md);
          font-size: 1.02rem; font-weight: 500;
          color: var(--tinta-900); text-decoration: none;
          transition: background-color .16s;
        }
        .nav-hoja-link:active { background: var(--arena-100); }
        .nav-hoja-link.activo { background: var(--tierra-50); color: var(--tierra-600); font-weight: 600; }
        .nav-hoja-link.destacado { background: var(--selva-900); color: #fff; }
        .nav-hoja-separador { height: 1px; background: var(--borde-suave); margin: 10px 0; }

        @media (max-width: 900px) {
          .nav-links { display: none; }
          .nav-hamburguesa { display: flex; }
        }
        @media (min-width: 901px) { .nav-hoja, .nav-velo { display: none; } }
        @media (max-width: 420px) { .nav-logo-texto { display: none; } }
      `}</style>
    </>
  )
}
