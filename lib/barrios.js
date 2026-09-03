// =============================================================
//  Listas de barrios / zonas y tipos de inmueble.
//  Antes estaban copiadas literalmente en admin, propiedades y
//  catálogo. Ahora se importan desde acá.
// =============================================================

export const BARRIOS_POSADAS = [
  "1 de Abril", "10 de Junio", "12 de Octubre", "17 de Octubre", "20 de Junio", "23 de Septiembre", "25 de Diciembre", "25 de Mayo", "25 de Octubre", "30 de Octubre", "8 de Abril", "8 de Diciembre", "9 de Julio", "90 viviendas", "A-3-2", "A-4 Nueva Esperanza", "Acaraguá", "Aeroclub Este", "Aeroclub Oeste", "Aguas Corrientes", "Alta Gracia", "Altos de Bella Vista", "Andresito Guacurarí", "Apos", "Bahia Oeste", "Bajada Vieja", "Baradero", "Belen", "Bicentenario", "Campus Universitario", "Casa Quinta", "Centenario", "Centinela", "Centro", "Centro Civico", "Centro Comercial", "Centro Correntino", "Cerro Pelon", "Ciudad Nueva", "Club Vial", "Cocomarola Este", "Cocomarola Oeste", "Congreso", "Cristo Redentor", "Cristo Rey", "Cruz del Sur", "Diputado Ramon Brousse", "Divina Providencia", "Don Pedro", "El Brete", "El Chaquito - Heller", "El Laurel", "El Libertador", "El Lucero", "El Mensu", "El Palomar", "El Progreso", "El Solar", "El Yerbal", "Esperanza", "Familias Unidas", "Faraon", "Forestal", "Gauchito Gil", "Gobernador Don Aparicio Almeida", "Guazupi", "Hermoso", "Heroes de Malvinas", "Hipólito - Irigoyen", "Hospital", "Independencia", "Ingar", "Islas Malvinas", "Ita Vera", "Itaembé Guazú", "Itaembé Mini", "Jardin", "Jorge Mario Bergoglio", "Juan Gregorio de las Las Heras", "Judicial", "Kennedy", "La Cima", "La Cima del Sol", "La Cumbre", "La Mision", "La Picada", "La Posada", "La Querencia", "La Rivera", "La Rotonda", "Las Dolores", "Las Lomas", "Las Orquideas", "Las Rosas", "Las Tacuaritas", "Las Vertientes", "Latinoamerica", "Lavalle", "Legislativo", "Libertador General Jose de San Martin", "Lluvia de Oro", "Los Aguacates", "Los Álamos", "Los Arboles", "Los Jilgueros", "Los Kiris", "Los Lapachos", "Los Manantiales", "Los Naranjos", "Los Paraisos", "Los Pinos", "Lucas Braulio Areco", "Luís Piedrabuena", "Luz y Fuerza", "Madariaga", "Malagrida", "Manuel Belgrano", "Maria de Nazaret", "Maria Elena Walsh", "Martin Fierro", "Martin Miguel de Guemes", "Miguel Lanús", "Mini City", "Misionerita", "Monseñor Kemerer", "Nazareno", "Nuevo Amanecer", "Obrero", "Olimpia", "Padre Rene Galoppo", "Panambi", "Paraje Itaembe Mario Salomon Barrios", "Parque 2 de Abril", "Parque Adam", "Parque Alta Vista", "Parque de la Salud", "Patoti", "Policial", "Primavera", "Primera Junta", "Primero de Mayo", "Prosol 2", "Puertas del Sol", "Radio Parque", "Regimiento", "Residencial General José Francisco San Martin", "Residencial Sur", "Rincon del Sur", "Rocamora", "Rowing", "Sagrado Corazon de Jesus", "San Alberto", "San Cayetano", "San Francisco de Asis", "San Gerardo", "San Isidro", "San Jorge", "San Jose de la Sagrada Familia", "San Juan Evangelista", "San Lorenzo", "San Lucas", "San Marcos", "San Miguel", "San Onofre", "San Ramon", "Santa Catalina", "Santa Cecilia", "Santa Clara", "Santa Lucia", "Santa Rita", "Santa Rosa", "Sesquicentenario", "Sol de Misiones", "Sol Naciente", "Sur Argentino", "Tacuru", "Tajamar", "Teniente 1° Roberto Estevéz", "Terrazas", "Tiro Federal", "Ubaldo Papini", "Union", "Union Docentes Argentinos UDA", "Villa Blosset", "Villa Bonita", "Villa Cabello", "Villa Coz", "Villa Dolores", "Villa Flor", "Villa Industrial", "Villa Longa", "Villa Mola", "Villa Poujade", "Villa Sarita", "Villa Urquiza", "Villa Vedoya", "Virgen de Itati", "Virgen de Lourdes", "Virgen del Rosario", "Virgen del Valle", "Yacyretá", "Yohasá",
]

export const BARRIOS_GARUPA = [
  "Centro (Garupá)", "Ñu Porá", "140 viviendas Ñu Porá", "Santa Clara (I, II, y III)", "Fátima", "Nuevo Garupá", "Barrio Unido", "Andrés Guacurarí", "Don Santiago", "Altos de González", "La Tablada", "Lomas del Sol", "Santa Inés", "Santa Helena", "Néstor Kirchner", "Norte", "Villalonga", "Piedras Blancas", "Ripiera", "110 Viviendas", "30 Viviendas", "140 Viviendas Garupá",
]

export const BARRIOS_CANDELARIA = [
  "Centro de Candelaria", "Barrio 2 de Febrero", "Barrio San Cayetano", "Barrio Eva Perón", "Barrio Belgrano", "Barrio 13 de Julio", "Barrio A-3-2 (Candelaria)", "Barrio Lourdes", "Barrio Santa Cecilia", "Barrio Primero de Mayo", "Asentamientos y Barrios Populares (RENABAP)",
]

// Grupos listos para usar con <optgroup>.
export const GRUPOS_BARRIOS = [
  { label: 'POSADAS', barrios: BARRIOS_POSADAS },
  { label: 'GARUPÁ', barrios: BARRIOS_GARUPA },
  { label: 'CANDELARIA', barrios: BARRIOS_CANDELARIA },
]

export const TODOS_LOS_BARRIOS = [
  ...BARRIOS_POSADAS,
  ...BARRIOS_GARUPA,
  ...BARRIOS_CANDELARIA,
]

export const TIPOS_INMUEBLE = [
  'Casa Usada',
  'Departamento',
  'Terreno Baldío',
  'Local Comercial',
]

export const ESTADOS_PROPIEDAD = ['Disponible', 'Reservada', 'Vendida']
