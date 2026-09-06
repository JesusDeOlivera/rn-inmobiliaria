'use client'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { supabase } from '../../lib/supabase'
import { GRUPOS_BARRIOS, TIPOS_INMUEBLE, ESTADOS_PROPIEDAD } from '../../lib/barrios'
import { CONTACTOS } from '../../lib/config'
import { formatPrecio, imagenPrincipal } from '../../lib/format'
import { listarPropiedades } from '../../lib/propiedades'

// Valores por defecto del formulario de alta.
const FORM_VACIO = {
  titulo: '', descripcion: '', precio: '', moneda: 'USD',
  tipo: 'Casa Usada', zona: 'Centro', imagenes: [],
  habitaciones: '', banos: '', metros_cuadrados: '', direccion: '',
  latitud: null, longitud: null,
  estado_interno: 'Disponible',
  publicado: true,
  destacado: false,
  vendedor_asignado: 'papa',
  nombre_vendedor: CONTACTOS.papa.nombre,
  telefono_vendedor: CONTACTOS.papa.tel,
  email_vendedor: CONTACTOS.papa.email,
}

export default function AdminPanel() {
  const router = useRouter()
  const [tab, setTab] = useState('gestionar')
  const [autorizado, setAutorizado] = useState(false)
  const [propiedades, setPropiedades] = useState([])
  const [cargando, setCargando] = useState(false)
  const [mensaje, setMensaje] = useState('')
  const [editandoId, setEditandoId] = useState(null)
  const [ubicando, setUbicando] = useState(false)
  const [ubicacionHallada, setUbicacionHallada] = useState(null)

  const [formData, setFormData] = useState(FORM_VACIO)

  useEffect(() => {
    const checkUser = async () => {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) router.push('/login')
      else { setAutorizado(true); fetchPropiedades(); }
    }
    checkUser()
  }, [router])

  // El panel ve TODO, incluidas las no publicadas (a diferencia del sitio público).
  const fetchPropiedades = async () => {
    const { data, error } = await listarPropiedades(supabase, { incluirNoPublicadas: true })
    if (error) {
      setMensaje('Error al cargar propiedades: ' + error)
      return
    }
    setPropiedades(data)
  }

  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.push('/')
  }

  const handleFileChange = (e) => {
    if (e.target.files) {
      setFormData({ ...formData, imagenes: Array.from(e.target.files) })
    }
  }

  const handleVendedorChange = (val) => {
    setFormData({
      ...formData,
      vendedor_asignado: val,
      nombre_vendedor: CONTACTOS[val].nombre,
      telefono_vendedor: CONTACTOS[val].tel,
      email_vendedor: CONTACTOS[val].email
    })
  }

  const prepararEdicion = (p) => {
    setFormData({
      ...FORM_VACIO,
      ...p,
      // La base permite null en estos campos; el formulario necesita booleanos.
      publicado: p.publicado ?? true,
      destacado: p.destacado ?? false,
      estado_interno: p.estado_interno || p.estado || 'Disponible',
    })
    setEditandoId(p.id)
    setUbicacionHallada(null)
    setTab('cargar')
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  // Pide las coordenadas de la direccion al endpoint propio, que a su vez
  // consulta Nominatim del lado del servidor.
  const ubicarEnMapa = async () => {
    if (!formData.direccion?.trim()) {
      setMensaje('Cargá una dirección antes de ubicarla en el mapa.')
      setTimeout(() => setMensaje(''), 3000)
      return
    }
    setUbicando(true)
    setUbicacionHallada(null)
    try {
      const { data: { session } } = await supabase.auth.getSession()
      const res = await fetch('/api/geocodificar', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${session?.access_token || ''}`,
        },
        body: JSON.stringify({ direccion: formData.direccion, zona: formData.zona }),
      })
      const datos = await res.json()
      if (datos.encontrada) {
        setFormData((f) => ({ ...f, latitud: datos.lat, longitud: datos.lng }))
        setUbicacionHallada(datos)
      } else {
        setUbicacionHallada({ encontrada: false })
      }
    } catch {
      setUbicacionHallada({ encontrada: false })
    }
    setUbicando(false)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setCargando(true)
    setMensaje('Procesando...')
    try {
      let finalImages = formData.imagenes
      if (formData.imagenes.length > 0 && formData.imagenes[0] instanceof File) {
        const imageUrls = []
        for (const file of formData.imagenes) {
          const fileName = `${Date.now()}-${Math.round(Math.random() * 1e9)}.${file.name.split('.').pop()}`
          const { error: upErr } = await supabase.storage
            .from('imagenes_propiedades')
            .upload(fileName, file)
          if (upErr) throw new Error('Subiendo imágenes: ' + upErr.message)
          const { data: { publicUrl } } = supabase.storage
            .from('imagenes_propiedades')
            .getPublicUrl(fileName)
          imageUrls.push(publicUrl)
        }
        finalImages = imageUrls
      }

      // Si hay direccion pero todavia no hay coordenadas, las buscamos ahora.
      let coords = { latitud: formData.latitud, longitud: formData.longitud }
      if (formData.direccion?.trim() && (coords.latitud == null || coords.longitud == null)) {
        try {
          const { data: { session } } = await supabase.auth.getSession()
          const res = await fetch('/api/geocodificar', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${session?.access_token || ''}`,
            },
            body: JSON.stringify({ direccion: formData.direccion, zona: formData.zona }),
          })
          const datos = await res.json()
          if (datos.encontrada) coords = { latitud: datos.lat, longitud: datos.lng }
        } catch { /* sin coordenadas: la propiedad se guarda igual */ }
      }

      // No mandamos id ni created_at en el update.
      const objetoPropiedad = {
        ...formData,
        precio: parseFloat(formData.precio) || 0,
        habitaciones: parseInt(formData.habitaciones, 10) || 0,
        banos: parseInt(formData.banos, 10) || 0,
        metros_cuadrados: parseFloat(formData.metros_cuadrados) || 0,
        imagenes: finalImages,
        publicado: Boolean(formData.publicado),
        destacado: Boolean(formData.destacado),
        latitud: coords.latitud,
        longitud: coords.longitud,
        // `estado` es una columna legacy que duplica `estado_interno`.
        // La mantenemos sincronizada para que no se desfasen.
        estado: formData.estado_interno,
      }
      delete objetoPropiedad.id
      delete objetoPropiedad.created_at

      if (editandoId) {
        const { error } = await supabase.from('propiedades').update(objetoPropiedad).eq('id', editandoId)
        if (error) throw new Error(error.message)
        setMensaje('✓ ACTUALIZADA')
      } else {
        const { error } = await supabase.from('propiedades').insert([objetoPropiedad])
        if (error) throw new Error(error.message)
        setMensaje('✓ PUBLICADA')
      }

      setEditandoId(null)
      setFormData(FORM_VACIO)
      fetchPropiedades()
      setTab('gestionar')
    } catch (err) { setMensaje('Error: ' + err.message) }
    setCargando(false)
    setTimeout(() => setMensaje(''), 4000)
  }

  const cambiarEstadoRapido = async (id, nuevoEstado) => {
    // Mantenemos sincronizada la columna legacy `estado`.
    const { error } = await supabase
      .from('propiedades')
      .update({ estado_interno: nuevoEstado, estado: nuevoEstado })
      .eq('id', id)
    if (error) setMensaje('Error: ' + error.message)
    fetchPropiedades()
  }

  const togglePublicado = async (p) => {
    const { error } = await supabase
      .from('propiedades')
      .update({ publicado: !(p.publicado ?? true) })
      .eq('id', p.id)
    if (error) setMensaje('Error: ' + error.message)
    fetchPropiedades()
  }

  const eliminarPropiedad = async (id) => {
    if (!confirm('¿Seguro querés borrar esta propiedad definitivamente?')) return
    const { error } = await supabase.from('propiedades').delete().eq('id', id)
    if (error) setMensaje('Error al borrar: ' + error.message)
    fetchPropiedades()
  }

  if (!autorizado) return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: '#F8FAFC' }}>
        <p style={{ fontWeight: '900', color: '#020617' }}>VERIFICANDO ACCESO...</p>
    </div>
  )

  const inputStyle = { padding: '18px', borderRadius: '18px', border: '1px solid #e2e8f0', color: '#020617', fontWeight: '700', width: '100%', outline: 'none', backgroundColor: '#F8FAFC', fontSize: '0.95rem' }
  const labelStyle = { color: '#64748b', fontWeight: '900', fontSize: '0.7rem', marginBottom: '8px', display: 'block', textTransform: 'uppercase', letterSpacing: '1px' }

  return (
    <main style={{ minHeight: '100vh', backgroundColor: '#F8FAFC', fontFamily: 'system-ui, sans-serif' }}>
      
      {/* NAVBAR ADMIN PREMIUM (Corregido para celular) */}
      <nav style={{ minHeight: '80px', display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'center', padding: '15px 5%', backgroundColor: '#ffffff', position: 'sticky', top: 0, zIndex: 100, borderBottom: '1px solid #f1f5f9', gap: '15px' }}>
        <Link href="/" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div style={{ backgroundColor: '#020617', color: '#ffffff', padding: '10px 14px', borderRadius: '12px', fontWeight: '900' }}>RN</div>
          <span style={{ fontWeight: '900', fontSize: '1.2rem', color: '#020617', letterSpacing: '-1px' }} className="hide-on-tiny">ADMIN</span>
        </Link>

        <div style={{ display: 'flex', gap: '15px', alignItems: 'center' }}>
            <Link href="/" style={{ textDecoration: 'none', color: '#64748b', fontWeight: '700', fontSize: '0.9rem', backgroundColor: '#f1f5f9', padding: '8px 12px', borderRadius: '10px' }}>Ver Web</Link>
            <button onClick={handleLogout} style={{ background: '#FFF1F2', border: 'none', color: '#e11d48', padding: '8px 12px', borderRadius: '10px', fontWeight: '700', cursor: 'pointer', fontSize: '0.9rem' }}>Salir</button>
        </div>
      </nav>

      <div style={{ maxWidth: '1100px', margin: '30px auto', padding: '0 5%' }}>
        
        {/* TABS SELECTOR */}
        <div style={{ display: 'flex', flexWrap: 'wrap', backgroundColor: '#e2e8f0', padding: '6px', borderRadius: '20px', marginBottom: '30px', gap: '5px' }}>
            <button type="button" onClick={() => { setTab('gestionar'); setEditandoId(null); setFormData(FORM_VACIO); }} style={{ flex: '1 1 150px', padding: '15px', borderRadius: '16px', border: 'none', fontWeight: '800', cursor: 'pointer', backgroundColor: tab === 'gestionar' ? '#ffffff' : 'transparent', color: '#020617', transition: '0.3s' }}>
                GESTIONAR LISTADO
            </button>
            <button onClick={() => setTab('cargar')} style={{ flex: '1 1 150px', padding: '15px', borderRadius: '16px', border: 'none', fontWeight: '800', cursor: 'pointer', backgroundColor: tab === 'cargar' ? '#ffffff' : 'transparent', color: '#020617', transition: '0.3s' }}>
                {editandoId ? 'EDITAR PROPIEDAD' : 'CARGAR NUEVA'}
            </button>
        </div>

        {mensaje && (
            <div style={{ backgroundColor: '#020617', color: 'white', padding: '20px', borderRadius: '20px', marginBottom: '30px', fontWeight: '700', textAlign: 'center', animation: 'fadeIn 0.5s' }}>
                {mensaje}
            </div>
        )}

        {tab === 'cargar' ? (
          <form onSubmit={handleSubmit} className="form-container" style={{ backgroundColor: 'white', borderRadius: '35px', boxShadow: '0 20px 40px rgba(0,0,0,0.03)', border: '1px solid #f1f5f9', display: 'flex', flexDirection: 'column', gap: '25px' }}>
            
            {/* Las grillas fijas pasaron a "repeat(auto-fit, minmax(280px, 1fr))". Magia pura. */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '20px' }}>
              <div>
                <label style={labelStyle}>Título de la propiedad</label>
                <input required value={formData.titulo} style={inputStyle} onChange={e => setFormData({...formData, titulo: e.target.value})} placeholder="Ej: Casa Moderna..." />
              </div>
              <div>
                <label style={labelStyle}>Estado Inicial</label>
                <select value={formData.estado_interno} style={inputStyle} onChange={e => setFormData({...formData, estado_interno: e.target.value})}>
                  {ESTADOS_PROPIEDAD.map(s => <option key={s}>{s}</option>)}
                </select>
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '20px' }}>
              <div>
                <label style={labelStyle}>Zona / Barrio</label>
                <select value={formData.zona} style={inputStyle} onChange={e => setFormData({...formData, zona: e.target.value})}>
                   {GRUPOS_BARRIOS.map(g => (
                     <optgroup key={g.label} label={g.label}>
                       {g.barrios.map(b => <option key={b} value={b}>{b}</option>)}
                     </optgroup>
                   ))}
                </select>
              </div>
              <div>
                <label style={labelStyle}>Tipo de Inmueble</label>
                <select value={formData.tipo} style={inputStyle} onChange={e => setFormData({...formData, tipo: e.target.value})}>
                  {TIPOS_INMUEBLE.map(t => <option key={t}>{t}</option>)}
                </select>
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '20px' }}>
              <div>
                <label style={labelStyle}>Vendedor Responsable</label>
                <select value={formData.vendedor_asignado} style={inputStyle} onChange={e => handleVendedorChange(e.target.value)}>
                  <option value="papa">(RN Inmobiliaria)</option><option value="socio">Socio</option>
                </select>
              </div>
              <div>
                <label style={labelStyle}>Dirección para el Mapa</label>
                <div style={{ display: 'flex', gap: '8px' }}>
                  <input
                    value={formData.direccion}
                    placeholder="Ej: Av. Uruguay 4500"
                    style={{ ...inputStyle, flex: 1 }}
                    onChange={e => setFormData({ ...formData, direccion: e.target.value, latitud: null, longitud: null })}
                  />
                  <button
                    type="button"
                    onClick={ubicarEnMapa}
                    disabled={ubicando}
                    style={{ ...inputStyle, width: 'auto', whiteSpace: 'nowrap', cursor: 'pointer', backgroundColor: '#fff', fontWeight: 700, opacity: ubicando ? 0.6 : 1 }}
                  >
                    {ubicando ? 'Buscando…' : '📍 Ubicar'}
                  </button>
                </div>

                {formData.latitud != null && (
                  <p style={{ fontSize: '0.78rem', color: '#166534', marginTop: '8px', lineHeight: 1.5 }}>
                    ✓ Ubicada en el mapa
                    {ubicacionHallada?.etiqueta ? `: ${ubicacionHallada.etiqueta.slice(0, 80)}` : ''}
                    {ubicacionHallada?.precision === 'barrio' && ' (a nivel de barrio: no se encontró la calle exacta)'}
                  </p>
                )}
                {ubicacionHallada && ubicacionHallada.encontrada === false && (
                  <p style={{ fontSize: '0.78rem', color: '#92400e', marginTop: '8px', lineHeight: 1.5 }}>
                    No pudimos ubicar esa dirección. La propiedad se guarda igual, pero no va a
                    aparecer en el mapa. Probá con una calle o barrio más conocido.
                  </p>
                )}
                <p style={{ fontSize: '0.72rem', color: '#64748b', marginTop: '6px' }}>
                  Si no la ubicás a mano, la buscamos automáticamente al guardar.
                </p>
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '20px' }}>
              <div style={{ flex: '2 1 200px' }}>
                <label style={labelStyle}>Precio</label>
                <input required type="number" value={formData.precio} style={inputStyle} onChange={e => setFormData({...formData, precio: e.target.value})} />
              </div>
              <div style={{ flex: '1 1 100px' }}>
                <label style={labelStyle}>Moneda</label>
                <select value={formData.moneda} style={inputStyle} onChange={e => setFormData({...formData, moneda: e.target.value})}>
                    <option>USD</option><option>ARS</option>
                </select>
              </div>
            </div>

            <div>
              <label style={labelStyle}>Descripción detallada</label>
              <textarea required value={formData.descripcion} style={{...inputStyle, height: '150px', resize: 'none'}} onChange={e => setFormData({...formData, descripcion: e.target.value})} />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(100px, 1fr))', gap: '15px' }}>
              <input type="number" placeholder="Dormitorios" value={formData.habitaciones} style={inputStyle} onChange={e => setFormData({...formData, habitaciones: e.target.value})} />
              <input type="number" placeholder="Baños" value={formData.banos} style={inputStyle} onChange={e => setFormData({...formData, banos: e.target.value})} />
              <input type="number" placeholder="M² Totales" value={formData.metros_cuadrados} style={inputStyle} onChange={e => setFormData({...formData, metros_cuadrados: e.target.value})} />
            </div>

            <div>
              <label style={labelStyle}>Fotografías</label>
              <input type="file" multiple accept="image/*" style={{...inputStyle, padding: '15px', backgroundColor: 'white'}} onChange={handleFileChange} />
              <p style={{ fontSize: '0.75rem', color: '#64748b', marginTop: '10px' }}>Tip: Podés seleccionar varias fotos a la vez.</p>
            </div>

            {/* Visibilidad en el sitio público */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '15px' }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '18px', borderRadius: '18px', border: '1px solid #e2e8f0', backgroundColor: '#F8FAFC', cursor: 'pointer' }}>
                <input
                  type="checkbox"
                  checked={Boolean(formData.publicado)}
                  onChange={e => setFormData({ ...formData, publicado: e.target.checked })}
                  style={{ width: '20px', height: '20px', margin: 0, padding: 0, minWidth: 'auto', accentColor: '#4F46E5' }}
                />
                <span>
                  <span style={{ display: 'block', fontWeight: 900, color: '#020617', fontSize: '0.9rem' }}>Publicada</span>
                  <span style={{ fontSize: '0.75rem', color: '#64748b' }}>Visible en el catálogo público</span>
                </span>
              </label>

              <label style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '18px', borderRadius: '18px', border: '1px solid #e2e8f0', backgroundColor: '#F8FAFC', cursor: 'pointer' }}>
                <input
                  type="checkbox"
                  checked={Boolean(formData.destacado)}
                  onChange={e => setFormData({ ...formData, destacado: e.target.checked })}
                  style={{ width: '20px', height: '20px', margin: 0, padding: 0, minWidth: 'auto', accentColor: '#F59E0B' }}
                />
                <span>
                  <span style={{ display: 'block', fontWeight: 900, color: '#020617', fontSize: '0.9rem' }}>Destacada</span>
                  <span style={{ fontSize: '0.75rem', color: '#64748b' }}>Aparece en la portada del sitio</span>
                </span>
              </label>
            </div>

            <button disabled={cargando} style={{ backgroundColor: '#020617', color: 'white', padding: '25px', borderRadius: '20px', fontWeight: '900', border: 'none', cursor: 'pointer', fontSize: '1.1rem', marginTop: '10px', boxShadow: '0 10px 25px rgba(0,0,0,0.1)' }}>
              {cargando ? 'PROCESANDO...' : editandoId ? 'GUARDAR CAMBIOS' : 'PUBLICAR EN LA WEB'}
            </button>
          </form>
        ) : (
          
          /* LISTADO GESTIONAR (Ajustado para que baje la botonera en móvil) */
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            {propiedades.length === 0 && <p style={{ textAlign: 'center', padding: '50px', color: '#94a3b8', fontWeight: '700' }}>No hay propiedades cargadas aún.</p>}
            
            {propiedades.map(p => (
              <div key={p.id} style={{ backgroundColor: 'white', padding: '25px', borderRadius: '24px', display: 'flex', flexWrap: 'wrap', gap: '20px', justifyContent: 'space-between', alignItems: 'center', border: '1px solid #f1f5f9', boxShadow: '0 4px 10px rgba(0,0,0,0.03)' }}>
                
                {/* Info de la Casa */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '20px', flex: '1 1 300px' }}>
                  <Image src={imagenPrincipal(p)} alt={p.titulo} width={90} height={90} unoptimized={imagenPrincipal(p).startsWith('data:')} style={{ width: '90px', height: '90px', borderRadius: '16px', objectFit: 'cover' }} />
                  <div>
                    <h3 style={{ margin: 0, fontWeight: '900', color: '#020617', fontSize: '1.2rem', lineHeight: 1.2 }}>{p.titulo}</h3>
                    <p style={{ margin: '5px 0 10px', color: '#64748b', fontSize: '0.9rem', fontWeight: '700' }}>{formatPrecio(p)} — {p.zona}</p>
                    <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                      <span style={{ fontSize: '0.7rem', padding: '6px 12px', borderRadius: '8px', fontWeight: '900', backgroundColor: p.estado_interno === 'Disponible' ? '#dcfce7' : p.estado_interno === 'Reservada' ? '#fef3c7' : '#fee2e2', color: p.estado_interno === 'Disponible' ? '#166534' : p.estado_interno === 'Reservada' ? '#92400e' : '#991b1b' }}>
                          {p.estado_interno?.toUpperCase()}
                      </span>
                      {!(p.publicado ?? true) && (
                        <span style={{ fontSize: '0.7rem', padding: '6px 12px', borderRadius: '8px', fontWeight: '900', backgroundColor: '#e2e8f0', color: '#475569' }}>
                          BORRADOR
                        </span>
                      )}
                      {p.destacado && (
                        <span style={{ fontSize: '0.7rem', padding: '6px 12px', borderRadius: '8px', fontWeight: '900', backgroundColor: '#fef3c7', color: '#92400e' }}>
                          ★ DESTACADA
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Botonera de Acción (Baja sola si no hay espacio) */}
                <div style={{ display: 'flex', gap: '10px', alignItems: 'center', flexWrap: 'wrap', flex: '1 1 auto', justifyContent: 'flex-start' }}>
                  <select aria-label="Cambiar estado" value={p.estado_interno || 'Disponible'} onChange={(e) => cambiarEstadoRapido(p.id, e.target.value)} style={{ padding: '12px', borderRadius: '12px', fontSize: '0.8rem', fontWeight: '800', border: '1px solid #94a3b8', cursor: 'pointer', backgroundColor: '#ffffff', flex: '1 1 120px', color: '#000000', WebkitAppearance: 'none', appearance: 'none' }}>
                    {ESTADOS_PROPIEDAD.map(s => <option key={s}>{s}</option>)}
                  </select>
                  <button type="button" onClick={() => togglePublicado(p)} style={{ backgroundColor: (p.publicado ?? true) ? '#F1F5F9' : '#DCFCE7', border: '1px solid #e2e8f0', color: (p.publicado ?? true) ? '#475569' : '#166534', padding: '12px 20px', borderRadius: '12px', fontWeight: '800', cursor: 'pointer', fontSize: '0.8rem', flex: '1 1 auto' }}>
                    {(p.publicado ?? true) ? 'DESPUBLICAR' : 'PUBLICAR'}
                  </button>
                  <button type="button" onClick={() => prepararEdicion(p)} style={{ backgroundColor: '#EEF2FF', border: '1px solid #e0e7ff', color: '#4F46E5', padding: '12px 20px', borderRadius: '12px', fontWeight: '800', cursor: 'pointer', fontSize: '0.8rem', flex: '1 1 auto' }}>EDITAR</button>
                  <button type="button" onClick={() => eliminarPropiedad(p.id)} style={{ backgroundColor: '#FFF1F2', border: '1px solid #ffe4e6', color: '#E11D48', padding: '12px 20px', borderRadius: '12px', fontWeight: '800', cursor: 'pointer', fontSize: '0.8rem', flex: '1 1 auto' }}>BORRAR</button>
                </div>

              </div>
            ))}
          </div>
        )}
      </div>

      <style>{`
        .form-container { padding: 50px; }
        @media (max-width: 600px) {
          .form-container { padding: 25px !important; }
          .hide-on-tiny { display: none; }
        }
      `}</style>
    </main>
  )
}