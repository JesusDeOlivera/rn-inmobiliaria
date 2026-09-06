import { supabaseServer } from '../../lib/supabaseServer'
import { listarPropiedades } from '../../lib/propiedades'
import PropiedadesCliente from './propiedades-cliente'

// Server Component: trae el catálogo en el servidor y se lo pasa al
// componente cliente, que solo filtra. Así el HTML inicial ya contiene
// todas las propiedades y Google las indexa.
export const revalidate = 60

export const metadata = {
  title: 'Catálogo de propiedades en venta',
  description:
    'Casas, departamentos, terrenos y locales en venta en Posadas, Garupá y Candelaria. Filtrá por zona, tipo y precio.',
}

export default async function PropiedadesPage() {
  const { data: propiedades } = await listarPropiedades(supabaseServer)

  return (
    <main>
      <section className="hero-catalogo trama-tierra">
        <div className="contenedor">
          <span className="antetitulo hero-catalogo-ante">Catálogo</span>
          <h1 className="display hero-catalogo-titulo">Propiedades en venta</h1>
          <p className="hero-catalogo-bajada">
            Todo lo que tenemos publicado hoy en Posadas y alrededores.
          </p>
        </div>
      </section>

      <PropiedadesCliente propiedades={propiedades} />

      <style>{`
        .hero-catalogo {
          background: var(--selva-900);
          color: #fff;
          padding-block: clamp(56px, 8vw, 96px) clamp(74px, 9vw, 112px);
          overflow: hidden;
        }
        .hero-catalogo-ante { color: var(--sol-400); display: block; margin-bottom: 12px; }
        .hero-catalogo-titulo {
          color: #fff;
          font-size: clamp(2.1rem, 5.5vw, 3.6rem);
        }
        .hero-catalogo-bajada {
          color: rgba(255,255,255,0.7);
          font-size: clamp(1rem, 2vw, 1.12rem);
          margin-top: 14px;
          max-width: 50ch;
        }
      `}</style>
    </main>
  )
}
