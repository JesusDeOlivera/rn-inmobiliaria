'use client'

import { useEffect, useRef } from 'react'
import 'leaflet/dist/leaflet.css'
import { formatPrecio, imagenPrincipal } from '../lib/format'
import { CENTRO_POSADAS } from '../lib/constantes-mapa'

// Mapa con un marcador por propiedad.
//
// Antes esto era un <iframe> de Google Maps con ?q=<direccion>, que solo
// acepta UNA consulta: por eso se veía únicamente la ubicación de una
// propiedad. Ahora usamos Leaflet + OpenStreetMap (sin API key) y dibujamos
// todos los marcadores a partir de las coordenadas guardadas en la base.
export default function MapaPropiedades({ propiedades = [], alto = '72vh' }) {
  const contenedorRef = useRef(null)
  const mapaRef = useRef(null)
  const capaRef = useRef(null)

  const conCoords = propiedades.filter(
    (p) => typeof p.latitud === 'number' && typeof p.longitud === 'number'
  )
  // Clave estable: si cambia el set de propiedades, redibujamos.
  const clave = conCoords.map((p) => p.id).join(',')

  useEffect(() => {
    let cancelado = false

    async function dibujar() {
      const L = (await import('leaflet')).default
      if (cancelado || !contenedorRef.current) return

      // Crear el mapa una sola vez.
      if (!mapaRef.current) {
        mapaRef.current = L.map(contenedorRef.current, {
          scrollWheelZoom: false, // no secuestrar el scroll de la página
          attributionControl: true,
        }).setView([CENTRO_POSADAS.lat, CENTRO_POSADAS.lng], 13)

        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
          maxZoom: 19,
          attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
        }).addTo(mapaRef.current)

        // El scroll con Ctrl/⌘ sí hace zoom.
        mapaRef.current.on('click', () => mapaRef.current.scrollWheelZoom.enable())
        mapaRef.current.on('mouseout', () => mapaRef.current.scrollWheelZoom.disable())
      }

      const mapa = mapaRef.current

      // Limpiar marcadores anteriores.
      if (capaRef.current) capaRef.current.remove()
      capaRef.current = L.layerGroup().addTo(mapa)

      if (conCoords.length === 0) {
        mapa.setView([CENTRO_POSADAS.lat, CENTRO_POSADAS.lng], 13)
        return
      }

      const puntos = []
      for (const p of conCoords) {
        const icono = L.divIcon({
          className: 'pin-prop-wrap',
          html: `<span class="pin-prop"><span class="pin-prop-punta"></span></span>`,
          iconSize: [30, 40],
          iconAnchor: [15, 38],
          popupAnchor: [0, -36],
        })

        const marcador = L.marker([p.latitud, p.longitud], { icon: icono, title: p.titulo })

        marcador.bindPopup(
          `<a class="pop-prop" href="/propiedad/${p.id}">
             <img src="${escapar(imagenPrincipal(p))}" alt="" class="pop-prop-foto" />
             <span class="pop-prop-cuerpo">
               <span class="pop-prop-zona">${escapar(p.zona || '')}</span>
               <span class="pop-prop-titulo">${escapar(p.titulo || '')}</span>
               <span class="pop-prop-precio">${escapar(formatPrecio(p))}</span>
             </span>
           </a>`,
          { className: 'pop-prop-envoltorio', maxWidth: 260 }
        )

        marcador.addTo(capaRef.current)
        puntos.push([p.latitud, p.longitud])
      }

      // Encuadrar todos los marcadores.
      if (puntos.length === 1) {
        mapa.setView(puntos[0], 15)
      } else {
        mapa.fitBounds(L.latLngBounds(puntos), { padding: [55, 55], maxZoom: 16 })
      }
      // El contenedor puede haber cambiado de tamaño mientras cargaba.
      setTimeout(() => mapa.invalidateSize(), 60)
    }

    dibujar()
    return () => { cancelado = true }
  }, [clave, conCoords])

  // Desmontar el mapa al salir.
  useEffect(() => {
    return () => {
      if (mapaRef.current) {
        mapaRef.current.remove()
        mapaRef.current = null
      }
    }
  }, [])

  const sinUbicar = propiedades.length - conCoords.length

  return (
    <div className="mapa-bloque">
      <div ref={contenedorRef} className="mapa-lienzo" style={{ height: alto }} />

      <p className="mapa-nota">
        <span aria-hidden="true">📍</span>{' '}
        {conCoords.length === 0
          ? 'Ninguna de las propiedades filtradas tiene ubicación cargada todavía.'
          : `${conCoords.length} ${conCoords.length === 1 ? 'propiedad ubicada' : 'propiedades ubicadas'} en el mapa.`}
        {sinUbicar > 0 && conCoords.length > 0 && ` ${sinUbicar} sin ubicación cargada.`}
        {' '}Las posiciones son aproximadas: indican la zona, no la dirección exacta.
      </p>
    </div>
  )
}

function escapar(texto) {
  return String(texto ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
}
