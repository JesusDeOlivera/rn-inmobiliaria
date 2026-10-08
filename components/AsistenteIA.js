'use client'
import { useEffect, useRef, useState } from 'react'
import Image from 'next/image'
import { guardarPropiedad, guardarImagenes, subirFotos } from '../lib/admin'
import { formatPrecio } from '../lib/format'

// Asistente de carga de propiedades por IA: pensado para alguien sin
// práctica con computadoras (ej. una persona mayor). Charla en lenguaje
// natural, adjunta fotos, y al confirmar carga la propiedad entera —
// subiendo las fotos y guardando la ficha — sin pasar por el formulario
// manual. Queda como borrador (no publicada): el único paso humano que
// falta es tocar "Publicar" en el Listado cuando esté todo revisado.

const SALUDO = 'Hola! Contame sobre la propiedad que querés cargar: qué tipo es, en qué barrio y el precio. Podés escribir o dictar por voz, y adjuntar las fotos cuando quieras.'

export default function AsistenteIA({ supabase, agentes, onCargada }) {
  const [mensajes, setMensajes] = useState([{ rol: 'asistente', texto: SALUDO }])
  const [entrada, setEntrada] = useState('')
  const [fotos, setFotos] = useState([])
  const [previews, setPreviews] = useState([])
  const [borrador, setBorrador] = useState(null)
  const [agenteElegido, setAgenteElegido] = useState('')
  const [pensando, setPensando] = useState(false)
  const [guardando, setGuardando] = useState(false)
  const [grabando, setGrabando] = useState(false)
  const [soporteVoz, setSoporteVoz] = useState(false)

  const reconocimientoRef = useRef(null)
  const listaRef = useRef(null)

  useEffect(() => {
    setSoporteVoz(Boolean(window.SpeechRecognition || window.webkitSpeechRecognition))
  }, [])

  useEffect(() => {
    if (agentes?.length === 1) setAgenteElegido(agentes[0].id)
  }, [agentes])

  useEffect(() => {
    const urls = fotos.map((f) => URL.createObjectURL(f))
    setPreviews(urls)
    return () => urls.forEach((u) => URL.revokeObjectURL(u))
  }, [fotos])

  useEffect(() => {
    listaRef.current?.scrollTo({ top: listaRef.current.scrollHeight, behavior: 'smooth' })
  }, [mensajes, borrador, pensando])

  const agregarFotos = (e) => {
    if (e.target.files?.length) setFotos((prev) => [...prev, ...Array.from(e.target.files)])
    e.target.value = ''
  }
  const quitarFoto = (i) => setFotos((prev) => prev.filter((_, idx) => idx !== i))

  const alternarDictado = () => {
    const Recognition = window.SpeechRecognition || window.webkitSpeechRecognition
    if (!Recognition) return
    if (grabando) {
      reconocimientoRef.current?.stop()
      return
    }
    const r = new Recognition()
    r.lang = 'es-AR'
    r.interimResults = false
    r.maxAlternatives = 1
    r.onresult = (ev) => {
      const texto = ev.results[0][0].transcript
      setEntrada((prev) => (prev ? `${prev} ${texto}` : texto))
    }
    r.onend = () => setGrabando(false)
    r.onerror = () => setGrabando(false)
    reconocimientoRef.current = r
    setGrabando(true)
    r.start()
  }

  const enviarMensaje = async () => {
    const texto = entrada.trim()
    if (!texto || pensando) return

    const historialParaEnviar = mensajes.map((m) => ({ rol: m.rol, texto: m.texto }))
    setMensajes((prev) => [...prev, { rol: 'usuario', texto }])
    setEntrada('')
    setBorrador(null)
    setPensando(true)

    try {
      const { data: { session } } = await supabase.auth.getSession()
      const res = await fetch('/api/asistente', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${session?.access_token || ''}` },
        body: JSON.stringify({ mensaje: texto, historial: historialParaEnviar }),
      })
      const datos = await res.json()
      if (!res.ok || datos.error) throw new Error(datos.error || 'El asistente no pudo responder.')

      if (datos.tipo === 'listo') {
        setMensajes((prev) => [...prev, { rol: 'asistente', texto: datos.resumen }])
        setBorrador(datos.propiedad)
      } else {
        setMensajes((prev) => [...prev, { rol: 'asistente', texto: datos.texto }])
      }
    } catch (err) {
      setMensajes((prev) => [...prev, { rol: 'asistente', texto: `Uy, tuve un problema: ${err.message}. ¿Probamos de nuevo?` }])
    }
    setPensando(false)
  }

  const confirmarCarga = async () => {
    if (!borrador || !agenteElegido) return
    setGuardando(true)
    try {
      const { data: { session } } = await supabase.auth.getSession()

      let urls = []
      if (fotos.length > 0) {
        const { urls: nuevas, error: errSubida } = await subirFotos(supabase, fotos)
        if (errSubida) throw new Error(errSubida)
        urls = nuevas
      }

      let coords = { latitud: null, longitud: null }
      if (borrador.direccion?.trim()) {
        try {
          const res = await fetch('/api/geocodificar', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${session?.access_token || ''}` },
            body: JSON.stringify({ direccion: borrador.direccion, zona: borrador.barrio_nombre }),
          })
          const datos = await res.json()
          if (datos.encontrada) coords = { latitud: datos.lat, longitud: datos.lng }
        } catch { /* se guarda sin coordenadas */ }
      }

      const { id, error: errGuardado } = await guardarPropiedad(supabase, {
        titulo: borrador.titulo,
        descripcion: borrador.descripcion,
        precio: borrador.precio,
        moneda: borrador.moneda,
        id_tipo: borrador.id_tipo,
        id_barrio: borrador.id_barrio,
        id_agente: agenteElegido,
        dormitorios: borrador.dormitorios,
        banos: borrador.banos,
        superficie_m2: borrador.superficie_m2,
        direccion: borrador.direccion,
        ...coords,
        estado: 'Disponible',
        publicado: false,
        destacado: false,
      }, null)
      if (errGuardado) throw new Error(errGuardado)

      const { error: errImgs } = await guardarImagenes(supabase, id, urls)
      if (errImgs) throw new Error(errImgs)

      setMensajes((prev) => [...prev, {
        rol: 'asistente',
        texto: 'Listo, la guardé como borrador. Para que se vea en la página, entrá a "Listado" y tocá "Publicar" cuando quieras.',
      }])
      setBorrador(null)
      setFotos([])
      onCargada?.()
    } catch (err) {
      setMensajes((prev) => [...prev, { rol: 'asistente', texto: `No pude guardarla: ${err.message}. ¿Probamos de nuevo?` }])
    }
    setGuardando(false)
  }

  return (
    <div className="admin-panel asis-panel">
      <div className="asis-cabecera">
        <h1>Asistente de carga por IA</h1>
        <p className="asis-bajada">
          Contale la propiedad como si se la describieras a una persona. El asistente
          completa la ficha y la deja guardada; solo falta publicarla desde el Listado.
        </p>
      </div>

      <div className="asis-chat" ref={listaRef}>
        {mensajes.map((m, i) => (
          <div key={i} className={`asis-burbuja ${m.rol === 'usuario' ? 'asis-burbuja-usuario' : 'asis-burbuja-asistente'}`}>
            {m.texto}
          </div>
        ))}
        {pensando && <div className="asis-burbuja asis-burbuja-asistente asis-pensando">Pensando…</div>}

        {borrador && (
          <div className="asis-resumen">
            <h2>Esto entendí</h2>
            <dl>
              <div><dt>Título</dt><dd>{borrador.titulo}</dd></div>
              <div><dt>Tipo</dt><dd>{borrador.tipo_nombre}</dd></div>
              <div><dt>Barrio</dt><dd>{borrador.barrio_nombre}</dd></div>
              <div><dt>Precio</dt><dd>{formatPrecio(borrador)}</dd></div>
              {(borrador.dormitorios > 0 || borrador.banos > 0 || borrador.superficie_m2 > 0) && (
                <div>
                  <dt>Detalle</dt>
                  <dd>
                    {borrador.dormitorios > 0 && `${borrador.dormitorios} dormitorios`}
                    {borrador.banos > 0 && ` · ${borrador.banos} baños`}
                    {borrador.superficie_m2 > 0 && ` · ${borrador.superficie_m2} m²`}
                  </dd>
                </div>
              )}
            </dl>
            <p className="asis-descripcion">{borrador.descripcion}</p>

            {fotos.length > 0 && (
              <p className="asis-pista">{fotos.length} foto(s) adjunta(s) se van a subir con la propiedad.</p>
            )}

            {agentes?.length > 1 && (
              <div className="admin-campo" style={{ marginBottom: 12 }}>
                <label className="etiqueta" htmlFor="asis-agente">Agente responsable</label>
                <select id="asis-agente" className="campo" value={agenteElegido}
                  onChange={(e) => setAgenteElegido(e.target.value)}>
                  <option value="">Elegí un agente…</option>
                  {agentes.map((a) => (
                    <option key={a.id} value={a.id}>
                      {a.nombre}{a.matricula ? ` — mat. ${a.matricula}` : ''}
                    </option>
                  ))}
                </select>
              </div>
            )}

            <div className="asis-resumen-acciones">
              <button type="button" className="btn btn-primario" disabled={guardando || !agenteElegido} onClick={confirmarCarga}>
                {guardando ? 'Guardando…' : 'Cargar esta propiedad'}
              </button>
              <button type="button" className="admin-enlace" disabled={guardando} onClick={() => setBorrador(null)}>
                Seguir corrigiendo
              </button>
            </div>
          </div>
        )}
      </div>

      {previews.length > 0 && (
        <div className="asis-fotos">
          {previews.map((src, i) => (
            <div key={src} className="asis-foto">
              <Image src={src} alt="" width={64} height={64} unoptimized style={{ width: 64, height: 64, objectFit: 'cover' }} />
              <button type="button" onClick={() => quitarFoto(i)} aria-label="Quitar foto">×</button>
            </div>
          ))}
        </div>
      )}

      <div className="asis-entrada">
        <label className="asis-boton-icono" title="Adjuntar fotos">
          <input type="file" accept="image/*" multiple onChange={agregarFotos} style={{ display: 'none' }} />
          📷
        </label>

        {soporteVoz && (
          <button type="button" onClick={alternarDictado}
            className={`asis-boton-icono ${grabando ? 'asis-grabando' : ''}`}
            title={grabando ? 'Detener dictado' : 'Dictar por voz'}>
            🎤
          </button>
        )}

        <input
          className="campo asis-input"
          value={entrada}
          placeholder="Escribí o dictá acá…"
          onChange={(e) => setEntrada(e.target.value)}
          onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); enviarMensaje() } }}
        />
        <button type="button" className="btn btn-primario" disabled={pensando || !entrada.trim()} onClick={enviarMensaje}>
          Enviar
        </button>
      </div>

      <style>{`
        .asis-panel { padding: clamp(20px, 3.5vw, 32px); display: grid; gap: 16px; }
        .asis-cabecera h1 { font-size: clamp(1.3rem, 3vw, 1.6rem); margin-bottom: 6px; }
        .asis-bajada { color: var(--tinta-500); font-size: 0.92rem; line-height: 1.5; }

        .asis-chat {
          display: grid; gap: 10px; align-content: start;
          max-height: 460px; overflow-y: auto;
          padding: 16px; border-radius: var(--r-md);
          background: var(--arena-50); border: 1px solid var(--borde-suave);
        }
        .asis-burbuja {
          max-width: 80%; padding: 12px 16px; border-radius: 16px;
          font-size: 0.95rem; line-height: 1.5; white-space: pre-wrap;
        }
        .asis-burbuja-asistente {
          background: var(--superficie); border: 1px solid var(--borde-suave);
          align-self: flex-start; border-bottom-left-radius: 4px;
        }
        .asis-burbuja-usuario {
          background: var(--tierra-600); color: #fff;
          align-self: end; margin-left: auto; border-bottom-right-radius: 4px;
        }
        .asis-pensando { color: var(--tinta-400); font-style: italic; }

        .asis-resumen {
          background: var(--superficie); border: 1px solid var(--tierra-400);
          border-radius: var(--r-md); padding: 18px; display: grid; gap: 12px;
        }
        .asis-resumen h2 { font-size: 1rem; color: var(--tierra-600); }
        .asis-resumen dl { display: grid; gap: 8px; }
        .asis-resumen dl > div { display: flex; gap: 8px; font-size: 0.9rem; }
        .asis-resumen dt { font-weight: 600; color: var(--tinta-500); flex-shrink: 0; min-width: 70px; }
        .asis-resumen dd { color: var(--tinta-900); }
        .asis-descripcion { font-size: 0.9rem; color: var(--tinta-700); line-height: 1.5; }
        .asis-resumen-acciones { display: flex; gap: 14px; align-items: center; flex-wrap: wrap; }

        .asis-fotos { display: flex; gap: 8px; flex-wrap: wrap; }
        .asis-foto { position: relative; width: 64px; height: 64px; }
        .asis-foto img { width: 100%; height: 100%; object-fit: cover; border-radius: var(--r-sm); }
        .asis-foto button {
          position: absolute; top: -6px; right: -6px; width: 20px; height: 20px;
          border-radius: 50%; background: var(--error-fg); color: #fff;
          border: none; font-size: 13px; line-height: 1; cursor: pointer;
        }

        .asis-entrada { display: flex; gap: 8px; align-items: center; }
        .asis-input { flex: 1; }
        .asis-boton-icono {
          display: grid; place-items: center; flex-shrink: 0;
          width: 44px; height: 44px; border-radius: 50%;
          background: var(--arena-100); border: 1px solid var(--borde);
          font-size: 18px; cursor: pointer;
        }
        .asis-grabando { background: var(--error-bg); border-color: var(--error-fg); }

        @media (max-width: 480px) {
          .asis-burbuja { max-width: 92%; }
        }
      `}</style>
    </div>
  )
}
