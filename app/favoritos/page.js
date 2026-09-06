'use client'
import { useEffect, useState } from 'react'
import Link from 'next/link'
import { supabase } from '../../lib/supabase'
import { listarPorIds } from '../../lib/propiedades'
import { useFavoritos } from '../../lib/useFavoritos'
import CardPropiedad from '../../components/CardPropiedad'

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
    return () => { activo = false }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [claveFavs])

  return (
    <main className="seccion">
      <div className="contenedor">
        <header className="cabecera-seccion">
          <div>
            <span className="antetitulo">Tu selección</span>
            <h1 className="titulo-seccion">Mis favoritos</h1>
            <p className="bajada" style={{ marginTop: 10 }}>
              Las propiedades que guardaste. Se guardan en este navegador.
            </p>
          </div>
        </header>

        {error && (
          <div className="vacio">
            <p className="bajada" style={{ margin: '0 auto' }}>
              No pudimos cargar tus favoritos. Probá recargar la página.
            </p>
          </div>
        )}

        {!error && cargando && (
          <div className="grilla-props">
            {[1, 2, 3].map((i) => (
              <div key={i} className="panel" style={{ overflow: 'hidden' }}>
                <div className="esqueleto" style={{ height: 200, borderRadius: 0 }} />
                <div style={{ padding: 20, display: 'grid', gap: 10 }}>
                  <div className="esqueleto" style={{ height: 18, width: '70%' }} />
                  <div className="esqueleto" style={{ height: 14, width: '40%' }} />
                </div>
              </div>
            ))}
          </div>
        )}

        {!error && !cargando && propiedades.length === 0 && (
          <div className="vacio">
            <p style={{ fontSize: '2.6rem', marginBottom: 14 }} aria-hidden="true">🤍</p>
            <h2 style={{ fontSize: '1.4rem', marginBottom: 10 }}>Todavía no guardaste nada</h2>
            <p className="bajada" style={{ margin: '0 auto 24px' }}>
              Tocá el corazón en cualquier propiedad para tenerla a mano acá.
            </p>
            <Link href="/propiedades" className="btn btn-primario">
              Explorar el catálogo
            </Link>
          </div>
        )}

        {!error && !cargando && propiedades.length > 0 && (
          <div className="grilla-props">
            {propiedades.map((p) => (
              <CardPropiedad
                key={p.id}
                propiedad={p}
                mostrarFavorito={false}
                accion={
                  <button
                    type="button"
                    className="btn-quitar-fav"
                    onClick={() => quitarFavorito(p.id)}
                  >
                    Quitar
                  </button>
                }
              />
            ))}
          </div>
        )}
      </div>

      <style>{`
        .btn-quitar-fav {
          position: absolute;
          top: 12px; right: 12px;
          z-index: 3;
          padding: 8px 15px;
          border: none;
          border-radius: var(--r-full);
          background: rgba(255,255,255,0.94);
          backdrop-filter: blur(8px);
          box-shadow: var(--sombra-sm);
          color: var(--tierra-600);
          font-size: 0.78rem; font-weight: 600;
          transition: background-color .18s, transform .18s;
        }
        .btn-quitar-fav:hover { background: var(--tierra-600); color: #fff; }
        .btn-quitar-fav:active { transform: scale(0.95); }
      `}</style>
    </main>
  )
}
