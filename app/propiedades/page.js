'use client'
import { useEffect, useState } from 'react'
import { supabase } from '../../lib/supabase'
import Link from 'next/link'

// LISTAS COMPLETAS DE BARRIOS (se mantienen igual)
const BARRIOS_POSADAS = [
  "1 de Abril", "10 de Junio", "12 de Octubre", "17 de Octubre", "20 de Junio", "23 de Septiembre", "25 de Diciembre", "25 de Mayo", "25 de Octubre", "30 de Octubre", "8 de Abril", "8 de Diciembre", "9 de Julio", "90 viviendas", "A-3-2", "A-4 Nueva Esperanza", "Acaraguá", "Aeroclub Este", "Aeroclub Oeste", "Aguas Corrientes", "Alta Gracia", "Altos de Bella Vista", "Andresito Guacurarí", "Apos", "Bahia Oeste", "Bajada Vieja", "Baradero", "Belen", "Bicentenario", "Campus Universitario", "Casa Quinta", "Centenario", "Centinela", "Centro", "Centro Civico", "Centro Comercial", "Centro Correntino", "Cerro Pelon", "Ciudad Nueva", "Club Vial", "Cocomarola Este", "Cocomarola Oeste", "Congreso", "Cristo Redentor", "Cristo Rey", "Cruz del Sur", "Diputado Ramon Brousse", "Divina Providencia", "Don Pedro", "El Brete", "El Chaquito - Heller", "El Laurel", "El Libertador", "El Lucero", "El Mensu", "El Palomar", "El Progreso", "El Solar", "El Yerbal", "Esperanza", "Familias Unidas", "Faraon", "Forestal", "Gauchito Gil", "Gobernador Don Aparicio Almeida", "Guazupi", "Hermoso", "Heroes de Malvinas", "Hipólito - Irigoyen", "Hospital", "Independencia", "Ingar", "Islas Malvinas", "Ita Vera", "Itaembé Guazú", "Itaembé Mini", "Jardin", "Jorge Mario Bergoglio", "Juan Gregorio de las Las Heras", "Judicial", "Kennedy", "La Cima", "La Cima del Sol", "La Cumbre", "La Mision", "La Picada", "La Posada", "La Querencia", "La Rivera", "La Rotonda", "Las Dolores", "Las Lomas", "Las Orquideas", "Las Rosas", "Las Tacuaritas", "Las Vertientes", "Latinoamerica", "Lavalle", "Legislativo", "Libertador General Jose de San Martin", "Lluvia de Oro", "Los Aguacates", "Los Álamos", "Los Arboles", "Los Jilgueros", "Los Kiris", "Los Lapachos", "Los Manantiales", "Los Naranjos", "Los Paraisos", "Los Pinos", "Lucas Braulio Areco", "Luís Piedrabuena", "Luz y Fuerza", "Madariaga", "Malagrida", "Manuel Belgrano", "Maria de Nazaret", "Maria Elena Walsh", "Martin Fierro", "Martin Miguel de Guemes", "Miguel Lanús", "Mini City", "Misionerita", "Monseñor Kemerer", "Nazareno", "Nuevo Amanecer", "Obrero", "Olimpia", "Padre Rene Galoppo", "Panambi", "Paraje Itaembe Mario Salomon Barrios", "Parque 2 de Abril", "Parque Adam", "Parque Alta Vista", "Parque de la Salud", "Patoti", "Policial", "Primavera", "Primera Junta", "Primero de Mayo", "Prosol 2", "Puertas del Sol", "Radio Parque", "Regimiento", "Residencial General José Francisco San Martin", "Residencial Sur", "Rincon del Sur", "Rocamora", "Rowing", "Sagrado Corazon de Jesus", "San Alberto", "San Cayetano", "San Francisco de Asis", "San Gerardo", "San Isidro", "San Jorge", "San Jose de la Sagrada Familia", "San Juan Evangelista", "San Lorenzo", "San Lucas", "San Marcos", "San Miguel", "San Onofre", "San Ramon", "Santa Catalina", "Santa Cecilia", "Santa Clara", "Santa Lucia", "Santa Rita", "Santa Rosa", "Sesquicentenario", "Sol de Misiones", "Sol Naciente", "Sur Argentino", "Tacuru", "Tajamar", "Teniente 1° Roberto Estevéz", "Terrazas", "Tiro Federal", "Ubaldo Papini", "Union", "Union Docentes Argentinos UDA", "Villa Blosset", "Villa Bonita", "Villa Cabello", "Villa Coz", "Villa Dolores", "Villa Flor", "Villa Industrial", "Villa Longa", "Villa Mola", "Villa Poujade", "Villa Sarita", "Villa Urquiza", "Villa Vedoya", "Virgen de Itati", "Virgen de Lourdes", "Virgen del Rosario", "Virgen del Valle", "Yacyretá", "Yohasá"
]
const BARRIOS_GARUPA = [
  "Centro (Garupá)", "Ñu Porá", "140 viviendas Ñu Porá", "Santa Clara (I, II, y III)", "Fátima", "Nuevo Garupá", "Barrio Unido", "Andrés Guacurarí", "Don Santiago", "Altos de González", "La Tablada", "Lomas del Sol", "Santa Inés", "Santa Helena", "Néstor Kirchner", "Norte", "Villalonga", "Piedras Blancas", "Ripiera", "110 Viviendas", "30 Viviendas", "140 Viviendas Garupá"
]
const BARRIOS_CANDELARIA = [
  "Centro de Candelaria", "Barrio 2 de Febrero", "Barrio San Cayetano", "Barrio Eva Perón", "Barrio Belgrano", "Barrio 13 de Julio", "Barrio A-3-2 (Candelaria)", "Barrio Lourdes", "Barrio Santa Cecilia", "Barrio Primero de Mayo", "Asentamientos y Barrios Populares (RENABAP)"
]

export default function PropiedadesPage() {
  const [propiedades, setPropiedades] = useState([])
  const [filtradas, setFiltradas] = useState([])
  const [cargando, setCargando] = useState(true)
  const [sesion, setSesion] = useState(null)
  
  // NUEVO: Estado para Favoritos
  const [favoritos, setFavoritos] = useState([])

  // Filtros
  const [tipo, setTipo] = useState('Todos')
  const [zona, setZona] = useState('Todas')
  const [busqueda, setBusqueda] = useState('')

  useEffect(() => {
    fetchPropiedades()
    supabase.auth.getSession().then(({ data: { session } }) => setSesion(session))
    
    // Cargar favoritos guardados al entrar a la página
    const favsGuardados = JSON.parse(localStorage.getItem('rn_favoritos')) || []
    setFavoritos(favsGuardados)
  }, [])

  useEffect(() => {
    let temp = [...propiedades]
    
    if (busqueda) {
        temp = temp.filter(p => p.titulo.toLowerCase().includes(busqueda.toLowerCase()))
    }
    if (zona !== 'Todas') {
        temp = temp.filter(p => p.zona === zona)
    }
    if (tipo !== 'Todos') {
        temp = temp.filter(p => p.tipo === tipo)
    }

    setFiltradas(temp)
  }, [busqueda, tipo, zona, propiedades])

  const fetchPropiedades = async () => {
    const { data } = await supabase.from('propiedades').select('*').order('created_at', { ascending: false })
    if (data) { setPropiedades(data); setFiltradas(data); }
    setCargando(false)
  }

  // NUEVO: Función para agregar o quitar favoritos
  const toggleFavorito = (e, id) => {
    e.preventDefault() // Evita que al tocar el corazón se abra la página de la propiedad
    let nuevosFavs = [...favoritos]
    
    if (nuevosFavs.includes(id)) {
        nuevosFavs = nuevosFavs.filter(favId => favId !== id) // Si ya estaba, lo saca
    } else {
        nuevosFavs.push(id) // Si no estaba, lo agrega
    }
    
    setFavoritos(nuevosFavs)
    localStorage.setItem('rn_favoritos', JSON.stringify(nuevosFavs)) // Lo guarda en la memoria de la PC/celular
  }

  const inputStyles = { 
    padding: '15px', 
    borderRadius: '14px', 
    border: '1px solid #e2e8f0', 
    fontSize: '1rem', 
    fontWeight: '700', 
    color: '#020617', 
    outline: 'none', 
    backgroundColor: '#f8fafc', 
    cursor: 'pointer',
    width: '100%'
  }

  return (
    <main style={{ minHeight: '100vh', backgroundColor: '#f8fafc', fontFamily: 'system-ui, sans-serif' }}>
      
      {/* 2. HERO */}
      <section style={{ 
          height: '400px', 
          backgroundImage: 'linear-gradient(rgba(0, 0, 0, 0.5), rgba(0, 0, 0, 0.7)), url(https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1920&q=80)',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center'
      }}>
          <h1 style={{ color: 'white', fontSize: '3.5rem', fontWeight: '900', margin: '0 0 10px 0', letterSpacing: '-1px' }}>Catálogo de Ventas</h1>
          <p style={{ color: '#e2e8f0', fontSize: '1.2rem', fontWeight: '500' }}>Encontrá tu próximo hogar en la tierra roja</p>
      </section>

      {/* 3. BUSCADOR INTEGRAL */}
      <section style={{ maxWidth: '1150px', margin: '-60px auto 0 auto', position: 'relative', zIndex: 10, padding: '0 20px' }}>
          <div style={{ backgroundColor: 'white', borderRadius: '28px', padding: '25px', boxShadow: '0 25px 50px rgba(0,0,0,0.1)', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '15px', alignItems: 'end' }}>
              
              <div>
                  <label style={{ display: 'block', fontSize: '0.7rem', fontWeight: '900', color: '#64748b', marginBottom: '8px', textTransform: 'uppercase' }}>Tipo de inmueble</label>
                  <select value={tipo} onChange={(e) => setTipo(e.target.value)} style={inputStyles}>
                      <option value="Todos">Cualquier tipo</option>
                      <option>Casa Usada</option>
                      <option>Departamento</option>
                      <option>Terreno Baldío</option>
                      <option>Local Comercial</option>
                  </select>
              </div>

              <div>
                  <label style={{ display: 'block', fontSize: '0.7rem', fontWeight: '900', color: '#64748b', marginBottom: '8px', textTransform: 'uppercase' }}>Zona / Barrio</label>
                  <select value={zona} onChange={(e) => setZona(e.target.value)} style={inputStyles}>
                      <option value="Todas">Todas las zonas</option>
                      <optgroup label="POSADAS">
                        {BARRIOS_POSADAS.map(b => <option key={b} value={b}>{b}</option>)}
                      </optgroup>
                      <optgroup label="GARUPÁ">
                        {BARRIOS_GARUPA.map(b => <option key={b} value={b}>{b}</option>)}
                      </optgroup>
                      <optgroup label="CANDELARIA">
                        {BARRIOS_CANDELARIA.map(b => <option key={b} value={b}>{b}</option>)}
                      </optgroup>
                  </select>
              </div>

              <div>
                  <label style={{ display: 'block', fontSize: '0.7rem', fontWeight: '900', color: '#64748b', marginBottom: '8px', textTransform: 'uppercase' }}>Búsqueda por nombre</label>
                  <input value={busqueda} onChange={(e) => setBusqueda(e.target.value)} type="text" placeholder="Ej: Moderna..." style={inputStyles} />
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  <button style={{ backgroundColor: '#020617', color: 'white', border: 'none', padding: '15px', borderRadius: '14px', fontWeight: '900', fontSize: '1rem', cursor: 'pointer', transition: '0.3s', width: '100%' }}>
                      BUSCAR
                  </button>
                  <Link href="/catalogo" style={{ textDecoration: 'none', color: '#4F46E5', fontWeight: '800', fontSize: '0.85rem', textAlign: 'center' }}>
                      + Búsqueda Avanzada
                  </Link>
              </div>
          </div>
      </section>

      {/* 4. RESULTADOS */}
      <section style={{ padding: '80px 5%', maxWidth: '1400px', margin: '0 auto' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '50px', borderBottom: '2px solid #f1f5f9', paddingBottom: '20px' }}>
            <div>
                <h2 style={{ fontSize: '2.2rem', fontWeight: '900', color: '#020617', margin: 0 }}>Propiedades en Venta</h2>
                <span style={{ color: '#64748b', fontWeight: '800', fontSize: '1rem' }}>{filtradas.length} inmuebles encontrados</span>
            </div>
        </div>

        {cargando ? (
            <div style={{ textAlign: 'center', padding: '100px', color: '#94a3b8', fontWeight: '800' }}>Cargando catálogo...</div>
        ) : filtradas.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '100px', backgroundColor: 'white', borderRadius: '32px' }}>
                <p style={{ color: '#64748b', fontWeight: '800', fontSize: '1.2rem' }}>No hay propiedades que coincidan con la búsqueda.</p>
                <button onClick={() => {setBusqueda(''); setZona('Todas'); setTipo('Todos');}} style={{ marginTop: '15px', textDecoration: 'underline', border: 'none', background: 'none', color: '#4F46E5', fontWeight: '800', cursor: 'pointer' }}>Limpiar filtros</button>
            </div>
        ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))', gap: '40px' }}>
            {filtradas.map(p => (
                
                // NUEVO: Contenedor relativo para poder posicionar el corazón arriba a la derecha
                <div key={p.id} style={{ position: 'relative' }}>
                  
                  {/* NUEVO: Botón de Corazón */}
                  <button 
                    onClick={(e) => toggleFavorito(e, p.id)}
                    style={{ position: 'absolute', top: '15px', right: '15px', zIndex: 20, backgroundColor: 'white', border: 'none', width: '40px', height: '40px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', boxShadow: '0 4px 10px rgba(0,0,0,0.1)', fontSize: '1.2rem', transition: '0.2s', transform: favoritos.includes(p.id) ? 'scale(1.1)' : 'scale(1)' }}
                  >
                    {favoritos.includes(p.id) ? '❤️' : '🤍'}
                  </button>

                  <Link href={`/propiedad/${p.id}`} style={{ textDecoration: 'none', color: 'inherit' }}>
                  <div style={{ backgroundColor: 'white', borderRadius: '32px', overflow: 'hidden', boxShadow: '0 10px 30px rgba(0,0,0,0.04)', border: '1px solid #f1f5f9', transition: '0.3s' }}>
                      <div style={{ height: '300px', position: 'relative' }}>
                          <div style={{ position: 'absolute', top: '20px', left: '20px', backgroundColor: '#22c55e', color: 'white', padding: '6px 14px', borderRadius: '10px', fontSize: '0.7rem', fontWeight: '900', zIndex: 10 }}>VENTA</div>
                          {p.estado_interno !== 'Disponible' && (
                              <div style={{ position: 'absolute', top: '50px', left: '20px', backgroundColor: '#ef4444', color: 'white', padding: '6px 14px', borderRadius: '10px', fontSize: '0.7rem', fontWeight: '900', zIndex: 10 }}>{p.estado_interno?.toUpperCase()}</div>
                          )}
                          <div style={{ position: 'absolute', bottom: '20px', left: '20px', backgroundColor: 'white', padding: '10px 20px', borderRadius: '16px', fontWeight: '900', fontSize: '1.4rem', color: '#020617', boxShadow: '0 4px 15px rgba(0,0,0,0.1)' }}>
                              {p.moneda} {Number(p.precio).toLocaleString('es-AR')}
                          </div>
                          <img src={p.imagenes?.[0]} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
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

      {/* FOOTER */}
      <footer style={{ backgroundColor: '#020617', padding: '60px 8%', color: 'white', textAlign: 'center' }}>
          <h2 style={{ fontSize: '1.8rem', fontWeight: '900', marginBottom: '10px' }}>RN INMOBILIARIA</h2>
          <div style={{ fontSize: '0.85rem', color: '#475569', fontWeight: '700', letterSpacing: '2px' }}>
              © 2026 POSADAS, MISIONES, ARGENTINA
          </div>
      </footer>
    </main>
  )
}