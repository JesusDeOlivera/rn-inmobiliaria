'use client'
import { useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import { formatPrecio, imagenPrincipal } from '../../lib/format'
import { TIPOS_INMUEBLE } from '../../lib/barrios'
import Foto from '../../components/Foto'
import BotonFavorito from '../../components/BotonFavorito'

const inputStyle = { width: '100%', padding: '12px 15px', borderRadius: '12px', border: '1px solid #e2e8f0', fontSize: '0.9rem', outline: 'none', color: '#020617', fontWeight: '600', backgroundColor: '#f8fafc' }
const labelStyle = { display: 'block', fontSize: '0.75rem', fontWeight: '900', color: '#020617', textTransform: 'uppercase', marginBottom: '12px', marginTop: '25px', letterSpacing: '1px' }

function SegmentedButton({ label, activo, onClick }) {
  return (
    <button type="button" onClick={onClick} style={{ flex: 1, padding: '8px 0', backgroundColor: activo ? '#4F46E5' : 'transparent', color: activo ? 'white' : '#64748b', border: activo ? 'none' : '1px solid #e2e8f0', borderRadius: '8px', fontWeight: '800', fontSize: '0.8rem', cursor: 'pointer', transition: '0.2s' }}>
      {label}
    </button>
  )
}

function RadioOption({ label, groupValue, setter }) {
  return (
    <button type="button" onClick={setter} style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer', marginBottom: '10px', fontSize: '0.9rem', fontWeight: '600', background: 'none', border: 'none', padding: 0, width: '100%', textAlign: 'left' }}>
      <span style={{ width: '16px', height: '16px', borderRadius: '50%', border: groupValue === label ? '5px solid #4F46E5' : '2px solid #cbd5e1', transition: '0.1s', display: 'inline-block' }} />
      <span style={{ color: groupValue === label ? '#020617' : '#475569' }}>{label}</span>
    </button>
  )
}

// Recibe las propiedades ya cargadas desde el servidor; solo filtra y renderiza.
export default function CatalogoCliente({ propiedades }) {
  // FILTROS
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
      temp = temp.filter(p =>
        p.zona?.toLowerCase().includes(q) ||
        p.titulo?.toLowerCase().includes(q) ||
        p.direccion?.toLowerCase().includes(q)
      )
    }
    if (tipoPropiedad !== 'Todos') temp = temp.filter(p => p.tipo === tipoPropiedad)
    if (moneda !== 'Todos') temp = temp.filter(p => p.moneda === moneda)
    if (precioMin) temp = temp.filter(p => Number(p.precio) >= Number(precioMin))
    if (precioMax) temp = temp.filter(p => Number(p.precio) <= Number(precioMax))
    if (ambientes !== 'Todos') {
      if (ambientes === '4+') temp = temp.filter(p => p.habitaciones >= 4)
      else temp = temp.filter(p => p.habitaciones === Number(ambientes))
    }
    if (supMin) temp = temp.filter(p => p.metros_cuadrados >= Number(supMin))
    if (supMax) temp = temp.filter(p => p.metros_cuadrados <= Number(supMax))
    return temp
  }, [ubicacionDebounced, tipoPropiedad, precioMin, precioMax, moneda, ambientes, supMin, supMax, propiedades])

  const limpiarFiltros = () => {
    setUbicacion(''); setTipoPropiedad('Todos'); setPrecioMin(''); setPrecioMax('')
    setMoneda('Todos'); setAmbientes('Todos'); setSupMin(''); setSupMax(''); setFiltrosAbiertos(false)
  }

  const mapQuery = filtradas.length > 0 && filtradas[0].direccion
    ? encodeURIComponent(`${filtradas[0].direccion}, Misiones, Argentina`)
    : (ubicacionDebounced ? encodeURIComponent(`${ubicacionDebounced}, Misiones, Argentina`) : encodeURIComponent('Posadas, Misiones, Argentina'))
  const mapUrl = `https://maps.google.com/maps?q=${mapQuery}&t=&z=13&ie=UTF8&iwloc=&output=embed`

  return (
    <main style={{ minHeight: '100vh', backgroundColor: '#f8fafc', fontFamily: 'system-ui, sans-serif' }}>
      <div style={{ padding: '30px 5%', maxWidth: '1600px', margin: '0 auto' }}>

          <div style={{ display: 'flex', gap: '10px', color: '#94a3b8', fontSize: '0.85rem', fontWeight: '600', marginBottom: '30px' }}>
              <Link href="/" style={{ textDecoration: 'none', color: '#94a3b8' }}>🏠 Inicio</Link>
              <span>/</span>
              <span style={{ color: '#020617' }}>Búsqueda Avanzada</span>
          </div>

          <button
            className="btn-filtros-movil"
            type="button"
            onClick={() => setFiltrosAbiertos(!filtrosAbiertos)}
            style={{ width: '100%', padding: '16px', backgroundColor: '#020617', color: 'white', borderRadius: '16px', fontWeight: '900', marginBottom: '20px', border: 'none', cursor: 'pointer', fontSize: '1rem', display: 'none' }}
          >
            {filtrosAbiertos ? 'Ocultar Filtros ✖' : 'Mostrar Filtros ⚲'}
          </button>

          <div className="layout-principal" style={{ display: 'flex', gap: '40px', alignItems: 'flex-start', flexWrap: 'wrap' }}>

              <aside
                className={`sidebar-filtros ${filtrosAbiertos ? 'abierto' : ''}`}
                style={{ flex: '1 1 300px', maxWidth: '320px', backgroundColor: 'white', borderRadius: '24px', padding: '25px', border: '1px solid #e2e8f0', position: 'sticky', top: '100px' }}
              >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '10px' }}>
                      <span style={{ fontSize: '1.2rem' }}>⚲</span>
                      <h2 style={{ fontSize: '1.2rem', fontWeight: '900', color: '#020617', margin: 0 }}>Filtros</h2>
                  </div>

                  <label htmlFor="c-ubicacion" style={labelStyle}>Buscar por texto o dirección</label>
                  <input id="c-ubicacion" value={ubicacion} onChange={(e) => setUbicacion(e.target.value)} type="text" placeholder="Ej: Calle Rademacher..." style={inputStyle} />

                  <span style={labelStyle}>Tipo de Propiedad</span>
                  <div style={{ display: 'flex', flexDirection: 'column' }}>
                      <RadioOption label="Todos" groupValue={tipoPropiedad} setter={() => setTipoPropiedad('Todos')} />
                      {TIPOS_INMUEBLE.map(t => (
                        <RadioOption key={t} label={t} groupValue={tipoPropiedad} setter={() => setTipoPropiedad(t)} />
                      ))}
                  </div>

                  <span style={labelStyle}>Precio</span>
                  <div style={{ display: 'flex', gap: '10px' }}>
                      <input aria-label="Precio mínimo" value={precioMin} onChange={(e) => setPrecioMin(e.target.value)} type="number" placeholder="$ Min" style={inputStyle} />
                      <input aria-label="Precio máximo" value={precioMax} onChange={(e) => setPrecioMax(e.target.value)} type="number" placeholder="$ Max" style={inputStyle} />
                  </div>
                  <div style={{ display: 'flex', gap: '5px', marginTop: '10px' }}>
                      <SegmentedButton label="Todos" activo={moneda === 'Todos'} onClick={() => setMoneda('Todos')} />
                      <SegmentedButton label="USD" activo={moneda === 'USD'} onClick={() => setMoneda('USD')} />
                      <SegmentedButton label="ARS" activo={moneda === 'ARS'} onClick={() => setMoneda('ARS')} />
                  </div>

                  <span style={labelStyle}>Ambientes / Dormitorios</span>
                  <div style={{ display: 'flex', gap: '5px' }}>
                      <SegmentedButton label="Todos" activo={ambientes === 'Todos'} onClick={() => setAmbientes('Todos')} />
                      <SegmentedButton label="1" activo={ambientes === '1'} onClick={() => setAmbientes('1')} />
                      <SegmentedButton label="2" activo={ambientes === '2'} onClick={() => setAmbientes('2')} />
                      <SegmentedButton label="3" activo={ambientes === '3'} onClick={() => setAmbientes('3')} />
                      <SegmentedButton label="4+" activo={ambientes === '4+'} onClick={() => setAmbientes('4+')} />
                  </div>

                  <span style={labelStyle}>Superficie (M²)</span>
                  <div style={{ display: 'flex', gap: '10px', marginBottom: '25px' }}>
                      <input aria-label="Superficie mínima" value={supMin} onChange={(e) => setSupMin(e.target.value)} type="number" placeholder="Min" style={inputStyle} />
                      <input aria-label="Superficie máxima" value={supMax} onChange={(e) => setSupMax(e.target.value)} type="number" placeholder="Max" style={inputStyle} />
                  </div>

                  <button type="button" onClick={limpiarFiltros} style={{ width: '100%', padding: '12px', borderRadius: '12px', backgroundColor: '#f1f5f9', color: '#64748b', fontWeight: '800', border: 'none', cursor: 'pointer' }}>
                      Limpiar Filtros
                  </button>
              </aside>

              <div style={{ flex: '1 1 600px', display: 'flex', flexDirection: 'column', width: '100%' }}>

                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '30px', flexWrap: 'wrap', gap: '15px' }}>
                    <h1 style={{ fontSize: '1.8rem', fontWeight: '900', color: '#020617', margin: 0, letterSpacing: '-1px' }}>
                        {filtradas.length} inmuebles encontrados
                    </h1>

                    <div style={{ display: 'flex', backgroundColor: '#e2e8f0', padding: '4px', borderRadius: '12px' }}>
                        <button type="button" onClick={() => setVistaActiva('grilla')} style={{ padding: '8px 16px', borderRadius: '10px', border: 'none', fontWeight: '800', fontSize: '0.85rem', cursor: 'pointer', backgroundColor: vistaActiva === 'grilla' ? 'white' : 'transparent', color: vistaActiva === 'grilla' ? '#4F46E5' : '#64748b', transition: '0.2s' }}>⏹️ Grilla</button>
                        <button type="button" onClick={() => setVistaActiva('mapa')} style={{ padding: '8px 16px', borderRadius: '10px', border: 'none', fontWeight: '800', fontSize: '0.85rem', cursor: 'pointer', backgroundColor: vistaActiva === 'mapa' ? 'white' : 'transparent', color: vistaActiva === 'mapa' ? '#4F46E5' : '#64748b', transition: '0.2s' }}>🗺️ Mapa</button>
                    </div>
                  </div>

                  {filtradas.length === 0 ? (
                      <div style={{ textAlign: 'center', padding: '80px', backgroundColor: 'white', borderRadius: '24px', border: '1px solid #e2e8f0' }}>
                          <p style={{ color: '#64748b', fontWeight: '800', fontSize: '1.2rem' }}>
                            {propiedades.length === 0
                              ? 'Todavía no hay propiedades publicadas.'
                              : 'No hay propiedades que coincidan con estos filtros.'}
                          </p>
                          {propiedades.length > 0 && (
                            <button type="button" onClick={limpiarFiltros} style={{ marginTop: '15px', border: 'none', background: 'none', color: '#4F46E5', fontWeight: '800', cursor: 'pointer', textDecoration: 'underline' }}>Limpiar filtros</button>
                          )}
                      </div>
                  ) : vistaActiva === 'mapa' ? (
                      <div style={{ width: '100%', height: '75vh', borderRadius: '32px', overflow: 'hidden', border: '1px solid #e2e8f0', boxShadow: '0 10px 30px rgba(0,0,0,0.05)', position: 'relative' }}>
                          <iframe title="Mapa de propiedades" loading="lazy" width="100%" height="100%" style={{ border: 0 }} src={mapUrl} allowFullScreen></iframe>
                      </div>
                  ) : (
                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '25px' }}>
                      {filtradas.map(p => (
                          <div key={p.id} style={{ position: 'relative' }}>
                            <BotonFavorito id={p.id} />

                            <Link href={`/propiedad/${p.id}`} style={{ textDecoration: 'none', color: 'inherit' }}>
                            <div style={{ backgroundColor: 'white', borderRadius: '24px', overflow: 'hidden', boxShadow: '0 10px 25px rgba(0,0,0,0.04)', border: '1px solid #e2e8f0', transition: '0.3s' }}>
                                <div style={{ height: '220px', position: 'relative' }}>
                                    <div style={{ position: 'absolute', top: '15px', left: '15px', backgroundColor: '#4F46E5', color: 'white', padding: '5px 12px', borderRadius: '8px', fontSize: '0.7rem', fontWeight: '900', zIndex: 10 }}>VENTA</div>
                                    {p.estado_interno !== 'Disponible' && (
                                        <div style={{ position: 'absolute', top: '45px', left: '15px', backgroundColor: p.estado_interno === 'Reservada' ? '#f59e0b' : '#ef4444', color: 'white', padding: '5px 12px', borderRadius: '8px', fontSize: '0.7rem', fontWeight: '900', zIndex: 10 }}>{p.estado_interno?.toUpperCase()}</div>
                                    )}
                                    <div style={{ position: 'absolute', bottom: '15px', left: '15px', backgroundColor: 'white', padding: '8px 16px', borderRadius: '12px', fontWeight: '900', fontSize: '1.1rem', color: '#020617' }}>
                                        {formatPrecio(p)}
                                    </div>
                                    <Foto src={imagenPrincipal(p)} alt={p.titulo} sizes="(max-width: 800px) 100vw, 300px" />
                                </div>
                                <div style={{ padding: '20px' }}>
                                    <p style={{ color: '#F59E0B', fontSize: '0.8rem', margin: '0 0 8px', fontWeight: '800', textTransform: 'uppercase' }}>📍 {p.zona}</p>
                                    <h3 style={{ fontSize: '1.2rem', fontWeight: '900', color: '#020617', margin: '0 0 15px', lineHeight: 1.3, minHeight: '3.1rem', overflow: 'hidden' }}>{p.titulo}</h3>
                                    <div style={{ display: 'flex', gap: '15px', borderTop: '1px solid #f1f5f9', paddingTop: '15px', color: '#64748b', fontWeight: '700', fontSize: '0.85rem' }}>
                                        {p.habitaciones > 0 && <span>🛏️ {p.habitaciones} Dorm.</span>}
                                        {p.banos > 0 && <span>🚿 {p.banos} Baños</span>}
                                    </div>
                                </div>
                            </div>
                            </Link>
                          </div>
                      ))}
                      </div>
                  )}
              </div>
          </div>
      </div>

      <style>{`
        @media (max-width: 800px) {
          .btn-filtros-movil { display: block !important; }
          .sidebar-filtros {
            display: none !important;
            max-width: 100% !important;
            position: static !important;
            margin-bottom: 20px;
          }
          .sidebar-filtros.abierto { display: block !important; }
          .layout-principal { flex-direction: column !important; }
        }
      `}</style>
    </main>
  )
}
