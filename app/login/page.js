'use client'
import { useState } from 'react'
import { supabase } from '../../lib/supabase'
import { useRouter } from 'next/navigation'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState(null)
  const router = useRouter()

  const handleLogin = async (e) => {
    e.preventDefault()
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) setError("Datos incorrectos")
    else router.push('/admin')
  }

  return (
    <main className="min-h-screen flex items-center justify-center bg-slate-900 p-6">
      <form onSubmit={handleLogin} className="bg-white p-10 rounded-[2rem] shadow-2xl w-full max-w-md">
        <h1 className="text-3xl font-black mb-2 text-blue-900 uppercase tracking-tighter">RN Admin</h1>
        <p className="text-slate-500 mb-8 font-medium">Ingresá para gestionar propiedades.</p>
        
        {error && <p className="bg-red-50 text-red-500 p-3 rounded-xl mb-4 text-sm font-bold">{error}</p>}
        
        <input type="email" placeholder="Email" className="w-full p-4 border border-slate-200 mb-4 rounded-xl outline-none focus:border-blue-500" onChange={(e) => setEmail(e.target.value)} required />
        <input type="password" placeholder="Contraseña" className="w-full p-4 border border-slate-200 mb-6 rounded-xl outline-none focus:border-blue-500" onChange={(e) => setPassword(e.target.value)} required />
        
        <button className="w-full bg-blue-600 text-white p-4 rounded-xl font-bold hover:bg-blue-700 transition-all shadow-lg shadow-blue-200">
          Iniciar Sesión
        </button>
      </form>
    </main>
  )
}