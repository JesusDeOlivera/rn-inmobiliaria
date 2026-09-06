import Link from 'next/link'
import Foto from './Foto'
import BotonFavorito from './BotonFavorito'
import { formatPrecio, imagenPrincipal } from '../lib/format'

// Tarjeta de propiedad, única para todo el sitio (portada, catálogo,
// búsqueda avanzada, favoritos y similares). No lleva 'use client': es
// presentacional, así que funciona tanto en el servidor como dentro de
// componentes cliente.
//
// El único trozo interactivo es <BotonFavorito>, que sí es cliente.
export default function CardPropiedad({
  propiedad: p,
  sizes = '(max-width: 640px) 100vw, (max-width: 1100px) 50vw, 350px',
  prioridad = false,
  mostrarFavorito = true,
  accion = null, // nodo extra (ej. botón "Quitar" en favoritos)
}) {
  const estado = p.estado_interno || p.estado
  const noDisponible = estado && estado !== 'Disponible'

  return (
    <article className="card-prop">
      {mostrarFavorito && <BotonFavorito id={p.id} />}
      {accion}

      <Link href={`/propiedad/${p.id}`} className="card-prop-enlace">
        <div className="card-prop-media">
          <div className="pila-insignias">
            <span className="insignia insignia-venta">Venta</span>
            {noDisponible && (
              <span className={`insignia ${estado === 'Reservada' ? 'insignia-reservada' : 'insignia-vendida'}`}>
                {estado}
              </span>
            )}
            {p.destacado && <span className="insignia insignia-destacada">★ Destacada</span>}
          </div>

          <Foto
            src={imagenPrincipal(p)}
            alt={p.titulo}
            sizes={sizes}
            priority={prioridad}
            style={{ transition: 'transform 0.5s cubic-bezier(0.2, 0.8, 0.2, 1)' }}
          />

          <span className="card-prop-precio">{formatPrecio(p)}</span>
        </div>

        <div className="card-prop-cuerpo">
          <span className="card-prop-zona">{p.zona}</span>
          <h3 className="card-prop-titulo">{p.titulo}</h3>
          <div className="card-prop-datos">
            {p.habitaciones > 0 && <span>🛏️ {p.habitaciones} dorm.</span>}
            {p.banos > 0 && <span>🚿 {p.banos} baños</span>}
            {p.metros_cuadrados > 0 && <span>📐 {p.metros_cuadrados} m²</span>}
          </div>
        </div>
      </Link>
    </article>
  )
}
