'use client'
import { useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import CardPropiedad from '../../components/CardPropiedad'
import { GRUPOS_BARRIOS, TIPOS_INMUEBLE } from '../../lib/barrios'

// Recibe las propiedades YA cargadas desde el servidor. Solo filtra y
// renderiza, así el HTML inicial ya viene con todas las fichas.
export default function PropiedadesCliente({ propiedades }) {
  const [tipo, setTipo] = useState('Todos')
  const [zona, setZona] = useState('Todas')
  const [busqueda, setBusqueda] = useState('')
  const [busquedaDebounced, setBusquedaDebounced] = useState('')

  useEffect(() => {
    const t = setTimeout(() => setBusquedaDebounced(busqueda), 250)
    return () => clearTimeout(t)
  }, [busqueda])

  const filtradas = useMemo(() => {
    let temp = [...propiedades]
    if (busquedaDebounced) {
      const q = busquedaDebounced.toLowerCase()
      temp = temp.filter((p) => p.titulo?.toLowerCase().includes(q))
    }
    if (zona !== 'Todas') temp = temp.filter((p) => p.barrio === zona)
    if (tipo !== 'Todos') temp = temp.filter((p) => p.tipo === tipo)
    return temp
  }, [busquedaDebounced, tipo, zona, propiedades])

  const limpiar = () => { setBusqueda(''); setZona('Todas'); setTipo('Todos') }
  const hayFiltros = busqueda || zona !== 'Todas' || tipo !== 'Todos'

  return (
    <>
      {/* Buscador flotante sobre el hero */}
      <div className="contenedor">
        <div className="panel buscador">
          <div className="buscador-campo">
            <label className="etiqueta" htmlFor="f-tipo">Tipo</label>
            <select id="f-tipo" className="campo" value={tipo} onChange={(e) => setTipo(e.target.value)}>
              <option value="Todos">Cualquier tipo</option>
              {TIPOS_INMUEBLE.map((t) => <option key={t}>{t}</option>)}
            </select>
          </div>

          <div className="buscador-campo">
            <label className="etiqueta" htmlFor="f-zona">Zona</label>
            <select id="f-zona" className="campo" value={zona} onChange={(e) => setZona(e.target.value)}>
              <option value="Todas">Todas las zonas</option>
              {GRUPOS_BARRIOS.map((g) => (
                <optgroup key={g.label} label={g.label}>
                  {g.barrios.map((b) => <option key={b} value={b}>{b}</option>)}
                </optgroup>
              ))}
            </select>
          </div>

          <div className="buscador-campo">
            <label className="etiqueta" htmlFor="f-busqueda">Buscar</label>
            <input
              id="f-busqueda" className="campo" type="text"
              value={busqueda} onChange={(e) => setBusqueda(e.target.value)}
              placeholder="Ej: Duplex, casa con patio…"
            />
          </div>

          <div className="buscador-acciones">
            <Link href="/catalogo" className="btn btn-secundario btn-bloque">
              Búsqueda avanzada
            </Link>
          </div>
        </div>
      </div>

      <section id="resultados" className="seccion">
        <div className="contenedor">
          <header className="cabecera-seccion">
            <div>
              <span className="antetitulo">Catálogo</span>
              <h2 className="titulo-seccion">
                {filtradas.length}{' '}
                {filtradas.length === 1 ? 'propiedad disponible' : 'propiedades disponibles'}
              </h2>
            </div>
            {hayFiltros && (
              <button type="button" onClick={limpiar} className="enlace-flecha" style={{ border: 'none', background: 'none' }}>
                Limpiar filtros <span aria-hidden="true">×</span>
              </button>
            )}
          </header>

          {filtradas.length === 0 ? (
            <div className="vacio">
              <p className="bajada" style={{ margin: '0 auto 18px' }}>
                {propiedades.length === 0
                  ? 'Todavía no hay propiedades publicadas. Escribinos y te avisamos cuando entren nuevas.'
                  : 'No encontramos propiedades con esos criterios.'}
              </p>
              {propiedades.length > 0 && (
                <button type="button" onClick={limpiar} className="btn btn-secundario">
                  Limpiar filtros
                </button>
              )}
            </div>
          ) : (
            <div className="grilla-props">
              {filtradas.map((p, i) => (
                <CardPropiedad key={p.id} propiedad={p} prioridad={i < 2} />
              ))}
            </div>
          )}
        </div>
      </section>

      <style>{`
        .buscador {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(190px, 1fr));
          gap: 16px;
          align-items: end;
          padding: clamp(20px, 3vw, 28px);
          margin-top: -52px;
          position: relative;
          z-index: 5;
          box-shadow: var(--sombra-lg);
        }
        .buscador-campo { display: grid; }
        .buscador-acciones { display: grid; }
        @media (max-width: 640px) { .buscador { margin-top: -32px; } }
      `}</style>
    </>
  )
}
