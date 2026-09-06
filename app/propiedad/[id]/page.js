import Link from 'next/link'
import { notFound } from 'next/navigation'
import { supabaseServer } from '../../../lib/supabaseServer'
import { obtenerPropiedad, listarSimilares, listarPropiedades } from '../../../lib/propiedades'
import { formatPrecio, imagenPrincipal, waLink } from '../../../lib/format'
import { CONTACTOS, SITE_URL, SITE_NAME } from '../../../lib/config'
import Foto from '../../../components/Foto'
import GaleriaPropiedad from '../../../components/GaleriaPropiedad'
import BotonFavorito from '../../../components/BotonFavorito'

// Server Component: los datos se traen en el servidor, así el HTML que recibe
// Google (y el que se ve al compartir el link) ya incluye título, precio,
// descripción y fotos. Antes esto se pedía en un useEffect y el crawler
// recibía una página vacía.
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
    offers: Number(propiedad.precio) > 0
      ? {
          '@type': 'Offer',
          price: Number(propiedad.precio),
          priceCurrency: propiedad.moneda || 'USD',
          availability:
            propiedad.estado_interno === 'Vendida'
              ? 'https://schema.org/SoldOut'
              : 'https://schema.org/InStock',
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
    <main style={{ minHeight: '100vh', backgroundColor: '#F8FAFC', fontFamily: 'system-ui, sans-serif' }}>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '40px 20px' }}>

        <Link href="/propiedades" style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#64748b', textDecoration: 'none', fontWeight: '700', marginBottom: '25px', fontSize: '0.85rem' }}>
          <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="3" viewBox="0 0 24 24" aria-hidden="true"><path d="M15 19l-7-7 7-7"></path></svg>
          VOLVER AL CATÁLOGO
        </Link>

        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '30px', alignItems: 'start' }}>

          {/* GALERÍA (cliente: necesita estado) + DESCRIPCIÓN (servidor) */}
          <div style={{ flex: '1 1 650px', minWidth: '300px' }}>
            <GaleriaPropiedad
              imagenes={imagenes}
              titulo={propiedad.titulo}
              estadoInterno={propiedad.estado_interno}
            />

            <div style={{ marginTop: '30px', backgroundColor: 'white', padding: '30px', borderRadius: '24px', border: '1px solid #f1f5f9' }}>
              <h2 style={{ fontWeight: '900', fontSize: '1.4rem', color: '#020617', marginBottom: '15px' }}>Descripción</h2>
              <p style={{ color: '#475569', lineHeight: '1.7', fontSize: '1rem', whiteSpace: 'pre-line' }}>{propiedad.descripcion}</p>
            </div>
          </div>

          {/* INFO (servidor, salvo el corazón) */}
          <div style={{ flex: '1 1 350px', minWidth: '300px' }}>
            <div style={{ backgroundColor: 'white', padding: '35px', borderRadius: '24px', border: '1px solid #f1f5f9', boxShadow: '0 10px 30px rgba(0,0,0,0.02)', position: 'relative' }}>

              <BotonFavorito id={propiedad.id} variante="detalle" />

              <span style={{ color: '#F59E0B', fontWeight: '900', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '1px' }}>📍 {propiedad.zona}</span>
              <h1 style={{ fontSize: '2rem', fontWeight: '900', color: '#020617', margin: '12px 0', lineHeight: 1.2, paddingRight: '40px' }}>{propiedad.titulo}</h1>

              <div style={{ margin: '25px 0', fontSize: '2.4rem', fontWeight: '900', color: '#020617', letterSpacing: '-2px' }}>
                {formatPrecio(propiedad)}
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '30px' }}>
                <div style={{ padding: '15px', backgroundColor: '#F8FAFC', borderRadius: '16px', textAlign: 'center' }}>
                  <span style={{ display: 'block', fontSize: '1.2rem', marginBottom: '5px' }}>🛏️</span>
                  <span style={{ fontWeight: '800', color: '#020617', fontSize: '0.9rem' }}>{propiedad.habitaciones} Dorm.</span>
                </div>
                <div style={{ padding: '15px', backgroundColor: '#F8FAFC', borderRadius: '16px', textAlign: 'center' }}>
                  <span style={{ display: 'block', fontSize: '1.2rem', marginBottom: '5px' }}>🚿</span>
                  <span style={{ fontWeight: '800', color: '#020617', fontSize: '0.9rem' }}>{propiedad.banos} Baños</span>
                </div>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <a href={waLink(vendedorTelefono, mensajeWsp)} target="_blank" rel="noopener noreferrer" style={{ textDecoration: 'none', backgroundColor: '#22c55e', color: 'white', textAlign: 'center', padding: '18px', borderRadius: '16px', fontWeight: '900', fontSize: '1rem' }}>
                  WHATSAPP VENDEDOR
                </a>
                <a href={`mailto:${vendedorEmail}`} style={{ textDecoration: 'none', backgroundColor: '#020617', color: 'white', textAlign: 'center', padding: '18px', borderRadius: '16px', fontWeight: '900', fontSize: '1rem' }}>
                  ENVIAR EMAIL
                </a>
              </div>
            </div>

            {propiedad.direccion && (
              <div style={{ marginTop: '25px', borderRadius: '24px', overflow: 'hidden', border: '1px solid #f1f5f9' }}>
                <iframe
                  title={`Mapa de ${propiedad.direccion}`}
                  loading="lazy"
                  width="100%" height="250" style={{ border: 0 }}
                  src={`https://maps.google.com/maps?q=${encodeURIComponent(propiedad.direccion + ', Misiones, Argentina')}&output=embed`}
                ></iframe>
              </div>
            )}
          </div>
        </div>

        {/* SIMILARES */}
        {similares.length > 0 && (
          <div style={{ marginTop: '80px', borderTop: '2px solid #e2e8f0', paddingTop: '60px' }}>
            <h2 style={{ fontSize: '1.8rem', fontWeight: '900', color: '#020617', marginBottom: '30px' }}>También te puede interesar...</h2>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(290px, 1fr))', gap: '25px' }}>
              {similares.map(p => (
                <Link key={p.id} href={`/propiedad/${p.id}`} style={{ textDecoration: 'none', color: 'inherit' }}>
                  <div style={{ backgroundColor: 'white', borderRadius: '24px', overflow: 'hidden', border: '1px solid #f1f5f9' }}>
                    <div style={{ position: 'relative', height: '220px' }}>
                      <Foto src={imagenPrincipal(p)} alt={p.titulo} sizes="(max-width: 768px) 100vw, 300px" />
                    </div>
                    <div style={{ padding: '20px' }}>
                      <p style={{ color: '#F59E0B', fontSize: '0.75rem', fontWeight: '900' }}>📍 {p.zona}</p>
                      <h3 style={{ fontSize: '1.1rem', fontWeight: '900', margin: '5px 0 15px' }}>{p.titulo}</h3>
                      <div style={{ display: 'flex', gap: '15px', color: '#64748b', fontSize: '0.9rem', fontWeight: '700' }}>
                        <span>🛏️ {p.habitaciones}</span><span>🚿 {p.banos}</span>
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>
    </main>
  )
}
