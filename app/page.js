'use client'
import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'
import Link from 'next/link'
import { useRouter } from 'next/navigation'

export default function Home() {
  const router = useRouter()
  const [propiedades, setPropiedades] = useState([])
  const [sesion, setSesion] = useState(null)
  const [formContacto, setFormContacto] = useState({ nombre: '', email: '', mensaje: '' })
  const [favoritos, setFavoritos] = useState([])
  const [menuAbierto, setMenuAbierto] = useState(false)

  useEffect(() => {
    const fetchHomeProps = async () => {
      const { data } = await supabase
        .from('propiedades')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(3)
      if (data) setPropiedades(data)
    }
    fetchHomeProps()

    supabase.auth.getSession().then(({ data: { session } }) => setSesion(session))
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => setSesion(session))
    return () => subscription.unsubscribe()
  }, [])

  // Cerrar menú al hacer tap afuera
  useEffect(() => {
    if (!menuAbierto) return
    const handler = () => setMenuAbierto(false)
    document.addEventListener('click', handler)
    return () => document.removeEventListener('click', handler)
  }, [menuAbierto])

  const scrollToSection = (id) => {
    setMenuAbierto(false)
    const element = document.getElementById(id)
    if (element) element.scrollIntoView({ behavior: 'smooth' })
  }

  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.refresh()
  }

  const enviarFormulario = (e) => {
    e.preventDefault()
    const texto = `Hola RN Inmobiliaria. Soy ${formContacto.nombre}.\nMi Email: ${formContacto.email}\n\nMensaje: ${formContacto.mensaje}`
    window.open(`https://wa.me/5493765067519?text=${encodeURIComponent(texto)}`, '_blank')
    setFormContacto({ nombre: '', email: '', mensaje: '' })
  }

  return (
    <main style={{ minHeight: '100vh', backgroundColor: '#ffffff', fontFamily: 'system-ui, sans-serif' }}>

      <style>{`
        /* ── Reset mobile ── */
        *, *::before, *::after { box-sizing: border-box; }
        input, textarea, select { font-size: 16px !important; } /* Evita zoom en iOS */

        /* ── Navbar ── */
        .nav-links a, .nav-links button {
          color: #64748b; font-weight: 700; font-size: 0.9rem;
          text-decoration: none; padding: 10px 14px; border-radius: 10px;
          display: block; white-space: nowrap;
          min-height: 44px; display: flex; align-items: center;
        }
        .nav-links a:active { background: #f1f5f9; }

        /* ── Menú móvil ── */
        .mobile-menu {
          display: none;
          position: absolute; top: 80px; left: 0; right: 0;
          background: white; border-bottom: 1px solid #f1f5f9;
          padding: 12px 5%; flex-direction: column; gap: 4px;
          box-shadow: 0 8px 24px rgba(0,0,0,0.08);
          z-index: 99;
        }
        .mobile-menu.open { display: flex; }
        .mobile-menu a, .mobile-menu button {
          color: #020617; font-weight: 700; font-size: 1rem;
          text-decoration: none; padding: 14px 16px; border-radius: 12px;
          min-height: 48px; display: flex; align-items: center;
          border: none; background: none; cursor: pointer; width: 100%;
          -webkit-tap-highlight-color: transparent;
        }
        .mobile-menu a:active, .mobile-menu button:active { background: #f8fafc; }

        /* ── Botón hamburguesa ── */
        .hamburger {
          display: none; flex-direction: column; justify-content: center;
          align-items: center; gap: 5px;
          width: 44px; height: 44px; border: none; background: none;
          cursor: pointer; padding: 8px; border-radius: 10px;
          -webkit-tap-highlight-color: transparent;
        }
        .hamburger span {
          display: block; width: 22px; height: 2px;
          background: #020617; border-radius: 2px;
          transition: transform 0.25s, opacity 0.25s;
        }
        .hamburger.open span:nth-child(1) { transform: translateY(7px) rotate(45deg); }
        .hamburger.open span:nth-child(2) { opacity: 0; }
        .hamburger.open span:nth-child(3) { transform: translateY(-7px) rotate(-45deg); }

        /* Desktop: mostrar links en línea, ocultar hamburguesa */
        @media (min-width: 768px) {
          .hamburger { display: none !important; }
          .desktop-links { display: flex !important; }
        }
        /* Móvil: ocultar links de desktop, mostrar hamburguesa */
        @media (max-width: 767px) {
          .hamburger { display: flex !important; }
          .desktop-links { display: none !important; }
          .hide-mobile { display: none !important; }
        }

        /* ── Hero ── */
        .hero-section {
          padding: 80px 6% 80px;
        }
        .hero-title {
          font-size: clamp(2.4rem, 8vw, 5rem);
          font-weight: 900; color: white;
          line-height: 1.05; letter-spacing: -2px; margin: 0;
        }
        .hero-buttons {
          display: flex; gap: 12px; margin-top: 40px;
          justify-content: center; flex-wrap: wrap;
        }
        .hero-btn-primary {
          text-decoration: none; background: #4F46E5; color: white;
          padding: 16px 32px; border-radius: 16px;
          font-weight: 800; font-size: 1rem;
          min-height: 52px; display: flex; align-items: center;
          -webkit-tap-highlight-color: transparent;
        }
        .hero-btn-primary:active { opacity: 0.85; transform: scale(0.97); }
        .hero-btn-secondary {
          background: transparent; color: white;
          border: 1px solid #334155; padding: 16px 32px;
          border-radius: 16px; font-weight: 800; font-size: 1rem;
          cursor: pointer; min-height: 52px;
          -webkit-tap-highlight-color: transparent;
        }
        .hero-btn-secondary:active { background: rgba(255,255,255,0.08); }

        /* ── Cards propiedades ── */
        .props-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(min(100%, 360px), 1fr));
          gap: 28px;
        }
        .prop-card {
          background: white; border-radius: 28px; overflow: hidden;
          box-shadow: 0 10px 30px rgba(0,0,0,0.06);
          border: 1px solid #f1f5f9;
          -webkit-tap-highlight-color: transparent;
          transition: transform 0.2s, box-shadow 0.2s;
        }
        .prop-card:active { transform: scale(0.98); }
        @media (hover: hover) {
          .prop-card:hover { transform: translateY(-4px); box-shadow: 0 20px 40px rgba(0,0,0,0.1); }
        }
        .prop-img-wrap { height: 240px; position: relative; overflow: hidden; }
        @media (min-width: 768px) { .prop-img-wrap { height: 300px; } }
        .prop-img { width: 100%; height: 100%; object-fit: cover; }
        .prop-body { padding: 24px; }
        @media (min-width: 768px) { .prop-body { padding: 32px; } }

        /* ── Sección servicios ── */
        .services-grid {
          display: grid;
          grid-template-columns: 1fr;
          gap: 20px; max-width: 1200px; margin: 0 auto;
        }
        @media (min-width: 640px) { .services-grid { grid-template-columns: repeat(2, 1fr); } }
        @media (min-width: 1024px) { .services-grid { grid-template-columns: repeat(3, 1fr); } }
        .service-card {
          background: white; padding: 32px; border-radius: 28px;
          border: 1px solid #e2e8f0; box-shadow: 0 10px 30px rgba(0,0,0,0.03);
        }

        /* ── Historia ── */
        .historia-wrap {
          display: flex; gap: 60px; flex-wrap: wrap; align-items: center;
        }
        .historia-text, .historia-cards { flex: 1; min-width: min(100%, 320px); }

        /* ── Contacto ── */
        .contacto-wrap {
          display: flex; gap: 50px; flex-wrap: wrap; align-items: flex-start;
        }
        .contacto-info, .contacto-form { flex: 1; min-width: min(100%, 320px); }
        .form-input {
          width: 100%; padding: 16px; border-radius: 14px;
          border: 1px solid #cbd5e1; outline: none;
          font-weight: 600; font-size: 1rem; color: #020617;
          background: white; transition: border-color 0.2s, box-shadow 0.2s;
          -webkit-appearance: none; appearance: none;
        }
        .form-input:focus {
          border-color: #4F46E5;
          box-shadow: 0 0 0 3px rgba(79,70,229,0.12);
        }
        .form-label {
          display: block; font-size: 0.8rem; font-weight: 800;
          color: #64748b; margin-bottom: 8px;
        }

        /* ── Sección padding adaptable ── */
        .section-pad { padding: 70px 6%; }
        @media (min-width: 768px) { .section-pad { padding: 100px 8%; } }

        /* ── Footer ── */
        .footer-pad { padding: 70px 6%; }
        @media (min-width: 768px) { .footer-pad { padding: 100px 8%; } }

        /* ── Títulos de sección ── */
        .section-title {
          font-size: clamp(1.8rem, 5vw, 3rem);
          font-weight: 900; color: #020617;
          letter-spacing: -1.5px; margin: 0;
        }
        .section-subtitle { color: #64748b; font-size: 1.05rem; font-weight: 500; margin-top: 10px; }
      `}</style>

      {/* ══════════════════════════════════════
          HERO
      ══════════════════════════════════════ */}
      <section className="hero-section" style={{ backgroundColor: '#020617', position: 'relative', overflow: 'hidden', textAlign: 'center' }}>
        {/* Glow de fondo */}
        <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', width: '500px', height: '500px', backgroundColor: 'rgba(180,83,9,0.15)', filter: 'blur(130px)', borderRadius: '100%', pointerEvents: 'none' }} />

        <div style={{ position: 'relative', zIndex: 2, maxWidth: '800px', margin: '0 auto' }}>
          <h1 className="hero-title">
            Tu futuro hogar en la{' '}
            <br className="hide-mobile" />
            <span style={{ color: '#F59E0B' }}>tierra roja.</span>
          </h1>
          <p style={{ color: '#94a3b8', fontSize: 'clamp(1rem, 2.5vw, 1.2rem)', marginTop: '24px', lineHeight: 1.6, fontWeight: '500', maxWidth: '600px', margin: '24px auto 0' }}>
            Mucho más que una inmobiliaria: somos el sistema que te ayuda a encontrar o vender tu propiedad en Misiones con seguridad total.
          </p>
          <div className="hero-buttons">
            <Link href="/propiedades" className="hero-btn-primary">Buscar Propiedades</Link>
            <button className="hero-btn-secondary" onClick={() => scrollToSection('contacto')}>Escribinos</button>
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════
          PROPIEDADES DESTACADAS
      ══════════════════════════════════════ */}
      <section className="section-pad" style={{ maxWidth: '1450px', margin: '0 auto' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '40px', flexWrap: 'wrap', gap: '16px' }}>
          <div>
            <h2 className="section-title">Propiedades Destacadas</h2>
            <p className="section-subtitle">Últimas oportunidades ingresadas a nuestro catálogo.</p>
          </div>
          <Link href="/propiedades" style={{ textDecoration: 'none', color: '#4F46E5', fontWeight: '800', fontSize: '1rem', display: 'flex', alignItems: 'center', gap: '4px', whiteSpace: 'nowrap', minHeight: '44px', alignSelf: 'center' }}>
            Ver todas <span>→</span>
          </Link>
        </div>

        <div className="props-grid">
          {propiedades.map(p => (
            <Link href={`/propiedad/${p.id}`} key={p.id} style={{ textDecoration: 'none', color: 'inherit' }}>
              <div className="prop-card">
                <div className="prop-img-wrap">
                  {/* Badge tipo */}
                  <div style={{ position: 'absolute', top: '16px', left: '16px', backgroundColor: '#22c55e', color: 'white', padding: '6px 14px', borderRadius: '10px', fontSize: '0.72rem', fontWeight: '900', zIndex: 10 }}>VENTA</div>
                  {/* Badge estado */}
                  {p.estado_interno !== 'Disponible' && (
                    <div style={{ position: 'absolute', top: '16px', right: '16px', backgroundColor: '#ef4444', color: 'white', padding: '6px 14px', borderRadius: '10px', fontSize: '0.72rem', fontWeight: '900', zIndex: 10 }}>{p.estado_interno?.toUpperCase()}</div>
                  )}
                  {/* Precio */}
                  <div style={{ position: 'absolute', bottom: '16px', left: '16px', backgroundColor: 'white', padding: '10px 18px', borderRadius: '16px', fontWeight: '900', fontSize: 'clamp(1.1rem, 3vw, 1.5rem)', color: '#020617', boxShadow: '0 8px 20px rgba(0,0,0,0.15)', zIndex: 10 }}>
                    {p.moneda} {Number(p.precio).toLocaleString('es-AR')}
                  </div>
                  <img src={p.imagenes?.[0]} alt={p.titulo} className="prop-img" loading="lazy" />
                </div>
                <div className="prop-body">
                  <span style={{ color: '#F59E0B', fontWeight: '900', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '1.5px' }}>📍 {p.zona}</span>
                  <h3 style={{ fontSize: 'clamp(1.2rem, 3vw, 1.6rem)', fontWeight: '900', color: '#020617', margin: '12px 0 20px', lineHeight: 1.2 }}>{p.titulo}</h3>
                  <div style={{ display: 'flex', gap: '20px', borderTop: '1px solid #f1f5f9', paddingTop: '20px', color: '#64748b', fontWeight: '700', fontSize: '1rem' }}>
                    <span>🛏️ {p.habitaciones} Dorm.</span>
                    <span>🚿 {p.banos} Baños</span>
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* ══════════════════════════════════════
          SERVICIOS
      ══════════════════════════════════════ */}
      <section id="servicios" className="section-pad" style={{ backgroundColor: '#f8fafc' }}>
        <div style={{ textAlign: 'center', marginBottom: '50px' }}>
          <span style={{ color: '#4F46E5', fontWeight: '900', fontSize: '0.85rem', letterSpacing: '2px', textTransform: 'uppercase' }}>Qué hacemos</span>
          <h2 className="section-title" style={{ marginTop: '10px' }}>Gestión Integral Inmobiliaria</h2>
        </div>

        <div className="services-grid">
          {[
            { title: 'Venta de Propiedades', icon: '🏡', color: '#3B82F6', items: ['Catálogo digital', 'Difusión en redes', 'Asesoramiento legal', 'Cierre de operaciones'] },
            { title: 'Administración de Alquileres', icon: '📝', color: '#10B981', items: ['Redacción de contratos', 'Cobro mensual', 'Ajustes automáticos (ICL/IPC)', 'Resolución de conflictos'] },
            { title: 'Tasaciones Profesionales', icon: '⚖️', color: '#F59E0B', items: ['Análisis de mercado local', 'Visita presencial', 'Entrega de informe', 'Precio real garantizado'] }
          ].map((srv, i) => (
            <div key={i} className="service-card">
              <div style={{ width: '58px', height: '58px', backgroundColor: `${srv.color}20`, color: srv.color, borderRadius: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.6rem', marginBottom: '20px' }}>{srv.icon}</div>
              <h4 style={{ fontWeight: '900', fontSize: '1.3rem', color: '#020617', marginBottom: '16px' }}>{srv.title}</h4>
              <ul style={{ listStyle: 'none', padding: 0, margin: 0, color: '#64748b', fontSize: '0.95rem', lineHeight: 2, fontWeight: '500' }}>
                {srv.items.map((item, idx) => (
                  <li key={idx} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span style={{ color: srv.color }}>✔</span> {item}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </section>

      {/* ══════════════════════════════════════
          HISTORIA
      ══════════════════════════════════════ */}
      <section className="section-pad" style={{ maxWidth: '1400px', margin: '0 auto' }}>
        <div className="historia-wrap">
          <div className="historia-text">
            <span style={{ color: '#F59E0B', fontWeight: '900', fontSize: '0.85rem', letterSpacing: '2px', textTransform: 'uppercase' }}>Nuestra Historia</span>
            <h2 className="section-title" style={{ margin: '15px 0 28px', lineHeight: 1.1 }}>Construimos relaciones, no solo ventas.</h2>
            <p style={{ color: '#475569', fontSize: '1.05rem', lineHeight: 1.8, marginBottom: '16px' }}>
              RN Inmobiliaria nació con la visión de profesionalizar el sector inmobiliario en Misiones. Vimos que faltaba un lugar donde la tecnología y el trato humano fueran de la mano.
            </p>
            <p style={{ color: '#475569', fontSize: '1.05rem', lineHeight: 1.8 }}>
              Hoy, ayudamos a cientos de familias y empresas a encontrar su lugar ideal, cuidando su patrimonio con total transparencia y rapidez.
            </p>
          </div>

          <div className="historia-cards" style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            {[
              { icon: '🎯', title: 'Nuestra Misión', text: 'Brindar soluciones inmobiliarias ágiles y seguras, protegiendo los intereses de nuestros clientes en cada paso del proceso.' },
              { icon: '👁️', title: 'Nuestra Visión', text: 'Ser la inmobiliaria referente de Misiones, destacándonos por la innovación tecnológica y la calidad humana.' },
            ].map((item, i) => (
              <div key={i} style={{ padding: '28px', borderRadius: '28px', border: '1px solid #e2e8f0', boxShadow: '0 10px 30px rgba(0,0,0,0.03)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
                  <span style={{ fontSize: '1.8rem' }}>{item.icon}</span>
                  <h3 style={{ fontSize: '1.3rem', fontWeight: '900', color: '#020617', margin: 0 }}>{item.title}</h3>
                </div>
                <p style={{ color: '#64748b', lineHeight: 1.6, margin: 0 }}>{item.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════
          CONTACTO
      ══════════════════════════════════════ */}
      <section id="contacto" className="section-pad" style={{ maxWidth: '1400px', margin: '0 auto' }}>
        <div className="contacto-wrap">
          {/* Info */}
          <div className="contacto-info">
            <span style={{ color: '#4F46E5', fontWeight: '900', fontSize: '0.85rem', letterSpacing: '2px', textTransform: 'uppercase', backgroundColor: '#EEF2FF', padding: '8px 16px', borderRadius: '12px' }}>Contacto</span>
            <h2 className="section-title" style={{ margin: '20px 0 24px', lineHeight: 1 }}>¿Listo para dar el siguiente paso?</h2>
            <p style={{ color: '#475569', fontSize: '1.1rem', lineHeight: 1.6, marginBottom: '36px' }}>
              Dejanos tus datos o escribinos directo por WhatsApp. Estamos listos para asesorarte sin compromiso.
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              {[
                { bg: '#F8FAFC', border: '#e2e8f0', color: 'inherit', icon: '📍', title: 'Oficina', desc: 'Posadas, Misiones (Con cita previa)' },
                { bg: '#DCFCE7', border: 'transparent', color: '#16A34A', icon: '💬', title: 'WhatsApp', desc: '+54 9 376 506-7519' },
              ].map((item, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                  <div style={{ width: '48px', height: '48px', minWidth: '48px', backgroundColor: item.bg, borderRadius: '14px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.4rem', border: `1px solid ${item.border}`, color: item.color }}>
                    {item.icon}
                  </div>
                  <div>
                    <p style={{ margin: 0, fontWeight: '900', color: '#020617', fontSize: '0.95rem' }}>{item.title}</p>
                    <p style={{ margin: 0, color: '#64748b', fontSize: '0.9rem' }}>{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Formulario */}
          <div className="contacto-form">
            <form onSubmit={enviarFormulario} style={{ backgroundColor: 'white', padding: 'clamp(24px, 5vw, 44px)', borderRadius: '28px', boxShadow: '0 20px 50px rgba(0,0,0,0.08)', border: '1px solid #e2e8f0', display: 'flex', flexDirection: 'column', gap: '18px' }}>
              <h3 style={{ fontSize: 'clamp(1.4rem, 4vw, 1.8rem)', fontWeight: '900', color: '#020617', margin: '0 0 4px' }}>Envianos un mensaje</h3>

              <div>
                <label className="form-label">Nombre completo *</label>
                <input
                  required className="form-input"
                  value={formContacto.nombre}
                  onChange={e => setFormContacto({ ...formContacto, nombre: e.target.value })}
                  type="text" placeholder="Juan Pérez"
                  autoComplete="name"
                />
              </div>
              <div>
                <label className="form-label">Email *</label>
                <input
                  required className="form-input"
                  value={formContacto.email}
                  onChange={e => setFormContacto({ ...formContacto, email: e.target.value })}
                  type="email" placeholder="juan@ejemplo.com"
                  autoComplete="email"
                  inputMode="email"
                />
              </div>
              <div>
                <label className="form-label">Mensaje *</label>
                <textarea
                  required className="form-input"
                  value={formContacto.mensaje}
                  onChange={e => setFormContacto({ ...formContacto, mensaje: e.target.value })}
                  placeholder="Me interesa tasar mi propiedad..."
                  style={{ height: '110px', resize: 'none' }}
                />
              </div>

              <button
                type="submit"
                style={{ backgroundColor: '#4F46E5', color: 'white', padding: '18px', borderRadius: '14px', fontWeight: '900', fontSize: '1rem', border: 'none', cursor: 'pointer', marginTop: '4px', boxShadow: '0 8px 20px rgba(79,70,229,0.3)', minHeight: '52px', transition: 'opacity 0.15s', touchAction: 'manipulation', WebkitTapHighlightColor: 'transparent' }}
                onTouchStart={e => e.currentTarget.style.opacity = '0.85'}
                onTouchEnd={e => e.currentTarget.style.opacity = '1'}
              >
                Enviar a WhatsApp 💬
              </button>
            </form>
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════
          FOOTER
      ══════════════════════════════════════ */}
      <footer className="footer-pad" style={{ backgroundColor: '#020617', color: 'white', textAlign: 'center' }}>
        <h2 style={{ fontSize: 'clamp(1.6rem, 5vw, 2.5rem)', fontWeight: '900', marginBottom: '20px', letterSpacing: '-1px' }}>RN INMOBILIARIA</h2>
        <p style={{ color: '#94a3b8', fontSize: 'clamp(1rem, 2.5vw, 1.2rem)', maxWidth: '520px', margin: '0 auto 44px', lineHeight: 1.8 }}>
          Tu futuro hogar en la tierra roja comienza con un asesoramiento de confianza.
        </p>

        {/* WhatsApp CTA */}
        <a
          href="https://wa.me/5493765067519"
          target="_blank" rel="noopener noreferrer"
          style={{ display: 'inline-flex', alignItems: 'center', gap: '10px', backgroundColor: '#25D366', color: 'white', padding: '16px 32px', borderRadius: '16px', fontWeight: '800', fontSize: '1rem', textDecoration: 'none', marginBottom: '44px', minHeight: '52px', WebkitTapHighlightColor: 'transparent' }}
        >
          💬 Escribinos por WhatsApp
        </a>

        <div style={{ borderTop: '1px solid rgba(255,255,255,0.05)', paddingTop: '40px', fontSize: '0.8rem', color: '#475569', fontWeight: '700', letterSpacing: '3px' }}>
          © 2026 POSADAS, MISIONES, ARGENTINA
        </div>
      </footer>
    </main>
  )
}