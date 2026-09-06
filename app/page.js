import Link from 'next/link'
import { supabaseServer } from '../lib/supabaseServer'
import { listarDestacadas } from '../lib/propiedades'
import { waLink } from '../lib/format'
import { OFICINA, WHATSAPP_PRINCIPAL } from '../lib/config'
import CardPropiedad from '../components/CardPropiedad'
import FormularioContacto from './formulario-contacto'
import BotonScroll from './boton-scroll'

// Server Component: las destacadas se traen en el servidor, así el HTML
// inicial ya las contiene y Google las ve.
export const revalidate = 60

const SERVICIOS = [
  {
    titulo: 'Venta de propiedades',
    icono: '🏡',
    texto: 'Publicamos, difundimos y acompañamos la operación hasta la escritura.',
    items: ['Catálogo digital', 'Difusión en redes', 'Asesoramiento legal', 'Cierre de operaciones'],
  },
  {
    titulo: 'Administración de alquileres',
    icono: '🔑',
    texto: 'Nos ocupamos del contrato, la cobranza y los ajustes. Vos cobrás.',
    items: ['Redacción de contratos', 'Cobro mensual', 'Ajustes ICL / IPC', 'Resolución de conflictos'],
  },
  {
    titulo: 'Tasaciones profesionales',
    icono: '📋',
    texto: 'Un precio real, basado en el mercado de Posadas y alrededores.',
    items: ['Análisis de mercado local', 'Visita presencial', 'Informe escrito', 'Sin cargo inicial'],
  },
]

const PASOS = [
  { n: '01', titulo: 'Contanos qué buscás', texto: 'Zona, presupuesto y tipo de propiedad. Por WhatsApp, en dos minutos.' },
  { n: '02', titulo: 'Te mostramos opciones', texto: 'Seleccionamos lo que encaja y coordinamos las visitas que quieras.' },
  { n: '03', titulo: 'Cerramos con seguridad', texto: 'Documentación, escribanía y firma. Acompañados en cada paso.' },
]

export default async function Home() {
  const { data: propiedades } = await listarDestacadas(supabaseServer, 3)

  return (
    <main>
      {/* ================= HERO ================= */}
      <section className="hero trama-tierra">
        <div className="contenedor hero-inner">
          <span className="hero-chip">
            <span className="hero-chip-punto" /> Posadas · Garupá · Candelaria
          </span>

          <h1 className="display hero-titulo">
            Tu futuro hogar
            <br />
            en la <span className="resaltado">tierra roja</span>
          </h1>

          <p className="hero-bajada">
            Más que una inmobiliaria: acompañamos cada operación en Misiones con
            asesoramiento honesto y documentación en regla.
          </p>

          <div className="hero-acciones">
            <Link href="/propiedades" className="btn btn-primario">
              Ver propiedades
            </Link>
            <BotonScroll target="contacto" className="btn btn-fantasma">
              Hablar con nosotros
            </BotonScroll>
          </div>

          <dl className="hero-datos">
            <div>
              <dt>Zona</dt>
              <dd>Posadas y alrededores</dd>
            </div>
            <div>
              <dt>Operaciones</dt>
              <dd>Venta · Alquiler · Tasación</dd>
            </div>
            <div>
              <dt>Respuesta</dt>
              <dd>Por WhatsApp, el mismo día</dd>
            </div>
          </dl>
        </div>
      </section>

      {/* ================= DESTACADAS ================= */}
      <section className="seccion">
        <div className="contenedor">
          <header className="cabecera-seccion">
            <div>
              <span className="antetitulo">Selección</span>
              <h2 className="titulo-seccion">Propiedades destacadas</h2>
            </div>
            <Link href="/propiedades" className="enlace-flecha">
              Ver todo el catálogo <span aria-hidden="true">→</span>
            </Link>
          </header>

          {propiedades.length === 0 ? (
            <div className="vacio">
              <p className="bajada" style={{ margin: '0 auto' }}>
                Estamos cargando nuevas propiedades. Escribinos y te avisamos apenas
                entre algo que encaje con lo que buscás.
              </p>
            </div>
          ) : (
            <div className="grilla-props">
              {propiedades.map((p, i) => (
                <CardPropiedad key={p.id} propiedad={p} prioridad={i === 0} />
              ))}
            </div>
          )}
        </div>
      </section>

      {/* ================= SERVICIOS ================= */}
      <section id="servicios" className="seccion seccion-arena">
        <div className="contenedor">
          <header className="cabecera-seccion cabecera-centrada">
            <div>
              <span className="antetitulo">Qué hacemos</span>
              <h2 className="titulo-seccion">Gestión inmobiliaria integral</h2>
            </div>
          </header>

          <div className="grilla-servicios">
            {SERVICIOS.map((s) => (
              <article key={s.titulo} className="card-servicio">
                <span className="card-servicio-icono" aria-hidden="true">{s.icono}</span>
                <h3>{s.titulo}</h3>
                <p className="card-servicio-texto">{s.texto}</p>
                <ul className="lista-check">
                  {s.items.map((i) => (
                    <li key={i}>{i}</li>
                  ))}
                </ul>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* ================= CÓMO TRABAJAMOS ================= */}
      <section className="seccion">
        <div className="contenedor">
          <header className="cabecera-seccion">
            <div>
              <span className="antetitulo">Cómo trabajamos</span>
              <h2 className="titulo-seccion">Tres pasos, sin vueltas</h2>
            </div>
          </header>

          <ol className="pasos">
            {PASOS.map((p) => (
              <li key={p.n} className="paso">
                <span className="paso-numero">{p.n}</span>
                <h3 className="paso-titulo">{p.titulo}</h3>
                <p className="paso-texto">{p.texto}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* ================= HISTORIA ================= */}
      <section className="seccion seccion-arena">
        <div className="contenedor historia">
          <div className="historia-texto">
            <span className="antetitulo">Nuestra historia</span>
            <h2 className="titulo-seccion" style={{ margin: '14px 0 22px' }}>
              Construimos relaciones,
              <br />
              no solo ventas
            </h2>
            <p className="bajada" style={{ marginBottom: 16 }}>
              RN Inmobiliaria nació para profesionalizar el sector en Misiones.
              Faltaba un lugar donde la tecnología y el trato humano fueran de la mano.
            </p>
            <p className="bajada">
              Hoy acompañamos a familias y empresas a encontrar su lugar, cuidando
              su patrimonio con transparencia y rapidez.
            </p>
          </div>

          <div className="historia-tarjetas">
            <article className="panel card-valor">
              <span className="card-valor-icono" aria-hidden="true">🎯</span>
              <h3>Nuestra misión</h3>
              <p>
                Brindar soluciones ágiles y seguras, protegiendo los intereses de
                nuestros clientes en cada paso.
              </p>
            </article>
            <article className="panel card-valor">
              <span className="card-valor-icono" aria-hidden="true">🌿</span>
              <h3>Nuestra visión</h3>
              <p>
                Ser la inmobiliaria de referencia en Misiones, por innovación y por
                calidad humana.
              </p>
            </article>
          </div>
        </div>
      </section>

      {/* ================= CONTACTO ================= */}
      <section id="contacto" className="seccion">
        <div className="contenedor contacto">
          <div className="contacto-info">
            <span className="antetitulo">Contacto</span>
            <h2 className="titulo-seccion" style={{ margin: '14px 0 20px' }}>
              ¿Damos el siguiente paso?
            </h2>
            <p className="bajada" style={{ marginBottom: 34 }}>
              Dejanos tus datos o escribinos directo por WhatsApp. Te asesoramos sin
              compromiso.
            </p>

            <ul className="lista-contacto">
              <li>
                <span className="lista-contacto-icono" aria-hidden="true">📍</span>
                <span>
                  <strong>Oficina</strong>
                  {OFICINA.ciudad}
                </span>
              </li>
              <li>
                <span className="lista-contacto-icono verde" aria-hidden="true">💬</span>
                <span>
                  <strong>WhatsApp</strong>
                  {OFICINA.whatsappDisplay}
                </span>
              </li>
            </ul>

            <a
              href={waLink(
                WHATSAPP_PRINCIPAL,
                'Hola RN Inmobiliaria. Estoy interesado en sus servicios, me gustaría saber más.'
              )}
              target="_blank"
              rel="noopener noreferrer"
              className="btn btn-whatsapp"
              style={{ marginTop: 30 }}
            >
              Escribinos por WhatsApp
            </a>
          </div>

          <div className="contacto-form">
            <FormularioContacto />
          </div>
        </div>
      </section>

      {/* ================= PIE ================= */}
      <footer className="pie trama-tierra">
        <div className="contenedor pie-inner">
          <div className="pie-marca">
            <span className="pie-logo">RN</span>
            <div>
              <p className="pie-nombre">RN Inmobiliaria</p>
              <p className="pie-lugar">Posadas · Misiones · Argentina</p>
            </div>
          </div>

          <nav className="pie-links" aria-label="Pie de página">
            <Link href="/propiedades">Propiedades</Link>
            <Link href="/catalogo">Búsqueda avanzada</Link>
            <Link href="/favoritos">Favoritos</Link>
            <a href="#contacto">Contacto</a>
          </nav>

          <p className="pie-legal">© 2026 RN Inmobiliaria · Todos los derechos reservados</p>
        </div>
      </footer>

      <style>{`
        /* ---------- HERO ---------- */
        .hero {
          background: var(--selva-900);
          color: var(--arena-100);
          padding-block: clamp(72px, 12vw, 132px);
          overflow: hidden;
        }
        .hero-inner { display: flex; flex-direction: column; align-items: flex-start; }

        .hero-chip {
          display: inline-flex; align-items: center; gap: 9px;
          padding: 8px 17px;
          border: 1px solid rgba(255,255,255,0.16);
          border-radius: var(--r-full);
          background: rgba(255,255,255,0.05);
          backdrop-filter: blur(8px);
          font-size: 0.78rem; font-weight: 500;
          letter-spacing: 0.05em;
          color: rgba(255,255,255,0.82);
        }
        .hero-chip-punto {
          width: 7px; height: 7px; border-radius: 50%;
          background: var(--sol-400);
          box-shadow: 0 0 0 4px rgba(233,169,74,0.2);
        }

        .hero-titulo { color: #fff; margin: 26px 0 0; }
        .hero-titulo .resaltado { color: var(--sol-400); }
        .hero-titulo .resaltado::after { background: var(--tierra-500); opacity: 0.85; }

        .hero-bajada {
          color: rgba(255,255,255,0.72);
          font-size: clamp(1.02rem, 2.2vw, 1.2rem);
          line-height: 1.7;
          max-width: 54ch;
          margin-top: 22px;
        }

        .hero-acciones { display: flex; flex-wrap: wrap; gap: 13px; margin-top: 36px; }

        .hero-datos {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(190px, 1fr));
          gap: 22px;
          width: 100%;
          margin: 58px 0 0;
          padding-top: 30px;
          border-top: 1px solid rgba(255,255,255,0.12);
        }
        .hero-datos dt {
          font-size: 0.68rem; font-weight: 700;
          letter-spacing: 0.16em; text-transform: uppercase;
          color: var(--sol-400);
          margin-bottom: 6px;
        }
        .hero-datos dd {
          margin: 0;
          font-size: 0.98rem;
          color: rgba(255,255,255,0.86);
          font-weight: 500;
        }

        /* ---------- CABECERAS ---------- */
        .cabecera-seccion {
          display: flex; align-items: flex-end; justify-content: space-between;
          flex-wrap: wrap; gap: 18px;
          margin-bottom: clamp(32px, 4vw, 52px);
        }
        .cabecera-seccion .antetitulo { display: block; margin-bottom: 11px; }
        .cabecera-centrada { justify-content: center; text-align: center; }

        .seccion-arena { background: var(--arena-100); }

        /* ---------- SERVICIOS ---------- */
        .grilla-servicios {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(min(100%, 290px), 1fr));
          gap: clamp(18px, 2.2vw, 28px);
        }
        .card-servicio {
          background: var(--superficie);
          border: 1px solid var(--borde-suave);
          border-radius: var(--r-lg);
          padding: clamp(26px, 3vw, 36px);
          box-shadow: var(--sombra-sm);
          transition: transform .25s ease, box-shadow .25s ease;
        }
        @media (hover: hover) {
          .card-servicio:hover { transform: translateY(-4px); box-shadow: var(--sombra-md); }
        }
        .card-servicio-icono {
          display: grid; place-items: center;
          width: 54px; height: 54px;
          border-radius: var(--r-md);
          background: var(--tierra-50);
          font-size: 1.5rem;
          margin-bottom: 18px;
        }
        .card-servicio h3 { font-size: 1.28rem; margin-bottom: 9px; }
        .card-servicio-texto { color: var(--tinta-500); font-size: 0.96rem; margin-bottom: 18px; }

        .lista-check { list-style: none; padding: 0; margin: 0; display: grid; gap: 9px; }
        .lista-check li {
          position: relative;
          padding-left: 25px;
          font-size: 0.93rem;
          color: var(--tinta-700);
        }
        .lista-check li::before {
          content: '';
          position: absolute; left: 0; top: 0.42em;
          width: 14px; height: 8px;
          border-left: 2px solid var(--selva-600);
          border-bottom: 2px solid var(--selva-600);
          transform: rotate(-45deg);
          border-radius: 1px;
        }

        /* ---------- PASOS ---------- */
        .pasos {
          list-style: none; padding: 0; margin: 0;
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(min(100%, 260px), 1fr));
          gap: clamp(20px, 3vw, 40px);
        }
        .paso { position: relative; padding-top: 26px; border-top: 2px solid var(--borde); }
        .paso-numero {
          display: block;
          font-family: var(--fuente-titulo);
          font-size: 2.4rem; font-weight: 600;
          color: var(--tierra-200);
          line-height: 1;
          margin-bottom: 14px;
        }
        .paso-titulo { font-size: 1.2rem; margin-bottom: 8px; }
        .paso-texto { color: var(--tinta-500); font-size: 0.96rem; }

        /* ---------- HISTORIA ---------- */
        .historia {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(min(100%, 320px), 1fr));
          gap: clamp(32px, 5vw, 70px);
          align-items: center;
        }
        .historia-tarjetas { display: grid; gap: 18px; }
        .card-valor { padding: clamp(24px, 3vw, 32px); }
        .card-valor-icono { font-size: 1.7rem; display: block; margin-bottom: 12px; }
        .card-valor h3 { font-size: 1.22rem; margin-bottom: 9px; }
        .card-valor p { color: var(--tinta-500); font-size: 0.96rem; }

        /* ---------- CONTACTO ---------- */
        .contacto {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(min(100%, 320px), 1fr));
          gap: clamp(32px, 5vw, 64px);
          align-items: start;
        }
        .lista-contacto { list-style: none; padding: 0; margin: 0; display: grid; gap: 18px; }
        .lista-contacto li { display: flex; align-items: center; gap: 15px; }
        .lista-contacto strong {
          display: block;
          font-size: 0.94rem; font-weight: 600;
          color: var(--tinta-900);
        }
        .lista-contacto li > span:last-child { color: var(--tinta-500); font-size: 0.93rem; }
        .lista-contacto-icono {
          display: grid; place-items: center;
          flex-shrink: 0;
          width: 48px; height: 48px;
          border-radius: var(--r-md);
          background: var(--arena-100);
          border: 1px solid var(--borde-suave);
          font-size: 1.25rem;
        }
        .lista-contacto-icono.verde { background: var(--selva-50); border-color: var(--selva-100); }

        /* ---------- PIE ---------- */
        .pie {
          background: var(--selva-900);
          color: rgba(255,255,255,0.7);
          padding-block: clamp(54px, 7vw, 82px);
        }
        .pie-inner { display: grid; gap: 32px; justify-items: center; text-align: center; }
        .pie-marca { display: flex; align-items: center; gap: 13px; }
        .pie-logo {
          display: grid; place-items: center;
          width: 46px; height: 46px;
          border-radius: 14px;
          background: var(--tierra-600); color: #fff;
          font-family: var(--fuente-titulo); font-weight: 600; font-size: 1.1rem;
        }
        .pie-nombre {
          font-family: var(--fuente-titulo);
          font-size: 1.2rem; font-weight: 600; color: #fff;
          text-align: left;
        }
        .pie-lugar {
          font-size: 0.72rem; letter-spacing: 0.12em; text-transform: uppercase;
          color: rgba(255,255,255,0.5); text-align: left;
        }
        .pie-links { display: flex; flex-wrap: wrap; justify-content: center; gap: 8px 26px; }
        .pie-links a {
          color: rgba(255,255,255,0.75);
          text-decoration: none; font-size: 0.94rem;
          transition: color .18s;
        }
        .pie-links a:hover { color: #fff; }
        .pie-legal {
          font-size: 0.8rem;
          color: rgba(255,255,255,0.42);
          padding-top: 26px;
          border-top: 1px solid rgba(255,255,255,0.1);
          width: 100%;
        }
      `}</style>
    </main>
  )
}
