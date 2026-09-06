'use client'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { supabase } from '../../lib/supabase'
import { ESTADOS_PROPIEDAD } from '../../lib/barrios'
import { formatPrecio, imagenPrincipal } from '../../lib/format'
import { listarPropiedades } from '../../lib/propiedades'
import { listarBarriosAgrupados, listarTipos, listarAgentes } from '../../lib/catalogos'
import { guardarPropiedad, guardarImagenes, borrarPropiedad, cambiarEstado, cambiarPublicado } from '../../lib/admin'

// Valores por defecto del formulario. Ahora usa las claves foráneas del
// modelo normalizado (id_barrio, id_tipo, id_agente) en vez de texto libre.
const FORM_VACIO = {
  titulo: '', descripcion: '', precio: '', moneda: 'USD',
  id_tipo: '', id_barrio: '', id_agente: '',
  imagenes: [], imagenesActuales: [],
  dormitorios: '', banos: '', superficie_m2: '', direccion: '',
  latitud: null, longitud: null,
  estado: 'Disponible',
  publicado: true,
  destacado: false,
}

export default function AdminPanel() {
  const router = useRouter()
  const [tab, setTab] = useState('gestionar')
  const [autorizado, setAutorizado] = useState(false)
  const [propiedades, setPropiedades] = useState([])
  const [cargando, setCargando] = useState(false)
  const [mensaje, setMensaje] = useState(null) // { tipo, texto }
  const [editandoId, setEditandoId] = useState(null)
  const [ubicando, setUbicando] = useState(false)
  const [ubicacionHallada, setUbicacionHallada] = useState(null)
  const [aBorrar, setABorrar] = useState(null) // propiedad pendiente de confirmación

  // Catálogos traídos de la base (RN-09: los gestiona el administrador).
  const [gruposBarrios, setGruposBarrios] = useState([])
  const [tipos, setTipos] = useState([])
  const [agentes, setAgentes] = useState([])

  const [formData, setFormData] = useState(FORM_VACIO)

  const avisar = (texto, tipo = 'ok') => {
    setMensaje({ texto, tipo })
    setTimeout(() => setMensaje(null), 4000)
  }

  useEffect(() => {
    const checkUser = async () => {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) router.push('/login')
      else { setAutorizado(true); fetchPropiedades(); fetchCatalogos() }
    }
    checkUser()
    // Solo al montar: verifica sesión y hace la carga inicial.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [router])

  const fetchCatalogos = async () => {
    const [b, t, a] = await Promise.all([
      listarBarriosAgrupados(supabase),
      listarTipos(supabase),
      listarAgentes(supabase),
    ])
    setGruposBarrios(b.data)
    setTipos(t.data)
    setAgentes(a.data)
  }

  // El panel ve TODO, incluidas las no publicadas (a diferencia del sitio público).
  const fetchPropiedades = async () => {
    const { data, error } = await listarPropiedades(supabase, { incluirNoPublicadas: true })
    if (error) return avisar('Error al cargar propiedades: ' + error, 'error')
    setPropiedades(data)
  }

  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.push('/')
  }

  const handleFileChange = (e) => {
    if (e.target.files) setFormData({ ...formData, imagenes: Array.from(e.target.files) })
  }

  const prepararEdicion = (p) => {
    // `p` viene de la vista v_propiedades: mapeamos a los campos del formulario.
    setFormData({
      ...FORM_VACIO,
      titulo: p.titulo || '',
      descripcion: p.descripcion || '',
      precio: p.precio ?? '',
      moneda: p.moneda || 'USD',
      id_tipo: p.id_tipo ?? '',
      id_barrio: p.id_barrio ?? '',
      id_agente: p.id_agente ?? '',
      dormitorios: p.dormitorios ?? '',
      banos: p.banos ?? '',
      superficie_m2: p.superficie_m2 ?? '',
      direccion: p.direccion || '',
      latitud: p.latitud ?? null,
      longitud: p.longitud ?? null,
      estado: p.estado || 'Disponible',
      publicado: p.publicado ?? true,
      destacado: p.destacado ?? false,
      imagenes: [],                       // solo si sube nuevas
      imagenesActuales: p.imagenes || [], // las que ya tiene
    })
    setEditandoId(p.id)
    setUbicacionHallada(null)
    setTab('cargar')
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const nuevaPropiedad = () => {
    setEditandoId(null)
    setFormData(FORM_VACIO)
    setUbicacionHallada(null)
    setTab('cargar')
  }

  // Pide las coordenadas al endpoint propio, que consulta Nominatim server-side.
  /** Nombre del barrio elegido, para acotar la geocodificación. */
  const nombreBarrio = () => {
    for (const g of gruposBarrios) {
      const b = g.barrios.find((x) => String(x.id) === String(formData.id_barrio))
      if (b) return b.nombre
    }
    return ''
  }

  const geocodificar = async (direccion, zona) => {
    const { data: { session } } = await supabase.auth.getSession()
    const res = await fetch('/api/geocodificar', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${session?.access_token || ''}`,
      },
      body: JSON.stringify({ direccion, zona }),
    })
    return res.json()
  }

  const ubicarEnMapa = async () => {
    if (!formData.direccion?.trim()) {
      return avisar('Cargá una dirección antes de ubicarla en el mapa.', 'aviso')
    }
    setUbicando(true)
    setUbicacionHallada(null)
    try {
      const datos = await geocodificar(formData.direccion, nombreBarrio())
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
    try {
      if (!formData.id_barrio || !formData.id_tipo || !formData.id_agente) {
        throw new Error('Barrio, tipo y agente responsable son obligatorios.')
      }

      // 1) Subir las fotos nuevas, si las hay.
      let urls = formData.imagenesActuales
      if (formData.imagenes.length > 0 && formData.imagenes[0] instanceof File) {
        const nuevas = []
        for (const file of formData.imagenes) {
          const fileName = `${Date.now()}-${Math.round(Math.random() * 1e9)}.${file.name.split('.').pop()}`
          const { error: upErr } = await supabase.storage.from('imagenes_propiedades').upload(fileName, file)
          if (upErr) throw new Error('Subiendo imágenes: ' + upErr.message)
          const { data: { publicUrl } } = supabase.storage.from('imagenes_propiedades').getPublicUrl(fileName)
          nuevas.push(publicUrl)
        }
        urls = nuevas
      }

      // 2) Geocodificar si falta la ubicación.
      let coords = { latitud: formData.latitud, longitud: formData.longitud }
      if (formData.direccion?.trim() && (coords.latitud == null || coords.longitud == null)) {
        try {
          const datos = await geocodificar(formData.direccion, nombreBarrio())
          if (datos.encontrada) coords = { latitud: datos.lat, longitud: datos.lng }
        } catch { /* sin coordenadas: la propiedad se guarda igual */ }
      }

      // 3) Guardar la propiedad y, aparte, su galería (entidad IMAGEN).
      const { id, error } = await guardarPropiedad(
        supabase, { ...formData, ...coords }, editandoId
      )
      if (error) throw new Error(error)

      const { error: errImgs } = await guardarImagenes(supabase, id, urls)
      if (errImgs) throw new Error('Guardando la galería: ' + errImgs)

      avisar(editandoId ? 'Propiedad actualizada' : 'Propiedad publicada')
      setEditandoId(null)
      setFormData(FORM_VACIO)
      fetchPropiedades()
      setTab('gestionar')
    } catch (err) {
      avisar('Error: ' + err.message, 'error')
    }
    setCargando(false)
  }

  const cambiarEstadoRapido = async (id, nuevoEstado) => {
    const { error } = await cambiarEstado(supabase, id, nuevoEstado)
    if (error) avisar('Error: ' + error, 'error')
    fetchPropiedades()
  }

  const togglePublicado = async (p) => {
    const { error } = await cambiarPublicado(supabase, p.id, !(p.publicado ?? true))
    if (error) avisar('Error: ' + error, 'error')
    fetchPropiedades()
  }

  const confirmarBorrado = async () => {
    if (!aBorrar) return
    const { error } = await borrarPropiedad(supabase, aBorrar.id)
    if (error) avisar('Error al borrar: ' + error, 'error')
    else avisar('Propiedad eliminada')
    setABorrar(null)
    fetchPropiedades()
  }

  if (!autorizado) {
    return (
      <div className="admin-verificando">
        <div className="admin-spinner" />
        <p>Verificando acceso…</p>
        <style>{`
          .admin-verificando {
            min-height: 100vh; display: grid; place-items: center; gap: 16px;
            align-content: center; background: var(--arena-100);
            color: var(--tinta-500); font-weight: 500;
          }
          .admin-spinner {
            width: 34px; height: 34px; border-radius: 50%;
            border: 3px solid var(--arena-300); border-top-color: var(--tierra-600);
            animation: girar .9s linear infinite;
          }
          @keyframes girar { to { transform: rotate(360deg) } }
        `}</style>
      </div>
    )
  }

  const publicadas = propiedades.filter((p) => p.publicado ?? true).length
  const destacadas = propiedades.filter((p) => p.destacado).length

  return (
    <div className="admin">
      {/* ================= BARRA ================= */}
      <header className="admin-barra">
        <div className="admin-barra-inner">
          <Link href="/admin" className="admin-marca">
            <span className="admin-marca-logo">RN</span>
            <span className="admin-marca-texto">
              <strong>Panel</strong>
              <span>Administración</span>
            </span>
          </Link>

          <div className="admin-barra-acciones">
            <Link href="/" className="admin-btn-fantasma">Ver el sitio</Link>
            <button type="button" onClick={handleLogout} className="admin-btn-salir">Salir</button>
          </div>
        </div>
      </header>

      <main className="admin-cuerpo">
        {/* ================= RESUMEN ================= */}
        <section className="admin-metricas">
          <div className="admin-metrica">
            <span className="admin-metrica-valor">{propiedades.length}</span>
            <span className="admin-metrica-etiqueta">Propiedades</span>
          </div>
          <div className="admin-metrica">
            <span className="admin-metrica-valor">{publicadas}</span>
            <span className="admin-metrica-etiqueta">Publicadas</span>
          </div>
          <div className="admin-metrica">
            <span className="admin-metrica-valor">{destacadas}</span>
            <span className="admin-metrica-etiqueta">En portada</span>
          </div>
        </section>

        {/* ================= PESTAÑAS ================= */}
        <div className="admin-pestanas" role="tablist">
          <button
            type="button" role="tab" aria-selected={tab === 'gestionar'}
            className={tab === 'gestionar' ? 'activa' : ''}
            onClick={() => { setTab('gestionar'); setEditandoId(null); setFormData(FORM_VACIO) }}
          >
            Listado
          </button>
          <button
            type="button" role="tab" aria-selected={tab === 'cargar'}
            className={tab === 'cargar' ? 'activa' : ''}
            onClick={() => setTab('cargar')}
          >
            {editandoId ? 'Editando propiedad' : 'Cargar nueva'}
          </button>
        </div>

        {mensaje && (
          <p role="status" className={`mensaje admin-aviso ${mensaje.tipo === 'error' ? 'mensaje-error' : mensaje.tipo === 'aviso' ? 'admin-aviso-atencion' : 'mensaje-ok'}`}>
            {mensaje.texto}
          </p>
        )}

        {/* ================= FORMULARIO ================= */}
        {tab === 'cargar' ? (
          <form onSubmit={handleSubmit} className="admin-panel admin-form">
            <div className="admin-form-cabecera">
              <h1>{editandoId ? 'Editar propiedad' : 'Cargar una propiedad'}</h1>
              {editandoId && (
                <button type="button" onClick={nuevaPropiedad} className="admin-enlace">
                  Cancelar edición
                </button>
              )}
            </div>

            <fieldset className="admin-grupo">
              <legend>Datos principales</legend>
              <div className="admin-fila">
                <div className="admin-campo">
                  <label className="etiqueta" htmlFor="a-titulo">Título</label>
                  <input id="a-titulo" required className="campo" value={formData.titulo}
                    onChange={(e) => setFormData({ ...formData, titulo: e.target.value })}
                    placeholder="Ej: Casa con patio en Villa Cabello" />
                </div>
                <div className="admin-campo">
                  <label className="etiqueta" htmlFor="a-estado">Estado</label>
                  <select id="a-estado" className="campo" value={formData.estado}
                    onChange={(e) => setFormData({ ...formData, estado: e.target.value })}>
                    {ESTADOS_PROPIEDAD.map((s) => <option key={s}>{s}</option>)}
                  </select>
                </div>
              </div>

              <div className="admin-fila">
                <div className="admin-campo">
                  <label className="etiqueta" htmlFor="a-barrio">Barrio</label>
                  <select id="a-barrio" required className="campo" value={formData.id_barrio}
                    onChange={(e) => setFormData({ ...formData, id_barrio: e.target.value, latitud: null, longitud: null })}>
                    <option value="">Elegí un barrio…</option>
                    {gruposBarrios.map((g) => (
                      <optgroup key={g.label} label={g.label}>
                        {g.barrios.map((b) => <option key={b.id} value={b.id}>{b.nombre}</option>)}
                      </optgroup>
                    ))}
                  </select>
                </div>
                <div className="admin-campo">
                  <label className="etiqueta" htmlFor="a-tipo">Tipo de inmueble</label>
                  <select id="a-tipo" required className="campo" value={formData.id_tipo}
                    onChange={(e) => setFormData({ ...formData, id_tipo: e.target.value })}>
                    <option value="">Elegí un tipo…</option>
                    {tipos.map((t) => <option key={t.id_tipo} value={t.id_tipo}>{t.nombre}</option>)}
                  </select>
                </div>
              </div>

              <div className="admin-fila">
                <div className="admin-campo">
                  <label className="etiqueta" htmlFor="a-precio">Precio</label>
                  <input id="a-precio" required type="number" inputMode="numeric" className="campo"
                    value={formData.precio}
                    onChange={(e) => setFormData({ ...formData, precio: e.target.value })}
                    placeholder="0" />
                </div>
                <div className="admin-campo">
                  <label className="etiqueta" htmlFor="a-moneda">Moneda</label>
                  <select id="a-moneda" className="campo" value={formData.moneda}
                    onChange={(e) => setFormData({ ...formData, moneda: e.target.value })}>
                    <option>USD</option><option>ARS</option>
                  </select>
                </div>
              </div>
            </fieldset>

            <fieldset className="admin-grupo">
              <legend>Detalle</legend>
              <div className="admin-campo">
                <label className="etiqueta" htmlFor="a-desc">Descripción</label>
                <textarea id="a-desc" required className="campo" value={formData.descripcion}
                  onChange={(e) => setFormData({ ...formData, descripcion: e.target.value })}
                  style={{ height: 150, resize: 'vertical' }}
                  placeholder="Contá lo que hace especial a esta propiedad…" />
              </div>

              <div className="admin-fila admin-fila-3">
                <div className="admin-campo">
                  <label className="etiqueta" htmlFor="a-dorm">Dormitorios</label>
                  <input id="a-dorm" type="number" inputMode="numeric" className="campo"
                    value={formData.dormitorios}
                    onChange={(e) => setFormData({ ...formData, dormitorios: e.target.value })} placeholder="0" />
                </div>
                <div className="admin-campo">
                  <label className="etiqueta" htmlFor="a-banos">Baños</label>
                  <input id="a-banos" type="number" inputMode="numeric" className="campo"
                    value={formData.banos}
                    onChange={(e) => setFormData({ ...formData, banos: e.target.value })} placeholder="0" />
                </div>
                <div className="admin-campo">
                  <label className="etiqueta" htmlFor="a-m2">Metros²</label>
                  <input id="a-m2" type="number" inputMode="numeric" className="campo"
                    value={formData.superficie_m2}
                    onChange={(e) => setFormData({ ...formData, superficie_m2: e.target.value })} placeholder="0" />
                </div>
              </div>
            </fieldset>

            <fieldset className="admin-grupo">
              <legend>Ubicación</legend>
              <div className="admin-campo">
                <label className="etiqueta" htmlFor="a-dir">Dirección</label>
                <div className="admin-dir">
                  <input id="a-dir" className="campo" value={formData.direccion}
                    onChange={(e) => setFormData({ ...formData, direccion: e.target.value, latitud: null, longitud: null })}
                    placeholder="Ej: Av. Uruguay 4500" />
                  <button type="button" onClick={ubicarEnMapa} disabled={ubicando} className="admin-btn-ubicar">
                    {ubicando ? 'Buscando…' : 'Ubicar'}
                  </button>
                </div>

                {formData.latitud != null && (
                  <p className="admin-pista admin-pista-ok">
                    Ubicada en el mapa
                    {ubicacionHallada?.precision === 'barrio' && ' — a nivel de barrio, no se encontró la calle exacta'}
                    {ubicacionHallada?.etiqueta && `: ${ubicacionHallada.etiqueta.slice(0, 70)}`}
                  </p>
                )}
                {ubicacionHallada?.encontrada === false && (
                  <p className="admin-pista admin-pista-aviso">
                    No pudimos ubicar esa dirección. La propiedad se guarda igual, pero no va a
                    aparecer en el mapa. Probá con una calle o barrio más conocido.
                  </p>
                )}
                <p className="admin-pista">
                  Si no la ubicás a mano, la buscamos automáticamente al guardar.
                </p>
              </div>
            </fieldset>

            <fieldset className="admin-grupo">
              <legend>Fotos</legend>
              <input type="file" multiple accept="image/*" className="campo admin-file" onChange={handleFileChange} />
              <p className="admin-pista">
                Podés seleccionar varias a la vez. Máximo 10 MB por foto (JPG, PNG, WebP o AVIF).
                {editandoId && ` Esta propiedad tiene ${formData.imagenesActuales.length} foto(s). Si no elegís nuevas, se conservan.`}
              </p>
            </fieldset>

            <fieldset className="admin-grupo">
              <legend>Visibilidad</legend>
              <div className="admin-fila">
                <label className="admin-toggle">
                  <input type="checkbox" checked={Boolean(formData.publicado)}
                    onChange={(e) => setFormData({ ...formData, publicado: e.target.checked })} />
                  <span>
                    <strong>Publicada</strong>
                    Visible en el catálogo público
                  </span>
                </label>
                <label className="admin-toggle">
                  <input type="checkbox" checked={Boolean(formData.destacado)}
                    onChange={(e) => setFormData({ ...formData, destacado: e.target.checked })} />
                  <span>
                    <strong>Destacada</strong>
                    Aparece en la portada
                  </span>
                </label>
              </div>

              <div className="admin-campo" style={{ marginTop: 16 }}>
                <label className="etiqueta" htmlFor="a-agente">Agente responsable</label>
                <select id="a-agente" required className="campo" value={formData.id_agente}
                  onChange={(e) => setFormData({ ...formData, id_agente: e.target.value })}>
                  <option value="">Elegí un agente…</option>
                  {agentes.map((a) => (
                    <option key={a.id} value={a.id}>
                      {a.nombre}{a.matricula ? ` — mat. ${a.matricula}` : ''}
                    </option>
                  ))}
                </select>
                <p className="admin-pista">
                  RN-04: toda propiedad tiene un único agente responsable.
                </p>
              </div>
            </fieldset>

            <button type="submit" disabled={cargando} className="btn btn-primario btn-bloque admin-guardar">
              {cargando ? 'Guardando…' : editandoId ? 'Guardar cambios' : 'Publicar propiedad'}
            </button>
          </form>
        ) : (
          /* ================= LISTADO ================= */
          <section className="admin-listado">
            {propiedades.length === 0 ? (
              <div className="vacio">
                <p className="bajada" style={{ margin: '0 auto 20px' }}>
                  Todavía no cargaste ninguna propiedad.
                </p>
                <button type="button" onClick={nuevaPropiedad} className="btn btn-primario">
                  Cargar la primera
                </button>
              </div>
            ) : (
              propiedades.map((p) => {
                const publicada = p.publicado ?? true
                const estado = p.estado
                return (
                  <article key={p.id} className={`admin-panel admin-item ${publicada ? '' : 'borrador'}`}>
                    <div className="admin-item-foto">
                      <Image
                        src={imagenPrincipal(p)} alt={p.titulo}
                        width={110} height={110}
                        unoptimized={imagenPrincipal(p).startsWith('data:')}
                        style={{ width: 110, height: 110, objectFit: 'cover', borderRadius: 'var(--r-md)' }}
                      />
                    </div>

                    <div className="admin-item-info">
                      <h2 className="admin-item-titulo">{p.titulo}</h2>
                      <p className="admin-item-meta">
                        {formatPrecio(p)} · {p.barrio}
                        {p.latitud == null && <span className="admin-item-sinmapa"> · sin ubicación</span>}
                      </p>
                      <div className="admin-item-insignias">
                        <span className={`insignia ${estado === 'Disponible' ? 'insignia-venta' : estado === 'Reservada' ? 'insignia-reservada' : 'insignia-vendida'}`}>
                          {estado}
                        </span>
                        {!publicada && <span className="insignia insignia-borrador">Borrador</span>}
                        {p.destacado && <span className="insignia insignia-destacada">★ Portada</span>}
                      </div>
                    </div>

                    <div className="admin-item-acciones">
                      <select aria-label={`Estado de ${p.titulo}`} className="campo admin-select-mini"
                        value={estado || 'Disponible'}
                        onChange={(e) => cambiarEstadoRapido(p.id, e.target.value)}>
                        {ESTADOS_PROPIEDAD.map((s) => <option key={s}>{s}</option>)}
                      </select>
                      <button type="button" onClick={() => togglePublicado(p)} className="admin-accion">
                        {publicada ? 'Despublicar' : 'Publicar'}
                      </button>
                      <button type="button" onClick={() => prepararEdicion(p)} className="admin-accion admin-accion-principal">
                        Editar
                      </button>
                      <button type="button" onClick={() => setABorrar(p)} className="admin-accion admin-accion-peligro">
                        Borrar
                      </button>
                    </div>
                  </article>
                )
              })
            )}
          </section>
        )}
      </main>

      {/* ================= MODAL DE BORRADO ================= */}
      {aBorrar && (
        <div className="admin-modal-velo" onClick={() => setABorrar(null)}>
          <div className="admin-modal" role="dialog" aria-modal="true" aria-labelledby="modal-titulo"
            onClick={(e) => e.stopPropagation()}>
            <h2 id="modal-titulo" className="admin-modal-titulo">¿Borrar esta propiedad?</h2>
            <p className="admin-modal-texto">
              Vas a eliminar <strong>{aBorrar.titulo}</strong> de forma permanente.
              Esta acción no se puede deshacer.
            </p>
            <div className="admin-modal-acciones">
              <button type="button" onClick={() => setABorrar(null)} className="btn btn-secundario">
                Cancelar
              </button>
              <button type="button" onClick={confirmarBorrado} className="btn admin-btn-borrar">
                Sí, borrar
              </button>
            </div>
          </div>
        </div>
      )}

      <style>{`
        .admin { min-height: 100vh; background: var(--arena-100); }

        /* ---------- BARRA ---------- */
        .admin-barra {
          position: sticky; top: 0; z-index: 100;
          background: var(--selva-900);
          border-bottom: 1px solid rgba(255,255,255,0.08);
        }
        .admin-barra-inner {
          max-width: 1180px; margin-inline: auto;
          padding: 14px clamp(18px, 4vw, 36px);
          display: flex; align-items: center; justify-content: space-between; gap: 16px;
        }
        .admin-marca { display: flex; align-items: center; gap: 12px; text-decoration: none; }
        .admin-marca-logo {
          display: grid; place-items: center;
          width: 42px; height: 42px; border-radius: 13px;
          background: var(--tierra-600); color: #fff;
          font-family: var(--fuente-titulo); font-weight: 600; font-size: 1.05rem;
        }
        .admin-marca-texto { display: flex; flex-direction: column; line-height: 1.2; }
        .admin-marca-texto strong {
          font-family: var(--fuente-titulo); font-size: 1.05rem;
          font-weight: 600; color: #fff;
        }
        .admin-marca-texto span {
          font-size: 0.63rem; letter-spacing: 0.12em; text-transform: uppercase;
          color: rgba(255,255,255,0.5);
        }
        .admin-barra-acciones { display: flex; align-items: center; gap: 9px; }
        .admin-btn-fantasma, .admin-btn-salir {
          padding: 9px 17px; border-radius: var(--r-full);
          font-size: 0.87rem; font-weight: 600; text-decoration: none;
          border: 1px solid rgba(255,255,255,0.2);
          background: rgba(255,255,255,0.06); color: rgba(255,255,255,0.9);
          transition: background-color .18s;
        }
        .admin-btn-fantasma:hover { background: rgba(255,255,255,0.14); }
        .admin-btn-salir { border-color: rgba(255,255,255,0.14); color: #F3B0A0; }
        .admin-btn-salir:hover { background: rgba(255,255,255,0.1); }

        /* ---------- CUERPO ---------- */
        .admin-cuerpo {
          max-width: 1180px; margin-inline: auto;
          padding: clamp(24px, 4vw, 42px) clamp(18px, 4vw, 36px) 80px;
        }

        .admin-panel {
          background: var(--superficie);
          border: 1px solid var(--borde-suave);
          border-radius: var(--r-lg);
          box-shadow: var(--sombra-sm);
        }

        /* ---------- MÉTRICAS ---------- */
        .admin-metricas {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
          gap: 14px;
          margin-bottom: 26px;
        }
        .admin-metrica {
          background: var(--superficie);
          border: 1px solid var(--borde-suave);
          border-radius: var(--r-md);
          padding: 18px 20px;
        }
        .admin-metrica-valor {
          display: block;
          font-family: var(--fuente-titulo);
          font-size: 2rem; font-weight: 600;
          color: var(--tierra-600); line-height: 1;
        }
        .admin-metrica-etiqueta {
          display: block; margin-top: 6px;
          font-size: 0.75rem; font-weight: 600;
          letter-spacing: 0.1em; text-transform: uppercase;
          color: var(--tinta-400);
        }

        /* ---------- PESTAÑAS ---------- */
        .admin-pestanas {
          display: flex; gap: 5px;
          padding: 5px;
          background: var(--arena-200);
          border-radius: var(--r-full);
          margin-bottom: 22px;
        }
        .admin-pestanas button {
          flex: 1;
          padding: 12px 18px;
          border: none; background: transparent;
          border-radius: var(--r-full);
          font-size: 0.92rem; font-weight: 600;
          color: var(--tinta-500);
          transition: background-color .18s, color .18s, box-shadow .18s;
        }
        .admin-pestanas button.activa {
          background: var(--superficie);
          color: var(--tierra-600);
          box-shadow: var(--sombra-sm);
        }

        .admin-aviso { margin-bottom: 20px; }
        .admin-aviso-atencion { background: var(--aviso-bg); color: var(--aviso-fg); }

        /* ---------- FORMULARIO ---------- */
        .admin-form {
          padding: clamp(22px, 3.5vw, 38px);
          display: grid; gap: 26px;
        }
        .admin-form-cabecera {
          display: flex; align-items: center; justify-content: space-between;
          flex-wrap: wrap; gap: 12px;
        }
        .admin-form-cabecera h1 { font-size: clamp(1.4rem, 3vw, 1.8rem); }
        .admin-enlace {
          border: none; background: none;
          color: var(--tierra-600); font-size: 0.87rem; font-weight: 600;
          text-decoration: underline; text-underline-offset: 3px;
        }

        .admin-grupo { border: none; padding: 0; margin: 0; display: grid; gap: 14px; }
        .admin-grupo legend {
          padding: 0 0 12px;
          font-size: 0.72rem; font-weight: 700;
          letter-spacing: 0.14em; text-transform: uppercase;
          color: var(--tierra-600);
          border-bottom: 1px solid var(--borde-suave);
          width: 100%; margin-bottom: 4px;
        }
        .admin-fila { display: grid; grid-template-columns: 1fr 1fr; gap: 14px; }
        .admin-fila-3 { grid-template-columns: repeat(3, 1fr); }
        .admin-campo { display: grid; min-width: 0; }

        .admin-dir { display: flex; gap: 9px; }
        .admin-dir .campo { flex: 1; min-width: 0; }
        .admin-btn-ubicar {
          flex-shrink: 0;
          padding: 0 20px;
          border: 1px solid var(--borde);
          border-radius: var(--r-md);
          background: var(--arena-100);
          font-size: 0.88rem; font-weight: 600;
          color: var(--tinta-900);
          transition: background-color .18s;
        }
        .admin-btn-ubicar:hover:not(:disabled) { background: var(--arena-200); }
        .admin-btn-ubicar:disabled { opacity: 0.6; cursor: default; }

        .admin-pista { font-size: 0.79rem; color: var(--tinta-400); margin-top: 8px; line-height: 1.55; }
        .admin-pista-ok { color: var(--exito-fg); font-weight: 500; }
        .admin-pista-aviso { color: var(--aviso-fg); font-weight: 500; }

        .admin-file { padding: 12px; background: var(--arena-50); }

        .admin-toggle {
          display: flex; align-items: flex-start; gap: 12px;
          padding: 16px 18px;
          border: 1px solid var(--borde);
          border-radius: var(--r-md);
          background: var(--arena-50);
          cursor: pointer;
          transition: border-color .18s, background-color .18s;
        }
        .admin-toggle:has(input:checked) {
          border-color: var(--tierra-400);
          background: var(--tierra-50);
        }
        .admin-toggle input {
          width: 19px; height: 19px; margin: 2px 0 0;
          accent-color: var(--tierra-600);
          flex-shrink: 0;
        }
        .admin-toggle strong {
          display: block; font-size: 0.93rem; font-weight: 600;
          color: var(--tinta-900); margin-bottom: 2px;
        }
        .admin-toggle span { font-size: 0.8rem; color: var(--tinta-500); line-height: 1.45; }

        .admin-guardar { margin-top: 4px; }

        /* ---------- LISTADO ---------- */
        .admin-listado { display: grid; gap: 14px; }
        .admin-item {
          display: grid;
          grid-template-columns: auto minmax(0, 1fr) auto;
          gap: 20px;
          align-items: center;
          padding: 18px 20px;
        }
        .admin-item.borrador { background: var(--arena-50); border-style: dashed; }
        .admin-item-foto { flex-shrink: 0; line-height: 0; }
        .admin-item-info { min-width: 0; display: grid; gap: 7px; }
        .admin-item-titulo { font-size: 1.15rem; }
        .admin-item-meta { font-size: 0.88rem; color: var(--tinta-500); }
        .admin-item-sinmapa { color: var(--aviso-fg); }
        .admin-item-insignias { display: flex; flex-wrap: wrap; gap: 6px; }

        .admin-item-acciones {
          display: flex; align-items: center; gap: 8px; flex-wrap: wrap;
          justify-content: flex-end;
        }
        .admin-select-mini {
          width: auto; min-width: 128px;
          padding: 9px 34px 9px 13px;
          font-size: 0.85rem; font-weight: 600;
          background-position: right 12px center;
        }
        .admin-accion {
          padding: 10px 17px;
          border: 1px solid var(--borde);
          border-radius: var(--r-full);
          background: var(--superficie);
          font-size: 0.85rem; font-weight: 600;
          color: var(--tinta-700);
          transition: background-color .18s, border-color .18s, color .18s;
        }
        .admin-accion:hover { background: var(--arena-100); border-color: var(--tinta-400); }
        .admin-accion-principal {
          background: var(--tierra-600); border-color: var(--tierra-600); color: #fff;
        }
        .admin-accion-principal:hover { background: var(--tierra-700); border-color: var(--tierra-700); }
        .admin-accion-peligro { color: var(--error-fg); border-color: var(--error-bg); }
        .admin-accion-peligro:hover { background: var(--error-bg); border-color: var(--error-fg); }

        /* ---------- MODAL ---------- */
        .admin-modal-velo {
          position: fixed; inset: 0; z-index: 2000;
          background: rgba(10, 33, 25, 0.55);
          backdrop-filter: blur(4px);
          display: grid; place-items: center;
          padding: 20px;
          animation: aparecer .2s ease;
        }
        @keyframes aparecer { from { opacity: 0 } to { opacity: 1 } }
        .admin-modal {
          width: 100%; max-width: 420px;
          background: var(--superficie);
          border-radius: var(--r-lg);
          padding: clamp(24px, 4vw, 32px);
          box-shadow: var(--sombra-xl);
        }
        .admin-modal-titulo { font-size: 1.35rem; margin-bottom: 10px; }
        .admin-modal-texto { color: var(--tinta-500); font-size: 0.95rem; line-height: 1.6; }
        .admin-modal-texto strong { color: var(--tinta-900); }
        .admin-modal-acciones {
          display: flex; gap: 10px; justify-content: flex-end;
          margin-top: 26px; flex-wrap: wrap;
        }
        .admin-btn-borrar { background: var(--error-fg); color: #fff; }
        .admin-btn-borrar:hover { background: var(--tierra-900); }

        /* ---------- RESPONSIVE ---------- */
        @media (max-width: 780px) {
          .admin-fila, .admin-fila-3 { grid-template-columns: 1fr; }
          .admin-item { grid-template-columns: auto minmax(0, 1fr); }
          .admin-item-acciones { grid-column: 1 / -1; justify-content: flex-start; }
        }
        @media (max-width: 480px) {
          .admin-marca-texto { display: none; }
          .admin-item { grid-template-columns: 1fr; }
          .admin-item-acciones > * { flex: 1 1 auto; }
        }
      `}</style>
    </div>
  )
}
