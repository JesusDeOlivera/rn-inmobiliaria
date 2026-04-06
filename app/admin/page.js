'use client'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '../../lib/supabase'
import Link from 'next/link'

// LA MISMA LISTA PARA EL PANEL DE CARGA
const BARRIOS_POSADAS = [
  "1 de Abril", "10 de Junio", "12 de Octubre", "17 de Octubre", "20 de Junio", "23 de Septiembre", "25 de Diciembre", "25 de Mayo", "25 de Octubre", "30 de Octubre", "8 de Abril", "8 de Diciembre", "9 de Julio", "90 viviendas", "A-3-2", "A-4 Nueva Esperanza", "Acaraguá", "Aeroclub Este", "Aeroclub Oeste", "Aguas Corrientes", "Alta Gracia", "Altos de Bella Vista", "Andresito Guacurarí", "Apos", "Bahia Oeste", "Bajada Vieja", "Baradero", "Belen", "Bicentenario", "Campus Universitario", "Casa Quinta", "Centenario", "Centinela", "Centro", "Centro Civico", "Centro Comercial", "Centro Correntino", "Cerro Pelon", "Ciudad Nueva", "Club Vial", "Cocomarola Este", "Cocomarola Oeste", "Congreso", "Cristo Redentor", "Cristo Rey", "Cruz del Sur", "Diputado Ramon Brousse", "Divina Providencia", "Don Pedro", "El Brete", "El Chaquito - Heller", "El Laurel", "El Libertador", "El Lucero", "El Mensu", "El Palomar", "El Progreso", "El Solar", "El Yerbal", "Esperanza", "Familias Unidas", "Faraon", "Forestal", "Gauchito Gil", "Gobernador Don Aparicio Almeida", "Guazupi", "Hermoso", "Heroes de Malvinas", "Hipólito - Irigoyen", "Hospital", "Independencia", "Ingar", "Islas Malvinas", "Ita Vera", "Itaembé Guazú", "Itaembé Mini", "Jardin", "Jorge Mario Bergoglio", "Juan Gregorio de las Las Heras", "Judicial", "Kennedy", "La Cima", "La Cima del Sol", "La Cumbre", "La Mision", "La Picada", "La Posada", "La Querencia", "La Rivera", "La Rotonda", "Las Dolores", "Las Lomas", "Las Orquideas", "Las Rosas", "Las Tacuaritas", "Las Vertientes", "Latinoamerica", "Lavalle", "Legislativo", "Libertador General Jose de San Martin", "Lluvia de Oro", "Los Aguacates", "Los Álamos", "Los Arboles", "Los Jilgueros", "Los Kiris", "Los Lapachos", "Los Manantiales", "Los Naranjos", "Los Paraisos", "Los Pinos", "Lucas Braulio Areco", "Luís Piedrabuena", "Luz y Fuerza", "Madariaga", "Malagrida", "Manuel Belgrano", "Maria de Nazaret", "Maria Elena Walsh", "Martin Fierro", "Martin Miguel de Guemes", "Miguel Lanús", "Mini City", "Misionerita", "Monseñor Kemerer", "Nazareno", "Nuevo Amanecer", "Obrero", "Olimpia", "Padre Rene Galoppo", "Panambi", "Paraje Itaembe Mario Salomon Barrios", "Parque 2 de Abril", "Parque Adam", "Parque Alta Vista", "Parque de la Salud", "Patoti", "Policial", "Primavera", "Primera Junta", "Primero de Mayo", "Prosol 2", "Puertas del Sol", "Radio Parque", "Regimiento", "Residencial General José Francisco San Martin", "Residencial Sur", "Rincon del Sur", "Rocamora", "Rowing", "Sagrado Corazon de Jesus", "San Alberto", "San Cayetano", "San Francisco de Asis", "San Gerardo", "San Isidro", "San Jorge", "San Jose de la Sagrada Familia", "San Juan Evangelista", "San Lorenzo", "San Lucas", "San Marcos", "San Miguel", "San Onofre", "San Ramon", "Santa Catalina", "Santa Cecilia", "Santa Clara", "Santa Lucia", "Santa Rita", "Santa Rosa", "Sesquicentenario", "Sol de Misiones", "Sol Naciente", "Sur Argentino", "Tacuru", "Tajamar", "Teniente 1° Roberto Estevéz", "Terrazas", "Tiro Federal", "Ubaldo Papini", "Union", "Union Docentes Argentinos UDA", "Villa Blosset", "Villa Bonita", "Villa Cabello", "Villa Coz", "Villa Dolores", "Villa Flor", "Villa Industrial", "Villa Longa", "Villa Mola", "Villa Poujade", "Villa Sarita", "Villa Urquiza", "Villa Vedoya", "Virgen de Itati", "Virgen de Lourdes", "Virgen del Rosario", "Virgen del Valle", "Yacyretá", "Yohasá"
]
const BARRIOS_GARUPA = [
  "Centro (Garupá)", "Ñu Porá", "140 viviendas Ñu Porá", "Santa Clara (I, II, y III)", "Fátima", "Nuevo Garupá", "Barrio Unido", "Andrés Guacurarí", "Don Santiago", "Altos de González", "La Tablada", "Lomas del Sol", "Santa Inés", "Santa Helena", "Néstor Kirchner", "Norte", "Villalonga", "Piedras Blancas", "Ripiera", "110 Viviendas", "30 Viviendas", "140 Viviendas Garupá"
]
const BARRIOS_CANDELARIA = [
  "Centro de Candelaria", "Barrio 2 de Febrero", "Barrio San Cayetano", "Barrio Eva Perón", "Barrio Belgrano", "Barrio 13 de Julio", "Barrio A-3-2 (Candelaria)", "Barrio Lourdes", "Barrio Santa Cecilia", "Barrio Primero de Mayo", "Asentamientos y Barrios Populares (RENABAP)"
]

export default function AdminPanel() {
  const router = useRouter()
  const [tab, setTab] = useState('gestionar') 
  const [autorizado, setAutorizado] = useState(false)
  const [propiedades, setPropiedades] = useState([])
  const [cargando, setCargando] = useState(false)
  const [mensaje, setMensaje] = useState('')
  const [editandoId, setEditandoId] = useState(null)
  
  const CONTACTOS = {
    papa: { nombre: 'RN Inmobiliaria', tel: '5493764170186', email: 'negocioinmobiliariorn@gmail.com' },
    socio: { nombre: 'Socio RN', tel: '5493764000000', email: 'socio@rninmobiliaria.com' }
  }

  const [formData, setFormData] = useState({ 
    titulo: '', descripcion: '', precio: '', moneda: 'USD', 
    tipo: 'Casa Usada', zona: 'Centro', imagenes: [],
    habitaciones: '', banos: '', metros_cuadrados: '', direccion: '',
    estado_interno: 'Disponible',
    vendedor_asignado: 'Ramon Norberto',
    nombre_vendedor: CONTACTOS.papa.nombre,
    telefono_vendedor: CONTACTOS.papa.tel,
    email_vendedor: CONTACTOS.papa.email
  })

  useEffect(() => {
    const checkUser = async () => {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) router.push('/login')
      else { setAutorizado(true); fetchPropiedades(); }
    }
    checkUser()
  }, [router])

  const fetchPropiedades = async () => {
    const { data } = await supabase.from('propiedades').select('*').order('created_at', { ascending: false })
    if (data) setPropiedades(data)
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
    setFormData({ ...p })
    setEditandoId(p.id)
    setTab('cargar')
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setCargando(true)
    setMensaje('Procesando...')
    try {
      let finalImages = formData.imagenes
      if (formData.imagenes.length > 0 && formData.imagenes[0] instanceof File) {
        let imageUrls = []
        for (const file of formData.imagenes) {
          const fileName = `${Date.now()}-${Math.random()}.${file.name.split('.').pop()}`
          await supabase.storage.from('imagenes_propiedades').upload(fileName, file)
          const { data: { publicUrl } } = supabase.storage.from('imagenes_propiedades').getPublicUrl(fileName)
          imageUrls.push(publicUrl)
        }
        finalImages = imageUrls
      }

      const objetoPropiedad = { 
        ...formData, 
        precio: parseFloat(formData.precio),
        habitaciones: parseInt(formData.habitaciones) || 0,
        banos: parseInt(formData.banos) || 0,
        metros_cuadrados: parseFloat(formData.metros_cuadrados) || 0,
        imagenes: finalImages 
      }

      if (editandoId) {
        await supabase.from('propiedades').update(objetoPropiedad).eq('id', editandoId)
        setMensaje('✓ ACTUALIZADA')
      } else {
        await supabase.from('propiedades').insert([objetoPropiedad])
        setMensaje('✓ PUBLICADA')
      }

      setEditandoId(null)
      fetchPropiedades()
      setTab('gestionar')
    } catch (err) { setMensaje('Error: ' + err.message) }
    setCargando(false)
    setTimeout(() => setMensaje(''), 3000)
  }

  const cambiarEstadoRapido = async (id, nuevoEstado) => {
    await supabase.from('propiedades').update({ estado_interno: nuevoEstado }).eq('id', id)
    fetchPropiedades()
  }

  const eliminarPropiedad = async (id) => {
    if (confirm('¿Seguro querés borrar esta propiedad definitivamente?')) {
      await supabase.from('propiedades').delete().eq('id', id)
      fetchPropiedades()
    }
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
            <button onClick={() => { setTab('gestionar'); setEditandoId(null); }} style={{ flex: '1 1 150px', padding: '15px', borderRadius: '16px', border: 'none', fontWeight: '800', cursor: 'pointer', backgroundColor: tab === 'gestionar' ? '#ffffff' : 'transparent', color: '#020617', transition: '0.3s' }}>
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
                  <option>Disponible</option><option>Reservada</option><option>Vendida</option>
                </select>
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '20px' }}>
              <div>
                <label style={labelStyle}>Zona / Barrio</label>
                <select value={formData.zona} style={inputStyle} onChange={e => setFormData({...formData, zona: e.target.value})}>
                   <optgroup label="POSADAS">{BARRIOS_POSADAS.map(b => <option key={b} value={b}>{b}</option>)}</optgroup>
                   <optgroup label="GARUPÁ">{BARRIOS_GARUPA.map(b => <option key={b} value={b}>{b}</option>)}</optgroup>
                   <optgroup label="CANDELARIA">{BARRIOS_CANDELARIA.map(b => <option key={b} value={b}>{b}</option>)}</optgroup>
                </select>
              </div>
              <div>
                <label style={labelStyle}>Tipo de Inmueble</label>
                <select value={formData.tipo} style={inputStyle} onChange={e => setFormData({...formData, tipo: e.target.value})}>
                  <option>Casa Usada</option><option>Departamento</option><option>Terreno Baldío</option><option>Local Comercial</option>
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
                <input value={formData.direccion} placeholder="Ej: Av. Uruguay 4500" style={inputStyle} onChange={e => setFormData({...formData, direccion: e.target.value})} />
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
                  <img src={p.imagenes?.[0]} style={{ width: '90px', height: '90px', borderRadius: '16px', objectFit: 'cover' }} />
                  <div>
                    <h3 style={{ margin: 0, fontWeight: '900', color: '#020617', fontSize: '1.2rem', lineHeight: 1.2 }}>{p.titulo}</h3>
                    <p style={{ margin: '5px 0 10px', color: '#64748b', fontSize: '0.9rem', fontWeight: '700' }}>{p.moneda} {Number(p.precio).toLocaleString('es-AR')} — {p.zona}</p>
                    <span style={{ fontSize: '0.7rem', padding: '6px 12px', borderRadius: '8px', fontWeight: '900', backgroundColor: p.estado_interno === 'Disponible' ? '#dcfce7' : p.estado_interno === 'Reservada' ? '#fef3c7' : '#fee2e2', color: p.estado_interno === 'Disponible' ? '#166534' : p.estado_interno === 'Reservada' ? '#92400e' : '#991b1b' }}>
                        {p.estado_interno?.toUpperCase()}
                    </span>
                  </div>
                </div>

                {/* Botonera de Acción (Baja sola si no hay espacio) */}
                <div style={{ display: 'flex', gap: '10px', alignItems: 'center', flexWrap: 'wrap', flex: '1 1 auto', justifyContent: 'flex-start' }}>
                  <select value={p.estado_interno || 'Disponible'} onChange={(e) => cambiarEstadoRapido(p.id, e.target.value)} style={{ padding: '12px', borderRadius: '12px', fontSize: '0.8rem', fontWeight: '800', border: '1px solid #e2e8f0', cursor: 'pointer', backgroundColor: '#f8fafc', flex: '1 1 120px' }}>
                    <option>Disponible</option><option>Reservada</option><option>Vendida</option>
                  </select>
                  <button onClick={() => prepararEdicion(p)} style={{ backgroundColor: '#EEF2FF', border: '1px solid #e0e7ff', color: '#4F46E5', padding: '12px 20px', borderRadius: '12px', fontWeight: '800', cursor: 'pointer', fontSize: '0.8rem', flex: '1 1 auto' }}>EDITAR</button>
                  <button onClick={() => eliminarPropiedad(p.id)} style={{ backgroundColor: '#FFF1F2', border: '1px solid #ffe4e6', color: '#E11D48', padding: '12px 20px', borderRadius: '12px', fontWeight: '800', cursor: 'pointer', fontSize: '0.8rem', flex: '1 1 auto' }}>BORRAR</button>
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