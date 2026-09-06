'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
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
    <main className="min-h-screen flex items-center justify-center bg-slate-900 p-6">
      <form onSubmit={handleLogin} className="bg-white p-10 rounded-[2rem] shadow-2xl w-full max-w-md">
        <h1 className="text-3xl font-black mb-2 text-blue-900 uppercase tracking-tighter">RN Admin</h1>
        <p className="text-slate-500 mb-8 font-medium">Ingresá para gestionar propiedades.</p>

        {error && (
          <p role="alert" className="bg-red-50 text-red-500 p-3 rounded-xl mb-4 text-sm font-bold">
            {error}
          </p>
        )}

        <label htmlFor="login-email" className="sr-only">Email</label>
        <input
          id="login-email" type="email" placeholder="Email" autoComplete="email"
          className="w-full p-4 border border-slate-200 mb-4 rounded-xl outline-none focus:border-blue-500"
          value={email} onChange={(e) => setEmail(e.target.value)} required
        />

        <label htmlFor="login-password" className="sr-only">Contraseña</label>
        <input
          id="login-password" type="password" placeholder="Contraseña" autoComplete="current-password"
          className="w-full p-4 border border-slate-200 mb-6 rounded-xl outline-none focus:border-blue-500"
          value={password} onChange={(e) => setPassword(e.target.value)} required
        />

        <button
          type="submit"
          disabled={cargando}
          className="w-full bg-blue-600 text-white p-4 rounded-xl font-bold hover:bg-blue-700 transition-all shadow-lg shadow-blue-200 disabled:opacity-60"
        >
          {cargando ? 'Ingresando...' : 'Iniciar Sesión'}
        </button>
      </form>
    </main>
  )
}
