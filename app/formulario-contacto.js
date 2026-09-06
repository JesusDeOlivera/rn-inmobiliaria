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
    <form onSubmit={enviar} style={{ backgroundColor: 'white', padding: 'clamp(24px, 5vw, 44px)', borderRadius: '28px', boxShadow: '0 20px 50px rgba(0,0,0,0.08)', border: '1px solid #e2e8f0', display: 'flex', flexDirection: 'column', gap: '18px' }}>
      <h3 style={{ fontSize: 'clamp(1.4rem, 4vw, 1.8rem)', fontWeight: '900', color: '#020617', margin: '0 0 4px' }}>Envianos un mensaje</h3>

      {feedback && (
        <p role="status" style={{
          margin: 0, padding: '12px 16px', borderRadius: '12px', fontWeight: 700, fontSize: '0.9rem',
          backgroundColor: feedback.tipo === 'ok' ? '#dcfce7' : '#fee2e2',
          color: feedback.tipo === 'ok' ? '#166534' : '#991b1b',
        }}>
          {feedback.texto}
        </p>
      )}

      <div>
        <label className="form-label" htmlFor="c-nombre">Nombre completo *</label>
        <input
          id="c-nombre" required className="form-input"
          value={form.nombre}
          onChange={e => setForm({ ...form, nombre: e.target.value })}
          type="text" placeholder="Juan Pérez" autoComplete="name"
        />
      </div>
      <div>
        <label className="form-label" htmlFor="c-email">Email *</label>
        <input
          id="c-email" required className="form-input"
          value={form.email}
          onChange={e => setForm({ ...form, email: e.target.value })}
          type="email" placeholder="juan@ejemplo.com" autoComplete="email" inputMode="email"
        />
      </div>
      <div>
        <label className="form-label" htmlFor="c-mensaje">Mensaje *</label>
        <textarea
          id="c-mensaje" required className="form-input"
          value={form.mensaje}
          onChange={e => setForm({ ...form, mensaje: e.target.value })}
          placeholder="Me interesa tasar mi propiedad..."
          style={{ height: '110px', resize: 'none' }}
        />
      </div>

      <button
        type="submit"
        disabled={enviando}
        style={{ backgroundColor: '#4F46E5', color: 'white', padding: '18px', borderRadius: '14px', fontWeight: '900', fontSize: '1rem', border: 'none', cursor: enviando ? 'default' : 'pointer', opacity: enviando ? 0.7 : 1, marginTop: '4px', boxShadow: '0 8px 20px rgba(79,70,229,0.3)', minHeight: '52px', touchAction: 'manipulation' }}
      >
        {enviando ? 'Enviando...' : 'Enviar a WhatsApp 💬'}
      </button>
    </form>
  )
}
