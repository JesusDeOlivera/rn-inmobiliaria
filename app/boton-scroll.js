'use client'

// Botón que hace scroll suave a una sección de la misma página.
// Es lo único del hero que necesita JavaScript.
export default function BotonScroll({ target, className, children }) {
  return (
    <button
      type="button"
      className={className}
      onClick={() => document.getElementById(target)?.scrollIntoView({ behavior: 'smooth' })}
    >
      {children}
    </button>
  )
}
