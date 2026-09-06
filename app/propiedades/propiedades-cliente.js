'use client'
import { useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import { formatPrecio, imagenPrincipal } from '../../lib/format'
import { GRUPOS_BARRIOS, TIPOS_INMUEBLE } from '../../lib/barrios'
import Foto from '../../components/Foto'
import BotonFavorito from '../../components/BotonFavorito'

// Recibe las propiedades YA cargadas desde el servidor. Solo se ocupa de
// filtrar y renderizar, así el HTML inicial ya viene con todas las fichas
// (antes se pedían en un useEffect y el crawler veía la página vacía).
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
      temp = temp.filter(p => p.titulo?.toLowerCase().includes(q))
    }
    if (zona !== 'Todas') temp = temp.filter(p => p.zona === zona)
    if (tipo !== 'Todos') temp = temp.filter(p => p.tipo === tipo)
    return temp
  }, [busquedaDebounced, tipo, zona, propiedades])

  const irAResultados = () => {
    document.getElementById('resultados')?.scrollIntoView({ behavior: 'smooth' })
  }

  const limpiar = () => { setBusqueda(''); setZona('Todas'); setTipo('Todos') }

  const inputStyles = {
    padding: '15px', borderRadius: '14px', border: '1px solid #e2e8f0',
    fontSize: '1rem', fontWeight: '700', color: '#020617', outline: 'none',
    backgroundColor: '#f8fafc', cursor: 'pointer', width: '100%',
  }

  return (
    <>
      <section style={{ maxWidth: '1150px', margin: '-60px auto 0 auto', position: 'relative', zIndex: 10, padding: '0 20px' }}>
        <div style={{ backgroundColor: 'white', borderRadius: '28px', padding: '25px', boxShadow: '0 25px 50px rgba(0,0,0,0.1)', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '15px', alignItems: 'end' }}>

          <div>
            <label htmlFor="f-tipo" style={{ display: 'block', fontSize: '0.7rem', fontWeight: '900', color: '#64748b', marginBottom: '8px', textTransform: 'uppercase' }}>Tipo de inmueble</label>
            <select id="f-tipo" value={tipo} onChange={(e) => setTipo(e.target.value)} style={inputStyles}>
              <option value="Todos">Cualquier tipo</option>
              {TIPOS_INMUEBLE.map(t => <option key={t}>{t}</option>)}
            </select>
          </div>

          <div>
            <label htmlFor="f-zona" style={{ display: 'block', fontSize: '0.7rem', fontWeight: '900', color: '#64748b', marginBottom: '8px', textTransform: 'uppercase' }}>Zona / Barrio</label>
            <select id="f-zona" value={zona} onChange={(e) => setZona(e.target.value)} style={inputStyles}>
              <option value="Todas">Todas las zonas</option>
              {GRUPOS_BARRIOS.map(g => (
                <optgroup key={g.label} label={g.label}>
                  {g.barrios.map(b => <option key={b} value={b}>{b}</option>)}
                </optgroup>
              ))}
            </select>
          </div>

          <div>
            <label htmlFor="f-busqueda" style={{ display: 'block', fontSize: '0.7rem', fontWeight: '900', color: '#64748b', marginBottom: '8px', textTransform: 'uppercase' }}>Búsqueda por nombre</label>
            <input id="f-busqueda" value={busqueda} onChange={(e) => setBusqueda(e.target.value)} type="text" placeholder="Ej: Moderna..." style={inputStyles} />
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <button type="button" onClick={irAResultados} style={{ backgroundColor: '#020617', color: 'white', border: 'none', padding: '15px', borderRadius: '14px', fontWeight: '900', fontSize: '1rem', cursor: 'pointer', width: '100%' }}>
              VER RESULTADOS
            </button>
            <Link href="/catalogo" style={{ textDecoration: 'none', color: '#4F46E5', fontWeight: '800', fontSize: '0.85rem', textAlign: 'center' }}>
              + Búsqueda Avanzada
            </Link>
          </div>
        </div>
      </section>

      <section id="resultados" style={{ padding: '80px 5%', maxWidth: '1400px', margin: '0 auto', scrollMarginTop: '90px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '50px', borderBottom: '2px solid #f1f5f9', paddingBottom: '20px' }}>
          <div>
            <h2 style={{ fontSize: '2.2rem', fontWeight: '900', color: '#020617', margin: 0 }}>Propiedades en Venta</h2>
            <span style={{ color: '#64748b', fontWeight: '800', fontSize: '1rem' }}>{filtradas.length} inmuebles encontrados</span>
          </div>
        </div>

        {filtradas.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '100px', backgroundColor: 'white', borderRadius: '32px' }}>
            <p style={{ color: '#64748b', fontWeight: '800', fontSize: '1.2rem' }}>
              {propiedades.length === 0
                ? 'Todavía no hay propiedades publicadas.'
                : 'No hay propiedades que coincidan con la búsqueda.'}
            </p>
            {propiedades.length > 0 && (
              <button type="button" onClick={limpiar} style={{ marginTop: '15px', textDecoration: 'underline', border: 'none', background: 'none', color: '#4F46E5', fontWeight: '800', cursor: 'pointer' }}>Limpiar filtros</button>
            )}
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))', gap: '40px' }}>
            {filtradas.map(p => (
              <div key={p.id} style={{ position: 'relative' }}>
                <BotonFavorito id={p.id} />
                <Link href={`/propiedad/${p.id}`} style={{ textDecoration: 'none', color: 'inherit' }}>
                  <div style={{ backgroundColor: 'white', borderRadius: '32px', overflow: 'hidden', boxShadow: '0 10px 30px rgba(0,0,0,0.04)', border: '1px solid #f1f5f9', transition: '0.3s' }}>
                    <div style={{ height: '300px', position: 'relative' }}>
                      <div style={{ position: 'absolute', top: '20px', left: '20px', backgroundColor: '#22c55e', color: 'white', padding: '6px 14px', borderRadius: '10px', fontSize: '0.7rem', fontWeight: '900', zIndex: 10 }}>VENTA</div>
                      {p.estado_interno !== 'Disponible' && (
                        <div style={{ position: 'absolute', top: '50px', left: '20px', backgroundColor: '#ef4444', color: 'white', padding: '6px 14px', borderRadius: '10px', fontSize: '0.7rem', fontWeight: '900', zIndex: 10 }}>{p.estado_interno?.toUpperCase()}</div>
                      )}
                      <div style={{ position: 'absolute', bottom: '20px', left: '20px', backgroundColor: 'white', padding: '10px 20px', borderRadius: '16px', fontWeight: '900', fontSize: '1.4rem', color: '#020617', boxShadow: '0 4px 15px rgba(0,0,0,0.1)', zIndex: 10 }}>
                        {formatPrecio(p)}
                      </div>
                      <Foto src={imagenPrincipal(p)} alt={p.titulo} sizes="(max-width: 768px) 100vw, 350px" />
                    </div>
                    <div style={{ padding: '30px' }}>
                      <p style={{ color: '#F59E0B', fontSize: '0.85rem', margin: '0 0 10px', fontWeight: '800', textTransform: 'uppercase' }}>📍 {p.zona}</p>
                      <h3 style={{ fontSize: '1.5rem', fontWeight: '900', color: '#020617', margin: '0 0 20px', lineHeight: 1.2 }}>{p.titulo}</h3>
                      <div style={{ display: 'flex', gap: '20px', borderTop: '1px solid #f1f5f9', paddingTop: '20px', color: '#475569', fontWeight: '800' }}>
                        <span>🛏️ {p.habitaciones} Dorm.</span>
                        <span>🚿 {p.banos} Baños</span>
                      </div>
                    </div>
                  </div>
                </Link>
              </div>
            ))}
          </div>
        )}
      </section>
    </>
  )
}
