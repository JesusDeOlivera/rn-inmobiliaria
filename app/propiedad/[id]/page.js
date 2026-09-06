import Link from 'next/link'
import { notFound } from 'next/navigation'
import { supabaseServer } from '../../../lib/supabaseServer'
import { obtenerPropiedad, listarSimilares, listarPropiedades } from '../../../lib/propiedades'
import { formatPrecio, waLink } from '../../../lib/format'
import { CONTACTOS, SITE_URL, SITE_NAME } from '../../../lib/config'
import CardPropiedad from '../../../components/CardPropiedad'
import GaleriaPropiedad from '../../../components/GaleriaPropiedad'
import BotonFavorito from '../../../components/BotonFavorito'

// Server Component: los datos se traen en el servidor, así el HTML que recibe
// Google (y el que se ve al compartir el link) ya incluye título, precio,
// descripción y fotos.
export const revalidate = 60

// Pre-genera una página estática por propiedad publicada. Las que se carguen
// después del build se renderizan on-demand y quedan cacheadas igual.
export async function generateStaticParams() {
  const { data } = await listarPropiedades(supabaseServer)
  return data.map((p) => ({ id: String(p.id) }))
}

export default async function PropiedadDetalle({ params }) {
  const { id } = await params

  const { data: propiedad, noEncontrada } = await obtenerPropiedad(supabaseServer, id)
  if (noEncontrada || !propiedad) notFound()

  const { data: similares } = await listarSimilares(supabaseServer, propiedad)

  const vendedorNombre = propiedad.nombre_vendedor || CONTACTOS.papa.nombre
  const vendedorTelefono = propiedad.telefono_vendedor || CONTACTOS.papa.tel
  const vendedorEmail = propiedad.email_vendedor || CONTACTOS.papa.email
  const mensajeWsp = `Hola ${vendedorNombre}, me interesa la propiedad "${propiedad.titulo}" que vi en la web.`
  const imagenes = propiedad.imagenes || []
  const estado = propiedad.estado_interno || propiedad.estado

  const datos = [
    propiedad.habitaciones > 0 && { icono: '🛏️', valor: propiedad.habitaciones, etiqueta: propiedad.habitaciones === 1 ? 'Dormitorio' : 'Dormitorios' },
    propiedad.banos > 0 && { icono: '🚿', valor: propiedad.banos, etiqueta: propiedad.banos === 1 ? 'Baño' : 'Baños' },
    propiedad.metros_cuadrados > 0 && { icono: '📐', valor: propiedad.metros_cuadrados, etiqueta: 'm² totales' },
    propiedad.tipo && { icono: '🏷️', valor: propiedad.tipo, etiqueta: 'Tipo' },
  ].filter(Boolean)

  // Datos estructurados para Google (rich results de inmuebles).
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'RealEstateListing',
    name: propiedad.titulo,
    description: propiedad.descripcion || undefined,
    url: `${SITE_URL}/propiedad/${propiedad.id}`,
    image: imagenes.length ? imagenes : undefined,
    datePosted: propiedad.created_at,
    address: {
      '@type': 'PostalAddress',
      streetAddress: propiedad.direccion || undefined,
      addressLocality: propiedad.zona,
      addressRegion: 'Misiones',
      addressCountry: 'AR',
    },
    geo: propiedad.latitud && propiedad.longitud
      ? { '@type': 'GeoCoordinates', latitude: propiedad.latitud, longitude: propiedad.longitud }
      : undefined,
    offers: Number(propiedad.precio) > 0
      ? {
          '@type': 'Offer',
          price: Number(propiedad.precio),
          priceCurrency: propiedad.moneda || 'USD',
          availability: estado === 'Vendida' ? 'https://schema.org/SoldOut' : 'https://schema.org/InStock',
        }
      : undefined,
    numberOfBedrooms: propiedad.habitaciones || undefined,
    numberOfBathroomsTotal: propiedad.banos || undefined,
    floorSize: propiedad.metros_cuadrados
      ? { '@type': 'QuantitativeValue', value: propiedad.metros_cuadrados, unitCode: 'MTK' }
      : undefined,
    broker: { '@type': 'RealEstateAgent', name: SITE_NAME },
  }

  return (
    <main className="seccion-compacta">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />

      <div className="contenedor">
        <nav className="miga-ficha" aria-label="Ruta">
          <Link href="/propiedades" className="enlace-volver">
            <span aria-hidden="true">←</span> Volver al catálogo
          </Link>
        </nav>

        <div className="ficha">
          {/* ---------- COLUMNA IZQUIERDA ---------- */}
          <div className="ficha-principal">
            <GaleriaPropiedad
              imagenes={imagenes}
              titulo={propiedad.titulo}
              estadoInterno={estado}
            />

            <section className="panel ficha-bloque">
              <h2 className="ficha-bloque-titulo">Descripción</h2>
              <p className="ficha-descripcion">{propiedad.descripcion}</p>
            </section>

            {propiedad.direccion && (
              <section className="panel ficha-bloque">
                <h2 className="ficha-bloque-titulo">Ubicación</h2>
                <p className="ficha-direccion">
                  <span aria-hidden="true">📍</span> {propiedad.direccion} — {propiedad.zona}
                </p>
                <div className="ficha-mapa">
                  <iframe
                    title={`Mapa de ${propiedad.direccion}`}
                    loading="lazy"
                    width="100%"
                    height="300"
                    style={{ border: 0, display: 'block' }}
                    src={
                      propiedad.latitud && propiedad.longitud
                        ? `https://www.openstreetmap.org/export/embed.html?bbox=${propiedad.longitud - 0.008}%2C${propiedad.latitud - 0.006}%2C${propiedad.longitud + 0.008}%2C${propiedad.latitud + 0.006}&layer=mapnik&marker=${propiedad.latitud}%2C${propiedad.longitud}`
                        : `https://maps.google.com/maps?q=${encodeURIComponent(propiedad.direccion + ', Misiones, Argentina')}&output=embed`
                    }
                  />
                </div>
                <p className="ficha-nota">
                  Ubicación aproximada: indica la zona, no la dirección exacta.
                </p>
              </section>
            )}
          </div>

          {/* ---------- COLUMNA DERECHA ---------- */}
          <aside className="ficha-lateral">
            <div className="panel ficha-resumen">
              <BotonFavorito id={propiedad.id} className="btn-fav-ficha" />

              <span className="antetitulo">{propiedad.zona}</span>
              <h1 className="ficha-titulo">{propiedad.titulo}</h1>

              <p className="ficha-precio">{formatPrecio(propiedad)}</p>

              {estado && estado !== 'Disponible' && (
                <span className={`insignia ${estado === 'Reservada' ? 'insignia-reservada' : 'insignia-vendida'}`}>
                  {estado}
                </span>
              )}

              <dl className="ficha-datos">
                {datos.map((d) => (
                  <div key={d.etiqueta}>
                    <dt>
                      <span aria-hidden="true">{d.icono}</span> {d.etiqueta}
                    </dt>
                    <dd>{d.valor}</dd>
                  </div>
                ))}
              </dl>

              <div className="ficha-acciones">
                <a
                  href={waLink(vendedorTelefono, mensajeWsp)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn btn-whatsapp btn-bloque"
                >
                  Consultar por WhatsApp
                </a>
                <a href={`mailto:${vendedorEmail}`} className="btn btn-secundario btn-bloque">
                  Enviar un email
                </a>
              </div>

              <p className="ficha-vendedor">
                Te atiende <strong>{vendedorNombre}</strong>
              </p>
            </div>
          </aside>
        </div>

        {/* ---------- SIMILARES ---------- */}
        {similares.length > 0 && (
          <section className="ficha-similares">
            <header className="cabecera-seccion">
              <div>
                <span className="antetitulo">Seguí mirando</span>
                <h2 className="titulo-seccion">También te puede interesar</h2>
              </div>
              <Link href="/propiedades" className="enlace-flecha">
                Ver todo <span aria-hidden="true">→</span>
              </Link>
            </header>
            <div className="grilla-props">
              {similares.map((p) => (
                <CardPropiedad key={p.id} propiedad={p} sizes="(max-width: 768px) 100vw, 300px" />
              ))}
            </div>
          </section>
        )}
      </div>

      <style>{`
        .miga-ficha { margin-bottom: 22px; }
        .enlace-volver {
          display: inline-flex; align-items: center; gap: 8px;
          color: var(--tinta-500); text-decoration: none;
          font-size: 0.9rem; font-weight: 500;
          transition: color .18s;
        }
        .enlace-volver:hover { color: var(--tierra-600); }

        .ficha {
          display: grid;
          grid-template-columns: minmax(0, 1.65fr) minmax(300px, 1fr);
          gap: clamp(24px, 3vw, 44px);
          align-items: start;
        }
        .ficha-principal { display: grid; gap: 24px; min-width: 0; }

        .ficha-bloque { padding: clamp(22px, 3vw, 32px); }
        .ficha-bloque-titulo { font-size: 1.3rem; margin-bottom: 14px; }
        .ficha-descripcion {
          color: var(--tinta-700);
          font-size: 1rem; line-height: 1.75;
          white-space: pre-line;
        }
        .ficha-direccion { color: var(--tinta-500); font-size: 0.95rem; margin-bottom: 16px; }
        .ficha-mapa {
          border-radius: var(--r-md);
          overflow: hidden;
          border: 1px solid var(--borde);
        }
        .ficha-nota { font-size: 0.8rem; color: var(--tinta-400); margin-top: 10px; }

        /* ---------- LATERAL ---------- */
        .ficha-lateral { position: sticky; top: calc(var(--nav-alto) + 20px); }
        .ficha-resumen { position: relative; padding: clamp(24px, 3vw, 34px); }
        .btn-fav-ficha {
          top: 20px; right: 20px;
          background: var(--arena-100);
          border: 1px solid var(--borde-suave);
        }
        .ficha-titulo {
          font-size: clamp(1.6rem, 3.4vw, 2.15rem);
          margin: 10px 0 0;
          padding-right: 48px;
        }
        .ficha-precio {
          font-family: var(--fuente-titulo);
          font-size: clamp(1.9rem, 4vw, 2.5rem);
          font-weight: 600;
          color: var(--tierra-600);
          letter-spacing: -0.03em;
          margin: 18px 0;
        }

        .ficha-datos {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 10px;
          margin: 24px 0;
        }
        .ficha-datos > div {
          background: var(--arena-100);
          border-radius: var(--r-md);
          padding: 14px 16px;
        }
        .ficha-datos dt {
          font-size: 0.7rem; font-weight: 600;
          letter-spacing: 0.06em; text-transform: uppercase;
          color: var(--tinta-400);
          margin-bottom: 5px;
        }
        .ficha-datos dd {
          margin: 0;
          font-family: var(--fuente-titulo);
          font-size: 1.15rem; font-weight: 600;
          color: var(--tinta-900);
        }

        .ficha-acciones { display: grid; gap: 10px; }
        .ficha-vendedor {
          margin-top: 18px;
          text-align: center;
          font-size: 0.86rem;
          color: var(--tinta-400);
        }
        .ficha-vendedor strong { color: var(--tinta-700); font-weight: 600; }

        .ficha-similares {
          margin-top: clamp(56px, 8vw, 96px);
          padding-top: clamp(40px, 5vw, 64px);
          border-top: 1px solid var(--borde);
        }

        @media (max-width: 980px) {
          .ficha { grid-template-columns: 1fr; }
          .ficha-lateral { position: static; }
        }
      `}</style>
    </main>
  )
}
