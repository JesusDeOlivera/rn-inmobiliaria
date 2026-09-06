import { NextResponse } from 'next/server'
import { geocodificar } from '../../../lib/geocodificar'
import { supabaseServer } from '../../../lib/supabaseServer'

// Endpoint que usa el panel para obtener las coordenadas de una dirección.
// Solo responde a usuarios autenticados: geocodificar es un servicio externo
// con límite de uso, no queremos exponerlo abierto.
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

  const { direccion, zona } = cuerpo || {}
  if (!direccion) {
    return NextResponse.json({ error: 'Falta la dirección' }, { status: 400 })
  }

  const punto = await geocodificar(direccion, zona)
  if (!punto) {
    return NextResponse.json({ encontrada: false }, { status: 200 })
  }

  return NextResponse.json({ encontrada: true, ...punto }, { status: 200 })
}
