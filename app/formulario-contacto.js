'use client'

import { useState } from 'react'
import { supabase } from '../lib/supabase'
import { waLink } from '../lib/format'
import { WHATSAPP_PRINCIPAL } from '../lib/config'

// Formulario de contacto del home. Guarda el lead en Supabase y además
// abre WhatsApp con el mensaje pre-cargado.
export default function FormularioContacto() {
  const [form, setForm] = useState({ nombre: '', email: '', mensaje: '' })
  const [enviando, setEnviando] = useState(false)
  const [feedback, setFeedback] = useState(null) // { tipo: 'ok'|'error', texto }

  const enviar = async (e) => {
    e.preventDefault()
    setEnviando(true)
    setFeedback(null)

    // 1) Guardamos el lead (aunque el usuario no llegue a abrir WhatsApp).
    //    Sin .select(): el rol anon no tiene permiso de SELECT sobre consultas,
    //    así que pedir la representación devolvería 401.
    const { error } = await supabase.from('consultas').insert([
      { nombre: form.nombre, email: form.email, mensaje: form.mensaje, origen: 'home' },
    ])

    setEnviando(false)

    if (error) {
      setFeedback({
        tipo: 'error',
        texto: 'No pudimos registrar tu mensaje. Escribinos directo por WhatsApp.',
      })
    } else {
      setFeedback({ tipo: 'ok', texto: '¡Listo! Te vamos a contactar a la brevedad.' })
    }

    // 2) Abrimos WhatsApp con el mensaje armado.
    const texto = `Hola RN Inmobiliaria. Soy ${form.nombre}.\nMi Email: ${form.email}\n\nMensaje: ${form.mensaje}`
    window.open(waLink(WHATSAPP_PRINCIPAL, texto), '_blank', 'noopener')

    if (!error) setForm({ nombre: '', email: '', mensaje: '' })
  }

  return (
    <form onSubmit={enviar} className="panel form-contacto">
      <h3 className="form-contacto-titulo">Envianos un mensaje</h3>

      {feedback && (
        <p role="status" className={`mensaje ${feedback.tipo === 'ok' ? 'mensaje-ok' : 'mensaje-error'}`}>
          {feedback.texto}
        </p>
      )}

      <div>
        <label className="etiqueta" htmlFor="c-nombre">Nombre completo *</label>
        <input
          id="c-nombre" required className="campo"
          value={form.nombre}
          onChange={e => setForm({ ...form, nombre: e.target.value })}
          type="text" placeholder="Juan Pérez" autoComplete="name"
        />
      </div>
      <div>
        <label className="etiqueta" htmlFor="c-email">Email *</label>
        <input
          id="c-email" required className="campo"
          value={form.email}
          onChange={e => setForm({ ...form, email: e.target.value })}
          type="email" placeholder="juan@ejemplo.com" autoComplete="email" inputMode="email"
        />
      </div>
      <div>
        <label className="etiqueta" htmlFor="c-mensaje">Mensaje *</label>
        <textarea
          id="c-mensaje" required className="campo"
          value={form.mensaje}
          onChange={e => setForm({ ...form, mensaje: e.target.value })}
          placeholder="Me interesa tasar mi propiedad..."
          style={{ height: 118, resize: 'none' }}
        />
      </div>

      <button
        type="submit"
        disabled={enviando}
        className="btn btn-primario btn-bloque"
        style={{ marginTop: 4, opacity: enviando ? 0.7 : 1 }}
      >
        {enviando ? 'Enviando...' : 'Enviar a WhatsApp 💬'}
      </button>
    </form>
  )
}
