'use client'

import { useCallback, useSyncExternalStore } from 'react'

// =============================================================
//  Hook único para manejar favoritos (guardados en localStorage).
//  Reemplaza la lógica duplicada que había en Navbar, propiedades,
//  catálogo, favoritos y el detalle de propiedad.
//
//  Usa useSyncExternalStore: localStorage es un "store externo" y
//  React se suscribe a sus cambios (evento custom en la misma
//  pestaña, evento 'storage' entre pestañas).
// =============================================================

const KEY = 'rn_favoritos'
const EVENTO = 'rn_favoritos_change'

const VACIO = []
let cache = { raw: null, valor: VACIO }

function leer() {
  if (typeof window === 'undefined') return []
  let raw = null
  try {
    raw = window.localStorage.getItem(KEY)
  } catch {
    return cache.valor
  }
  // Memoizamos para que getSnapshot devuelva la misma referencia
  // mientras el contenido no cambie (requisito de useSyncExternalStore).
  if (raw === cache.raw) return cache.valor
  let parsed = []
  try {
    const p = raw ? JSON.parse(raw) : []
    parsed = Array.isArray(p) ? p : []
  } catch {
    parsed = []
  }
  cache = { raw, valor: parsed }
  return parsed
}

function guardar(ids) {
  try {
    window.localStorage.setItem(KEY, JSON.stringify(ids))
    window.dispatchEvent(new CustomEvent(EVENTO))
  } catch {
    /* almacenamiento no disponible (modo incógnito, etc.) */
  }
}

function subscribe(callback) {
  window.addEventListener(EVENTO, callback)
  window.addEventListener('storage', callback)
  return () => {
    window.removeEventListener(EVENTO, callback)
    window.removeEventListener('storage', callback)
  }
}

function getServerSnapshot() {
  return VACIO
}

export function useFavoritos() {
  const favoritos = useSyncExternalStore(subscribe, leer, getServerSnapshot)

  const esFavorito = useCallback(
    (id) => favoritos.some((f) => String(f) === String(id)),
    [favoritos]
  )

  const toggleFavorito = useCallback((id, evento) => {
    if (evento?.preventDefault) evento.preventDefault()
    const actuales = leer()
    const existe = actuales.some((f) => String(f) === String(id))
    guardar(
      existe
        ? actuales.filter((f) => String(f) !== String(id))
        : [...actuales, id]
    )
  }, [])

  const quitarFavorito = useCallback((id) => {
    guardar(leer().filter((f) => String(f) !== String(id)))
  }, [])

  return { favoritos, esFavorito, toggleFavorito, quitarFavorito }
}
