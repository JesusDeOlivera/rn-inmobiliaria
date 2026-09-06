'use client'

import { useSyncExternalStore } from 'react'
import { supabase } from './supabase'

// Hook único para la sesión de Supabase en el navegador.
// Reemplaza el bloque getSession()/onAuthStateChange repetido en varias páginas.
//
// La sesión es un "store externo": mantenemos una copia a nivel de módulo y
// React se suscribe a los cambios con useSyncExternalStore.

let sesionActual = null
let inicializado = false
const listeners = new Set()

function notificar() {
  for (const l of listeners) l()
}

function iniciar() {
  if (inicializado) return
  inicializado = true
  supabase.auth.getSession().then(({ data: { session } }) => {
    sesionActual = session
    notificar()
  })
  supabase.auth.onAuthStateChange((_evento, session) => {
    sesionActual = session
    notificar()
  })
}

function subscribe(callback) {
  iniciar()
  listeners.add(callback)
  return () => listeners.delete(callback)
}

export function useSesion() {
  const sesion = useSyncExternalStore(
    subscribe,
    () => sesionActual,
    () => null
  )
  return { sesion }
}
