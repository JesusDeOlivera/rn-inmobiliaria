'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { supabase } from '../../lib/supabase'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState(null)
  const [cargando, setCargando] = useState(false)
  const router = useRouter()

  const handleLogin = async (e) => {
    e.preventDefault()
    setCargando(true)
    setError(null)
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    setCargando(false)
    if (error) {
      setError(
        error.message?.toLowerCase().includes('invalid')
          ? 'Email o contraseña incorrectos.'
          : 'No pudimos iniciar sesión. Probá de nuevo en un momento.'
      )
    } else {
      router.push('/admin')
    }
  }

  return (
    <main className="login trama-tierra">
      <form onSubmit={handleLogin} className="login-tarjeta">
        <span className="login-marca">RN</span>
        <h1 className="login-titulo">Panel de administración</h1>
        <p className="login-bajada">Ingresá para gestionar el catálogo.</p>

        {error && (
          <p role="alert" className="mensaje mensaje-error" style={{ marginBottom: 18 }}>
            {error}
          </p>
        )}

        <div className="login-campo">
          <label className="etiqueta" htmlFor="login-email">Email</label>
          <input
            id="login-email" type="email" className="campo"
            placeholder="tu@email.com" autoComplete="email"
            value={email} onChange={(e) => setEmail(e.target.value)} required
          />
        </div>

        <div className="login-campo">
          <label className="etiqueta" htmlFor="login-password">Contraseña</label>
          <input
            id="login-password" type="password" className="campo"
            placeholder="••••••••" autoComplete="current-password"
            value={password} onChange={(e) => setPassword(e.target.value)} required
          />
        </div>

        <button type="submit" disabled={cargando} className="btn btn-primario btn-bloque" style={{ marginTop: 6 }}>
          {cargando ? 'Ingresando…' : 'Iniciar sesión'}
        </button>

        <Link href="/" className="login-volver">← Volver al sitio</Link>
      </form>

      <style>{`
        .login {
          min-height: calc(100vh - var(--nav-alto));
          display: grid;
          place-items: center;
          padding: clamp(28px, 6vw, 64px) 20px;
          background: var(--selva-900);
        }
        .login-tarjeta {
          width: 100%;
          max-width: 430px;
          background: var(--superficie);
          border-radius: var(--r-xl);
          padding: clamp(30px, 5vw, 46px);
          box-shadow: var(--sombra-xl);
          display: grid;
          gap: 16px;
        }
        .login-marca {
          display: grid; place-items: center;
          width: 52px; height: 52px;
          border-radius: 16px;
          background: var(--tierra-600); color: #fff;
          font-family: var(--fuente-titulo);
          font-size: 1.25rem; font-weight: 600;
          margin-bottom: 4px;
        }
        .login-titulo { font-size: clamp(1.5rem, 4vw, 1.9rem); }
        .login-bajada { color: var(--tinta-500); font-size: 0.96rem; margin-bottom: 6px; }
        .login-campo { display: grid; }
        .login-volver {
          text-align: center;
          margin-top: 8px;
          font-size: 0.88rem;
          color: var(--tinta-400);
          text-decoration: none;
        }
        .login-volver:hover { color: var(--tierra-600); }
      `}</style>
    </main>
  )
}
