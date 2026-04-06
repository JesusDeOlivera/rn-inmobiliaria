'use client'
import { useEffect, useState } from 'react'
import { supabase } from '../../lib/supabase'
import Link from 'next/link'

// LISTAS DE BARRIOS (se mantienen igual)
const BARRIOS_POSADAS = ["1 de Abril", "10 de Junio", "12 de Octubre", "17 de Octubre", "20 de Junio", "23 de Septiembre", "25 de Diciembre", "25 de Mayo", "25 de Octubre", "30 de Octubre", "8 de Abril", "8 de Diciembre", "9 de Julio", "90 viviendas", "A-3-2", "A-4 Nueva Esperanza", "Acaraguá", "Aeroclub Este", "Aeroclub Oeste", "Aguas Corrientes", "Alta Gracia", "Altos de Bella Vista", "Andresito Guacurarí", "Apos", "Bahia Oeste", "Bajada Vieja", "Baradero", "Belen", "Bicentenario", "Campus Universitario", "Casa Quinta", "Centenario", "Centinela", "Centro", "Centro Civico", "Centro Comercial", "Centro Correntino", "Cerro Pelon", "Ciudad Nueva", "Club Vial", "Cocomarola Este", "Cocomarola Oeste", "Congreso", "Cristo Redentor", "Cristo Rey", "Cruz del Sur", "Diputado Ramon Brousse", "Divina Providencia", "Don Pedro", "El Brete", "El Chaquito - Heller", "El Laurel", "El Libertador", "El Lucero", "El Mensu", "El Palomar", "El Progreso", "El Solar", "El Yerbal", "Esperanza", "Familias Unidas", "Faraon", "Forestal", "Gauchito Gil", "Gobernador Don Aparicio Almeida", "Guazupi", "Hermoso", "Heroes de Malvinas", "Hipólito - Irigoyen", "Hospital", "Independencia", "Ingar", "Islas Malvinas", "Ita Vera", "Itaembé Guazú", "Itaembé Mini", "Jardin", "Jorge Mario Bergoglio", "Juan Gregorio de las Las Heras", "Judicial", "Kennedy", "La Cima", "La Cima del Sol", "La Cumbre", "La Mision", "La Picada", "La Posada", "La Querencia", "La Rivera", "La Rotonda", "Las Dolores", "Las Lomas", "Las Orquideas", "Las Rosas", "Las Tacuaritas", "Las Vertientes", "Latinoamerica", "Lavalle", "Legislativo", "Libertador General Jose de San Martin", "Lluvia de Oro", "Los Aguacates", "Los Álamos", "Los Arboles", "Los Jilgueros", "Los Kiris", "Los Lapachos", "Los Manantiales", "Los Naranjos", "Los Paraisos", "Los Pinos", "Lucas Braulio Areco", "Luís Piedrabuena", "Luz y Fuerza", "Madariaga", "Malagrida", "Manuel Belgrano", "Maria de Nazaret", "Maria Elena Walsh", "Martin Fierro", "Martin Miguel de Guemes", "Miguel Lanús", "Mini City", "Misionerita", "Monseñor Kemerer", "Nazareno", "Nuevo Amanecer", "Obrero", "Olimpia", "Padre Rene Galoppo", "Panambi", "Paraje Itaembe Mario Salomon Barrios", "Parque 2 de Abril", "Parque Adam", "Parque Alta Vista", "Parque de la Salud", "Patoti", "Policial", "Primavera", "Primera Junta", "Primero de Mayo", "Prosol 2", "Puertas del Sol", "Radio Parque", "Regimiento", "Residencial General José Francisco San Martin", "Residencial Sur", "Rincon del Sur", "Rocamora", "Rowing", "Sagrado Corazon de Jesus", "San Alberto", "San Cayetano", "San Francisco de Asis", "San Gerardo", "San Isidro", "San Jorge", "San Jose de la Sagrada Familia", "San Juan Evangelista", "San Lorenzo", "San Lucas", "San Marcos", "San Miguel", "San Onofre", "San Ramon", "Santa Catalina", "Santa Cecilia", "Santa Clara", "Santa Lucia", "Santa Rita", "Santa Rosa", "Sesquicentenario", "Sol de Misiones", "Sol Naciente", "Sur Argentino", "Tacuru", "Tajamar", "Teniente 1° Roberto Estevéz", "Terrazas", "Tiro Federal", "Ubaldo Papini", "Union", "Union Docentes Argentinos UDA", "Villa Blosset", "Villa Bonita", "Villa Cabello", "Villa Coz", "Villa Dolores", "Villa Flor", "Villa Industrial", "Villa Longa", "Villa Mola", "Villa Poujade", "Villa Sarita", "Villa Urquiza", "Villa Vedoya", "Virgen de Itati", "Virgen de Lourdes", "Virgen del Rosario", "Virgen del Valle", "Yacyretá", "Yohasá"]
const BARRIOS_GARUPA = ["Centro (Garupá)", "Ñu Porá", "140 viviendas Ñu Porá", "Santa Clara (I, II, y III)", "Fátima", "Nuevo Garupá", "Barrio Unido", "Andrés Guacurarí", "Don Santiago", "Altos de González", "La Tablada", "Lomas del Sol", "Santa Inés", "Santa Helena", "Néstor Kirchner", "Norte", "Villalonga", "Piedras Blancas", "Ripiera", "110 Viviendas", "30 Viviendas", "140 Viviendas Garupá"]
const BARRIOS_CANDELARIA = ["Centro de Candelaria", "Barrio 2 de Febrero", "Barrio San Cayetano", "Barrio Eva Perón", "Barrio Belgrano", "Barrio 13 de Julio", "Barrio A-3-2 (Candelaria)", "Barrio Lourdes", "Barrio Santa Cecilia", "Barrio Primero de Mayo", "Asentamientos y Barrios Populares (RENABAP)"]

export default function CatalogoAvanzado() {
  const [propiedades, setPropiedades] = useState([])
  const [filtradas, setFiltradas] = useState([])
  const [cargando, setCargando] = useState(true)
  const [sesion, setSesion] = useState(null)
  const [favoritos, setFavoritos] = useState([])

  // ESTADOS DE FILTROS
  const [ubicacion, setUbicacion] = useState('')
  const [tipoPropiedad, setTipoPropiedad] = useState('Todos')
  const [precioMin, setPrecioMin] = useState('')
  const [precioMax, setPrecioMax] = useState('')
  const [moneda, setMoneda] = useState('Todos')
  const [ambientes, setAmbientes] = useState('Todos')
  const [supMin, setSupMin] = useState('')
  const [supMax, setSupMax] = useState('')

  // NUEVOS ESTADOS: Vista y Menú Móvil
  const [vistaActiva, setVistaActiva] = useState('grilla') 
  const [filtrosAbiertos, setFiltrosAbiertos] = useState(false) // Controla si se ven los filtros en el celular

  useEffect(() => {
    fetchPropiedades()
    supabase.auth.getSession().then(({ data: { session } }) => setSesion(session))
    const favsGuardados = JSON.parse(localStorage.getItem('rn_favoritos')) || []
    setFavoritos(favsGuardados)
  }, [])

  useEffect(() => {
    let temp = [...propiedades]
    if (ubicacion) {
        temp = temp.filter(p => 
            p.zona?.toLowerCase().includes(ubicacion.toLowerCase()) || 
            p.titulo?.toLowerCase().includes(ubicacion.toLowerCase()) ||
            p.direccion?.toLowerCase().includes(ubicacion.toLowerCase())
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

    setFiltradas(temp)
  }, [ubicacion, tipoPropiedad, precioMin, precioMax, moneda, ambientes, supMin, supMax, propiedades])

  const fetchPropiedades = async () => {
    const { data } = await supabase.from('propiedades').select('*').order('created_at', { ascending: false })
    if (data) { setPropiedades(data); setFiltradas(data); }
    setCargando(false)
  }

  const toggleFavorito = (e, id) => {
    e.preventDefault()
    let nuevosFavs = [...favoritos]
    if (nuevosFavs.includes(id)) nuevosFavs = nuevosFavs.filter(favId => favId !== id)
    else nuevosFavs.push(id)
    setFavoritos(nuevosFavs)
    localStorage.setItem('rn_favoritos', JSON.stringify(nuevosFavs))
  }

  const mapQuery = filtradas.length > 0 && filtradas[0].direccion 
      ? encodeURIComponent(`${filtradas[0].direccion}, Misiones, Argentina`) 
      : (ubicacion ? encodeURIComponent(`${ubicacion}, Misiones, Argentina`) : encodeURIComponent('Posadas, Misiones, Argentina'));
  const mapUrl = `https://maps.google.com/maps?q=${mapQuery}&t=&z=13&ie=UTF8&iwloc=&output=embed`;

  const labelStyle = { display: 'block', fontSize: '0.75rem', fontWeight: '900', color: '#020617', textTransform: 'uppercase', marginBottom: '12px', marginTop: '25px', letterSpacing: '1px' }
  const inputStyle = { width: '100%', padding: '12px 15px', borderRadius: '12px', border: '1px solid #e2e8f0', fontSize: '0.9rem', outline: 'none', color: '#020617', fontWeight: '600', backgroundColor: '#f8fafc' }
  
  const SegmentedButton = ({ label, activo, onClick }) => (
      <button onClick={onClick} style={{ flex: 1, padding: '8px 0', backgroundColor: activo ? '#4F46E5' : 'transparent', color: activo ? 'white' : '#64748b', border: activo ? 'none' : '1px solid #e2e8f0', borderRadius: '8px', fontWeight: '800', fontSize: '0.8rem', cursor: 'pointer', transition: '0.2s' }}>
          {label}
      </button>
  )

  const RadioOption = ({ label, groupValue, setter }) => (
      <label style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer', marginBottom: '10px', fontSize: '0.9rem', color: '#475569', fontWeight: '600' }}>
          <div style={{ width: '16px', height: '16px', borderRadius: '50%', border: groupValue === label ? '5px solid #4F46E5' : '2px solid #cbd5e1', transition: '0.1s' }}></div>
          <span style={{ color: groupValue === label ? '#020617' : '#475569' }}>{label}</span>
      </label>
  )

  return (
    <main style={{ minHeight: '100vh', backgroundColor: '#f8fafc', fontFamily: 'system-ui, sans-serif' }}>
      <div style={{ padding: '30px 5%', maxWidth: '1600px', margin: '0 auto' }}>
          
          <div style={{ display: 'flex', gap: '10px', color: '#94a3b8', fontSize: '0.85rem', fontWeight: '600', marginBottom: '30px' }}>
              <Link href="/" style={{ textDecoration: 'none', color: '#94a3b8' }}>🏠 Inicio</Link> 
              <span>/</span> 
              <span style={{ color: '#020617' }}>Búsqueda Avanzada</span>
          </div>

          {/* BOTÓN MÓVIL PARA MOSTRAR/OCULTAR FILTROS */}
          <button 
            className="btn-filtros-movil"
            onClick={() => setFiltrosAbiertos(!filtrosAbiertos)}
            style={{ width: '100%', padding: '16px', backgroundColor: '#020617', color: 'white', borderRadius: '16px', fontWeight: '900', marginBottom: '20px', border: 'none', cursor: 'pointer', fontSize: '1rem', display: 'none' }} // Se oculta en PC vía CSS
          >
            {filtrosAbiertos ? 'Ocultar Filtros ✖' : 'Mostrar Filtros ⚲'}
          </button>

          {/* LAYOUT PRINCIPAL CON FLEX WRAP */}
          <div className="layout-principal" style={{ display: 'flex', gap: '40px', alignItems: 'flex-start', flexWrap: 'wrap' }}>
              
              {/* SIDEBAR DE FILTROS */}
              <aside 
                className={`sidebar-filtros ${filtrosAbiertos ? 'abierto' : ''}`} 
                style={{ flex: '1 1 300px', maxWidth: '320px', backgroundColor: 'white', borderRadius: '24px', padding: '25px', border: '1px solid #e2e8f0', position: 'sticky', top: '100px' }}
              >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '10px' }}>
                      <span style={{ fontSize: '1.2rem' }}>⚲</span>
                      <h2 style={{ fontSize: '1.2rem', fontWeight: '900', color: '#020617', margin: 0 }}>Filtros</h2>
                  </div>

                  <label style={labelStyle}>Buscar por texto o dirección</label>
                  <input value={ubicacion} onChange={(e) => setUbicacion(e.target.value)} type="text" placeholder="Ej: Calle Rademacher..." style={inputStyle} />

                  <label style={labelStyle}>Tipo de Propiedad</label>
                  <div style={{ display: 'flex', flexDirection: 'column' }}>
                      <RadioOption label="Todos" groupValue={tipoPropiedad} setter={() => setTipoPropiedad('Todos')} />
                      <RadioOption label="Casa Usada" groupValue={tipoPropiedad} setter={() => setTipoPropiedad('Casa Usada')} />
                      <RadioOption label="Departamento" groupValue={tipoPropiedad} setter={() => setTipoPropiedad('Departamento')} />
                      <RadioOption label="Terreno Baldío" groupValue={tipoPropiedad} setter={() => setTipoPropiedad('Terreno Baldío')} />
                      <RadioOption label="Local Comercial" groupValue={tipoPropiedad} setter={() => setTipoPropiedad('Local Comercial')} />
                  </div>

                  <label style={labelStyle}>Precio</label>
                  <div style={{ display: 'flex', gap: '10px' }}>
                      <input value={precioMin} onChange={(e) => setPrecioMin(e.target.value)} type="number" placeholder="$ Min" style={inputStyle} />
                      <input value={precioMax} onChange={(e) => setPrecioMax(e.target.value)} type="number" placeholder="$ Max" style={inputStyle} />
                  </div>
                  <div style={{ display: 'flex', gap: '5px', marginTop: '10px' }}>
                      <SegmentedButton label="Todos" activo={moneda === 'Todos'} onClick={() => setMoneda('Todos')} />
                      <SegmentedButton label="USD" activo={moneda === 'USD'} onClick={() => setMoneda('USD')} />
                      <SegmentedButton label="ARS" activo={moneda === 'ARS'} onClick={() => setMoneda('ARS')} />
                  </div>

                  <label style={labelStyle}>Ambientes / Dormitorios</label>
                  <div style={{ display: 'flex', gap: '5px' }}>
                      <SegmentedButton label="Todos" activo={ambientes === 'Todos'} onClick={() => setAmbientes('Todos')} />
                      <SegmentedButton label="1" activo={ambientes === '1'} onClick={() => setAmbientes('1')} />
                      <SegmentedButton label="2" activo={ambientes === '2'} onClick={() => setAmbientes('2')} />
                      <SegmentedButton label="3" activo={ambientes === '3'} onClick={() => setAmbientes('3')} />
                      <SegmentedButton label="4+" activo={ambientes === '4+'} onClick={() => setAmbientes('4+')} />
                  </div>

                  <label style={labelStyle}>Superficie (M²)</label>
                  <div style={{ display: 'flex', gap: '10px', marginBottom: '25px' }}>
                      <input value={supMin} onChange={(e) => setSupMin(e.target.value)} type="number" placeholder="Min" style={inputStyle} />
                      <input value={supMax} onChange={(e) => setSupMax(e.target.value)} type="number" placeholder="Max" style={inputStyle} />
                  </div>

                  <button 
                    onClick={() => { setUbicacion(''); setTipoPropiedad('Todos'); setPrecioMin(''); setPrecioMax(''); setMoneda('Todos'); setAmbientes('Todos'); setSupMin(''); setSupMax(''); setFiltrosAbiertos(false); }} 
                    style={{ width: '100%', padding: '12px', borderRadius: '12px', backgroundColor: '#f1f5f9', color: '#64748b', fontWeight: '800', border: 'none', cursor: 'pointer' }}
                  >
                      Limpiar Filtros
                  </button>
              </aside>

              {/* COLUMNA DE RESULTADOS */}
              <div style={{ flex: '1 1 600px', display: 'flex', flexDirection: 'column', width: '100%' }}>
                  
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '30px', flexWrap: 'wrap', gap: '15px' }}>
                    <h1 style={{ fontSize: '1.8rem', fontWeight: '900', color: '#020617', margin: 0, letterSpacing: '-1px' }}>
                        {filtradas.length} inmuebles encontrados
                    </h1>

                    <div style={{ display: 'flex', backgroundColor: '#e2e8f0', padding: '4px', borderRadius: '12px' }}>
                        <button onClick={() => setVistaActiva('grilla')} style={{ padding: '8px 16px', borderRadius: '10px', border: 'none', fontWeight: '800', fontSize: '0.85rem', cursor: 'pointer', backgroundColor: vistaActiva === 'grilla' ? 'white' : 'transparent', color: vistaActiva === 'grilla' ? '#4F46E5' : '#64748b', boxShadow: vistaActiva === 'grilla' ? '0 2px 5px rgba(0,0,0,0.1)' : 'none', transition: '0.2s' }}>⏹️ Grilla</button>
                        <button onClick={() => setVistaActiva('mapa')} style={{ padding: '8px 16px', borderRadius: '10px', border: 'none', fontWeight: '800', fontSize: '0.85rem', cursor: 'pointer', backgroundColor: vistaActiva === 'mapa' ? 'white' : 'transparent', color: vistaActiva === 'mapa' ? '#4F46E5' : '#64748b', boxShadow: vistaActiva === 'mapa' ? '0 2px 5px rgba(0,0,0,0.1)' : 'none', transition: '0.2s' }}>🗺️ Mapa</button>
                    </div>
                  </div>

                  {cargando ? (
                      <div style={{ textAlign: 'center', padding: '100px', color: '#94a3b8', fontWeight: '800' }}>Cargando catálogo...</div>
                  ) : filtradas.length === 0 ? (
                      <div style={{ textAlign: 'center', padding: '80px', backgroundColor: 'white', borderRadius: '24px', border: '1px solid #e2e8f0' }}>
                          <p style={{ color: '#64748b', fontWeight: '800', fontSize: '1.2rem' }}>No hay propiedades que coincidan con estos filtros.</p>
                      </div>
                  ) : vistaActiva === 'mapa' ? (
                      <div style={{ width: '100%', height: '75vh', borderRadius: '32px', overflow: 'hidden', border: '1px solid #e2e8f0', boxShadow: '0 10px 30px rgba(0,0,0,0.05)', position: 'relative' }}>
                          <iframe width="100%" height="100%" style={{ border: 0 }} src={mapUrl} allowFullScreen></iframe>
                      </div>
                  ) : (
                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '25px' }}>
                      {filtradas.map(p => (
                          <div key={p.id} style={{ position: 'relative' }}>
                            <button onClick={(e) => toggleFavorito(e, p.id)} style={{ position: 'absolute', top: '15px', right: '15px', zIndex: 20, backgroundColor: 'white', border: 'none', width: '40px', height: '40px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', boxShadow: '0 4px 10px rgba(0,0,0,0.1)', fontSize: '1.2rem', transition: '0.2s', transform: favoritos.includes(p.id) ? 'scale(1.1)' : 'scale(1)' }}>
                              {favoritos.includes(p.id) ? '❤️' : '🤍'}
                            </button>

                            <Link href={`/propiedad/${p.id}`} style={{ textDecoration: 'none', color: 'inherit' }}>
                            <div style={{ backgroundColor: 'white', borderRadius: '24px', overflow: 'hidden', boxShadow: '0 10px 25px rgba(0,0,0,0.04)', border: '1px solid #e2e8f0', transition: '0.3s' }}>
                                <div style={{ height: '220px', position: 'relative' }}>
                                    <div style={{ position: 'absolute', top: '15px', left: '15px', backgroundColor: '#4F46E5', color: 'white', padding: '5px 12px', borderRadius: '8px', fontSize: '0.7rem', fontWeight: '900', zIndex: 10 }}>VENTA</div>
                                    {p.estado_interno !== 'Disponible' && (
                                        <div style={{ position: 'absolute', top: '45px', left: '15px', backgroundColor: p.estado_interno === 'Reservada' ? '#f59e0b' : '#ef4444', color: 'white', padding: '5px 12px', borderRadius: '8px', fontSize: '0.7rem', fontWeight: '900', zIndex: 10 }}>{p.estado_interno?.toUpperCase()}</div>
                                    )}
                                    <div style={{ position: 'absolute', bottom: '15px', left: '15px', backgroundColor: 'white', padding: '8px 16px', borderRadius: '12px', fontWeight: '900', fontSize: '1.1rem', color: '#020617' }}>
                                        {p.precio > 0 ? `${p.moneda} ${Number(p.precio).toLocaleString('es-AR')}` : 'Consultar Precio'}
                                    </div>
                                    <img src={p.imagenes?.[0]} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                </div>
                                <div style={{ padding: '20px' }}>
                                    <p style={{ color: '#F59E0B', fontSize: '0.8rem', margin: '0 0 8px', fontWeight: '800', textTransform: 'uppercase' }}>📍 {p.zona}</p>
                                    <h3 style={{ fontSize: '1.2rem', fontWeight: '900', color: '#020617', margin: '0 0 15px', lineHeight: 1.3, height: '3.1rem', overflow: 'hidden' }}>{p.titulo}</h3>
                                    <div style={{ display: 'flex', gap: '15px', borderTop: '1px solid #f1f5f9', paddingTop: '15px', color: '#64748b', fontWeight: '700', fontSize: '0.85rem' }}>
                                        {p.habitaciones > 0 && <span style={{ display: 'flex', alignItems: 'center', gap: '5px' }}><span>🛏️</span> {p.habitaciones} Dorm.</span>}
                                        {p.banos > 0 && <span style={{ display: 'flex', alignItems: 'center', gap: '5px' }}><span>🚿</span> {p.banos} Baños</span>}
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

      {/* MAGIA CSS PARA CELULARES */}
      <style>{`
        @media (max-width: 800px) {
          .btn-filtros-movil { display: block !important; }
          .sidebar-filtros { 
            display: none !important; 
            max-width: 100% !important; /* Que ocupe toda la pantalla */
            position: static !important; /* Despegamos el sticky en celular */
            margin-bottom: 20px;
          }
          .sidebar-filtros.abierto { display: block !important; }
          .layout-principal { flex-direction: column !important; }
        }
      `}</style>
    </main>
  )
}