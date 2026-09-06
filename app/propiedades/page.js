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
    <main style={{ minHeight: '100vh', backgroundColor: '#f8fafc', fontFamily: 'system-ui, sans-serif' }}>
      <section style={{
        height: '400px',
        backgroundImage: 'linear-gradient(rgba(0, 0, 0, 0.5), rgba(0, 0, 0, 0.7)), url(https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1920&q=80)',
        backgroundSize: 'cover', backgroundPosition: 'center',
        display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
      }}>
        <h1 style={{ color: 'white', fontSize: 'clamp(2rem, 6vw, 3.5rem)', fontWeight: '900', margin: '0 0 10px 0', letterSpacing: '-1px', textAlign: 'center' }}>Catálogo de Ventas</h1>
        <p style={{ color: '#e2e8f0', fontSize: '1.2rem', fontWeight: '500', textAlign: 'center' }}>Encontrá tu próximo hogar en la tierra roja</p>
      </section>

      <PropiedadesCliente propiedades={propiedades} />

      <footer style={{ backgroundColor: '#020617', padding: '60px 8%', color: 'white', textAlign: 'center' }}>
        <h2 style={{ fontSize: '1.8rem', fontWeight: '900', marginBottom: '10px' }}>RN INMOBILIARIA</h2>
        <div style={{ fontSize: '0.85rem', color: '#475569', fontWeight: '700', letterSpacing: '2px' }}>
          © 2026 POSADAS, MISIONES, ARGENTINA
        </div>
      </footer>
    </main>
  )
}
