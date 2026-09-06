'use client'
import dynamic from 'next/dynamic'
import Link from 'next/link'
import { useEffect, useMemo, useState } from 'react'
import CardPropiedad from '../../components/CardPropiedad'
import { TIPOS_INMUEBLE } from '../../lib/barrios'

// Leaflet toca el DOM directamente: solo en el cliente.
const MapaPropiedades = dynamic(() => import('../../components/MapaPropiedades'), {
  ssr: false,
  loading: () => <div className="esqueleto" style={{ height: '72vh', borderRadius: 'var(--r-lg)' }} />,
})

function Segmento({ etiqueta, activo, onClick }) {
  return (
    <button type="button" onClick={onClick} className={`segmento ${activo ? 'activo' : ''}`}>
      {etiqueta}
    </button>
  )
}

function Radio({ etiqueta, valor, onClick }) {
  const activo = valor === etiqueta
  return (
    <button type="button" onClick={onClick} className={`radio ${activo ? 'activo' : ''}`} aria-pressed={activo}>
      <span className="radio-punto" />
      <span>{etiqueta}</span>
    </button>
  )
}

// Recibe las propiedades ya cargadas desde el servidor; solo filtra y renderiza.
export default function CatalogoCliente({ propiedades }) {
  const [ubicacion, setUbicacion] = useState('')
  const [ubicacionDebounced, setUbicacionDebounced] = useState('')
  const [tipoPropiedad, setTipoPropiedad] = useState('Todos')
  const [precioMin, setPrecioMin] = useState('')
  const [precioMax, setPrecioMax] = useState('')
  const [moneda, setMoneda] = useState('Todos')
  const [ambientes, setAmbientes] = useState('Todos')
  const [supMin, setSupMin] = useState('')
  const [supMax, setSupMax] = useState('')

  const [vistaActiva, setVistaActiva] = useState('grilla')
  const [filtrosAbiertos, setFiltrosAbiertos] = useState(false)

  useEffect(() => {
    const t = setTimeout(() => setUbicacionDebounced(ubicacion), 250)
    return () => clearTimeout(t)
  }, [ubicacion])

  const filtradas = useMemo(() => {
    let temp = [...propiedades]
    if (ubicacionDebounced) {
      const q = ubicacionDebounced.toLowerCase()
      temp = temp.filter(
        (p) =>
          p.barrio?.toLowerCase().includes(q) ||
          p.localidad?.toLowerCase().includes(q) ||
          p.titulo?.toLowerCase().includes(q) ||
          p.direccion?.toLowerCase().includes(q)
      )
    }
    if (tipoPropiedad !== 'Todos') temp = temp.filter((p) => p.tipo === tipoPropiedad)
    if (moneda !== 'Todos') temp = temp.filter((p) => p.moneda === moneda)
    if (precioMin) temp = temp.filter((p) => Number(p.precio) >= Number(precioMin))
    if (precioMax) temp = temp.filter((p) => Number(p.precio) <= Number(precioMax))
    if (ambientes !== 'Todos') {
      if (ambientes === '4+') temp = temp.filter((p) => p.dormitorios >= 4)
      else temp = temp.filter((p) => p.dormitorios === Number(ambientes))
    }
    if (supMin) temp = temp.filter((p) => p.superficie_m2 >= Number(supMin))
    if (supMax) temp = temp.filter((p) => p.superficie_m2 <= Number(supMax))
    return temp
  }, [ubicacionDebounced, tipoPropiedad, precioMin, precioMax, moneda, ambientes, supMin, supMax, propiedades])

  const limpiarFiltros = () => {
    setUbicacion(''); setTipoPropiedad('Todos'); setPrecioMin(''); setPrecioMax('')
    setMoneda('Todos'); setAmbientes('Todos'); setSupMin(''); setSupMax(''); setFiltrosAbiertos(false)
  }

  const hayFiltros =
    ubicacion || tipoPropiedad !== 'Todos' || precioMin || precioMax ||
    moneda !== 'Todos' || ambientes !== 'Todos' || supMin || supMax

  return (
    <main className="seccion-compacta">
      <div className="contenedor">
        <nav className="miga" aria-label="Ruta">
          <Link href="/">Inicio</Link>
          <span aria-hidden="true">/</span>
          <span>Búsqueda avanzada</span>
        </nav>

        <button
          type="button"
          className="btn btn-secundario btn-bloque btn-filtros-movil"
          onClick={() => setFiltrosAbiertos(!filtrosAbiertos)}
        >
          {filtrosAbiertos ? 'Ocultar filtros' : 'Mostrar filtros'}
          {hayFiltros && <span className="punto-filtro" aria-label="filtros activos" />}
        </button>

        <div className="layout-busqueda">
          {/* ---------------- FILTROS ---------------- */}
          <aside className={`panel filtros ${filtrosAbiertos ? 'abierto' : ''}`}>
            <div className="filtros-cabecera">
              <h2 className="filtros-titulo">Filtros</h2>
              {hayFiltros && (
                <button type="button" onClick={limpiarFiltros} className="filtros-limpiar">
                  Limpiar
                </button>
              )}
            </div>

            <div className="filtro-grupo">
              <label className="etiqueta" htmlFor="c-ubicacion">Texto o dirección</label>
              <input
                id="c-ubicacion" className="campo" type="text"
                value={ubicacion} onChange={(e) => setUbicacion(e.target.value)}
                placeholder="Ej: Villa Cabello, Rademacher…"
              />
            </div>

            <div className="filtro-grupo">
              <span className="etiqueta">Tipo de propiedad</span>
              <div className="radios">
                <Radio etiqueta="Todos" valor={tipoPropiedad} onClick={() => setTipoPropiedad('Todos')} />
                {TIPOS_INMUEBLE.map((t) => (
                  <Radio key={t} etiqueta={t} valor={tipoPropiedad} onClick={() => setTipoPropiedad(t)} />
                ))}
              </div>
            </div>

            <div className="filtro-grupo">
              <span className="etiqueta">Precio</span>
              <div className="par-campos">
                <input aria-label="Precio mínimo" className="campo" type="number" inputMode="numeric"
                  value={precioMin} onChange={(e) => setPrecioMin(e.target.value)} placeholder="Mín." />
                <input aria-label="Precio máximo" className="campo" type="number" inputMode="numeric"
                  value={precioMax} onChange={(e) => setPrecioMax(e.target.value)} placeholder="Máx." />
              </div>
              <div className="segmentos">
                <Segmento etiqueta="Todos" activo={moneda === 'Todos'} onClick={() => setMoneda('Todos')} />
                <Segmento etiqueta="USD" activo={moneda === 'USD'} onClick={() => setMoneda('USD')} />
                <Segmento etiqueta="ARS" activo={moneda === 'ARS'} onClick={() => setMoneda('ARS')} />
              </div>
            </div>

            <div className="filtro-grupo">
              <span className="etiqueta">Dormitorios</span>
              <div className="segmentos">
                {['Todos', '1', '2', '3', '4+'].map((a) => (
                  <Segmento key={a} etiqueta={a} activo={ambientes === a} onClick={() => setAmbientes(a)} />
                ))}
              </div>
            </div>

            <div className="filtro-grupo">
              <span className="etiqueta">Superficie (m²)</span>
              <div className="par-campos">
                <input aria-label="Superficie mínima" className="campo" type="number" inputMode="numeric"
                  value={supMin} onChange={(e) => setSupMin(e.target.value)} placeholder="Mín." />
                <input aria-label="Superficie máxima" className="campo" type="number" inputMode="numeric"
                  value={supMax} onChange={(e) => setSupMax(e.target.value)} placeholder="Máx." />
              </div>
            </div>
          </aside>

          {/* ---------------- RESULTADOS ---------------- */}
          <section className="resultados">
            <header className="resultados-cabecera">
              <div>
                <span className="antetitulo">Resultados</span>
                <h1 className="titulo-seccion resultados-titulo">
                  {filtradas.length}{' '}
                  {filtradas.length === 1 ? 'inmueble encontrado' : 'inmuebles encontrados'}
                </h1>
              </div>

              <div className="conmutador" role="tablist" aria-label="Vista">
                <button
                  type="button" role="tab" aria-selected={vistaActiva === 'grilla'}
                  className={vistaActiva === 'grilla' ? 'activo' : ''}
                  onClick={() => setVistaActiva('grilla')}
                >
                  Grilla
                </button>
                <button
                  type="button" role="tab" aria-selected={vistaActiva === 'mapa'}
                  className={vistaActiva === 'mapa' ? 'activo' : ''}
                  onClick={() => setVistaActiva('mapa')}
                >
                  Mapa
                </button>
              </div>
            </header>

            {filtradas.length === 0 ? (
              <div className="vacio">
                <p className="bajada" style={{ margin: '0 auto 18px' }}>
                  {propiedades.length === 0
                    ? 'Todavía no hay propiedades publicadas.'
                    : 'No hay propiedades que coincidan con estos filtros.'}
                </p>
                {propiedades.length > 0 && (
                  <button type="button" onClick={limpiarFiltros} className="btn btn-secundario">
                    Limpiar filtros
                  </button>
                )}
              </div>
            ) : vistaActiva === 'mapa' ? (
              <MapaPropiedades propiedades={filtradas} />
            ) : (
              <div className="grilla-props">
                {filtradas.map((p, i) => (
                  <CardPropiedad
                    key={p.id}
                    propiedad={p}
                    prioridad={i === 0}
                    sizes="(max-width: 800px) 100vw, (max-width: 1300px) 45vw, 320px"
                  />
                ))}
              </div>
            )}
          </section>
        </div>
      </div>

      <style>{`
        .miga {
          display: flex; align-items: center; gap: 10px;
          font-size: 0.85rem; color: var(--tinta-400);
          margin-bottom: 26px;
        }
        .miga a { color: var(--tinta-500); text-decoration: none; }
        .miga a:hover { color: var(--tierra-600); }
        .miga span:last-child { color: var(--tinta-900); font-weight: 500; }

        .layout-busqueda {
          display: grid;
          grid-template-columns: 300px minmax(0, 1fr);
          gap: clamp(24px, 3vw, 44px);
          align-items: start;
        }

        /* ---------- FILTROS ---------- */
        .filtros {
          padding: 24px;
          position: sticky;
          top: calc(var(--nav-alto) + 20px);
          display: grid;
          gap: 22px;
        }
        .filtros-cabecera { display: flex; align-items: center; justify-content: space-between; }
        .filtros-titulo { font-size: 1.2rem; }
        .filtros-limpiar {
          border: none; background: none;
          color: var(--tierra-600); font-size: 0.85rem; font-weight: 600;
          text-decoration: underline; text-underline-offset: 3px;
          padding: 4px;
        }
        .filtro-grupo { display: grid; gap: 10px; }
        .par-campos { display: grid; grid-template-columns: 1fr 1fr; gap: 9px; }

        .segmentos {
          display: flex; gap: 5px;
          padding: 4px;
          background: var(--arena-100);
          border-radius: var(--r-full);
        }
        .segmento {
          flex: 1;
          padding: 8px 4px;
          border: none;
          border-radius: var(--r-full);
          background: transparent;
          color: var(--tinta-500);
          font-size: 0.82rem; font-weight: 600;
          transition: background-color .18s, color .18s;
        }
        .segmento.activo { background: var(--tierra-600); color: #fff; }
        .segmento:not(.activo):hover { color: var(--tinta-900); }

        .radios { display: grid; gap: 3px; }
        .radio {
          display: flex; align-items: center; gap: 11px;
          padding: 8px 10px;
          border: none; background: none;
          border-radius: var(--r-sm);
          font-size: 0.92rem; color: var(--tinta-700);
          text-align: left; width: 100%;
          transition: background-color .16s;
        }
        .radio:hover { background: var(--arena-100); }
        .radio-punto {
          flex-shrink: 0;
          width: 16px; height: 16px;
          border-radius: 50%;
          border: 2px solid var(--arena-300);
          transition: border-color .16s, border-width .16s;
        }
        .radio.activo { color: var(--tinta-900); font-weight: 600; }
        .radio.activo .radio-punto { border: 5px solid var(--tierra-600); }

        .btn-filtros-movil { display: none; margin-bottom: 18px; position: relative; }
        .punto-filtro {
          width: 8px; height: 8px; border-radius: 50%;
          background: var(--tierra-600);
        }

        /* ---------- RESULTADOS ---------- */
        .resultados-cabecera {
          display: flex; align-items: flex-end; justify-content: space-between;
          flex-wrap: wrap; gap: 16px;
          margin-bottom: 28px;
          padding-bottom: 20px;
          border-bottom: 1px solid var(--borde);
        }
        .resultados-cabecera .antetitulo { display: block; margin-bottom: 8px; }
        .resultados-titulo { font-size: clamp(1.5rem, 3.4vw, 2.1rem); }

        .conmutador {
          display: flex; gap: 4px;
          padding: 4px;
          background: var(--arena-100);
          border-radius: var(--r-full);
        }
        .conmutador button {
          padding: 9px 20px;
          border: none; background: transparent;
          border-radius: var(--r-full);
          font-size: 0.88rem; font-weight: 600;
          color: var(--tinta-500);
          transition: background-color .18s, color .18s, box-shadow .18s;
        }
        .conmutador button.activo {
          background: var(--superficie);
          color: var(--tierra-600);
          box-shadow: var(--sombra-sm);
        }

        @media (max-width: 900px) {
          .layout-busqueda { grid-template-columns: 1fr; }
          .btn-filtros-movil { display: inline-flex; }
          .filtros { display: none; position: static; }
          .filtros.abierto { display: grid; }
        }
      `}</style>
    </main>
  )
}
