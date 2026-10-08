import { NextResponse } from 'next/server'
import { GoogleGenAI } from '@google/genai'
import { supabaseServer } from '../../../lib/supabaseServer'

// Asistente de carga de propiedades por IA (pensado para alguien sin
// práctica con computadoras): charla en lenguaje natural y devuelve una
// ficha de propiedad ya completa para guardar. Solo responde a usuarios
// autenticados, igual que /api/geocodificar.
//
// Usa la API gratuita de Gemini (Google AI Studio) en vez de una de pago:
// no requiere tarjeta para el nivel gratuito. GEMINI_API_KEY se consigue en
// https://aistudio.google.com/apikey.

const MODELO = 'gemini-flash-latest'

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY })

/** Quita tildes y pasa a minúsculas, para comparar nombres de catálogos. */
const MARCAS_DIACRITICAS = new RegExp('[' + String.fromCharCode(0x0300) + '-' + String.fromCharCode(0x036f) + ']', 'g')

function normalizar(texto) {
  return (texto || '')
    .normalize('NFD')
    .replace(MARCAS_DIACRITICAS, '')
    .toLowerCase()
    .trim()
}

function construirPrompt(nombresTipos, nombresBarrios) {
  return `Sos el asistente de carga de propiedades de RN Inmobiliaria, una inmobiliaria familiar en Posadas, Misiones (Argentina). Tu usuario es una persona mayor, sin mucha práctica con computadoras, que te cuenta de forma informal los datos de una propiedad para publicarla. Conversá en español rioplatense, cálido, simple y breve.

Datos que necesitás reunir:
- tipo de inmueble: tiene que ser EXACTAMENTE uno de esta lista, copiado tal cual: ${nombresTipos.join(', ')}
- barrio: tiene que ser EXACTAMENTE uno de esta lista, copiado tal cual: ${nombresBarrios.join(', ')}
- precio (número) y moneda (USD o ARS)
- título corto para el anuncio (si no te lo dan, inventá uno breve a partir del tipo y el barrio, ej: "Casa en Villa Cabello")
- descripción: redactala VOS, en 2 a 4 oraciones, tono cálido y profesional, usando ÚNICAMENTE lo que la persona te contó. Nunca inventes características (pileta, garage, reformas, estado, etc.) que no te hayan dicho.
- opcionales, solo si los mencionan: dormitorios, baños, metros cuadrados, dirección

Reglas de la conversación:
- Si falta el tipo, el barrio o el precio: hacé UNA sola pregunta corta y concreta para conseguir el dato que falta más importante. No preguntes por los opcionales ni por fotos (de las fotos se encarga otra parte del sistema).
- Apenas tengas tipo, barrio y precio ya podés dar el resultado final, aunque falten los opcionales.
- Si te corrigen algo después de haber dado un resultado "listo" (ej: "en realidad son 4 habitaciones"), actualizá el dato y volvé a responder "listo" con todo actualizado.
- Nunca repitas el saludo ni expliques tu razonamiento.
- Respondé SIEMPRE y ÚNICAMENTE con un objeto JSON válido, sin texto antes ni después y sin bloques de código markdown, con una de estas dos formas exactas:

1) Si falta un dato imprescindible:
{"tipo": "pregunta", "texto": "tu pregunta corta, en tono amigable"}

2) Si ya tenés todo lo imprescindible:
{"tipo": "listo", "resumen": "2 líneas resumiendo la propiedad para mostrarle a la persona, en texto plano", "propiedad": {"titulo": "...", "descripcion": "...", "precio": 0, "moneda": "USD", "tipo_nombre": "...", "barrio_nombre": "...", "dormitorios": 0, "banos": 0, "superficie_m2": 0, "direccion": ""}}`
}


function parsearJSON(texto) {
  const limpio = texto.trim().replace(/^```(json)?/i, '').replace(/```$/, '').trim()
  try {
    return JSON.parse(limpio)
  } catch {
    return null
  }
}

export async function POST(request) {
  const token = request.headers.get('authorization')?.replace('Bearer ', '')
  if (!token) {
    return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
  }
  const { data: { user }, error: errorAuth } = await supabaseServer.auth.getUser(token)
  if (errorAuth || !user) {
    return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
  }

  let cuerpo
  try {
    cuerpo = await request.json()
  } catch {
    return NextResponse.json({ error: 'Cuerpo inválido' }, { status: 400 })
  }

  const { mensaje, historial } = cuerpo || {}
  if (!mensaje || typeof mensaje !== 'string') {
    return NextResponse.json({ error: 'Falta el mensaje' }, { status: 400 })
  }

  const [{ data: tipos }, { data: barrios }] = await Promise.all([
    supabaseServer.from('tipos_inmueble').select('id_tipo, nombre').order('nombre'),
    supabaseServer.from('barrios').select('id_barrio, nombre').order('nombre'),
  ])

  if (!tipos?.length || !barrios?.length) {
    return NextResponse.json({ error: 'No se pudieron leer los catálogos' }, { status: 500 })
  }

  const mensajes = [
    ...(Array.isArray(historial) ? historial : []).map((h) => ({
      role: h.rol === 'asistente' ? 'model' : 'user',
      parts: [{ text: String(h.texto || '') }],
    })),
    { role: 'user', parts: [{ text: mensaje }] },
  ]

  let respuesta
  try {
    respuesta = await ai.models.generateContent({
      model: MODELO,
      contents: mensajes,
      config: {
        systemInstruction: construirPrompt(tipos.map((t) => t.nombre), barrios.map((b) => b.nombre)),
        responseMimeType: 'application/json',
      },
    })
  } catch (err) {
    console.error('Error llamando a Gemini:', err)
    return NextResponse.json({ error: 'El asistente no está disponible ahora. Probá de nuevo en un rato.' }, { status: 502 })
  }

  const parseado = parsearJSON(respuesta.text || '')

  if (!parseado || (parseado.tipo !== 'pregunta' && parseado.tipo !== 'listo')) {
    return NextResponse.json({
      tipo: 'pregunta',
      texto: 'Disculpá, no te entendí bien. ¿Podés contármelo de otra forma?',
    })
  }

  if (parseado.tipo === 'pregunta') {
    return NextResponse.json({ tipo: 'pregunta', texto: String(parseado.texto || '¿Podés dar más detalles?') })
  }

  // tipo === 'listo': resolvemos los nombres contra los catálogos reales.
  const p = parseado.propiedad || {}
  const tipoEncontrado = tipos.find((t) => normalizar(t.nombre) === normalizar(p.tipo_nombre))
  const barrioEncontrado = barrios.find((b) => normalizar(b.nombre) === normalizar(p.barrio_nombre))

  if (!tipoEncontrado || !barrioEncontrado) {
    return NextResponse.json({
      tipo: 'pregunta',
      texto: !tipoEncontrado
        ? `No reconocí ese tipo de inmueble. ¿Es alguno de estos: ${tipos.map((t) => t.nombre).join(', ')}?`
        : `No reconocí ese barrio. ¿Podés decirme el nombre del barrio tal como figura en el padrón municipal?`,
    })
  }

  return NextResponse.json({
    tipo: 'listo',
    resumen: String(parseado.resumen || ''),
    propiedad: {
      titulo: String(p.titulo || ''),
      descripcion: String(p.descripcion || ''),
      precio: Number(p.precio) || 0,
      moneda: p.moneda === 'ARS' ? 'ARS' : 'USD',
      id_tipo: tipoEncontrado.id_tipo,
      id_barrio: barrioEncontrado.id_barrio,
      tipo_nombre: tipoEncontrado.nombre,
      barrio_nombre: barrioEncontrado.nombre,
      dormitorios: Number(p.dormitorios) || 0,
      banos: Number(p.banos) || 0,
      superficie_m2: Number(p.superficie_m2) || 0,
      direccion: String(p.direccion || ''),
    },
  })
}
