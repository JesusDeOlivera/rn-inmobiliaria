import { Geist, Geist_Mono } from 'next/font/google'
import './globals.css'
import Navbar from '../components/Navbar'

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
  display: 'swap',
})

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
  display: 'swap',
})

export const metadata = {
  title: {
    default: 'RN Inmobiliaria',
    template: '%s | RN Inmobiliaria',
  },
  description: 'Tu agencia inmobiliaria de confianza en Misiones',
  appleWebApp: { capable: true, statusBarStyle: 'default', title: 'RN Inmobiliaria' },
  formatDetection: { telephone: false, email: false, address: false },
}

export const viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
  userScalable: true,
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#ffffff' },
    { media: '(prefers-color-scheme: dark)',  color: '#020617' },
  ],
  viewportFit: 'cover',
}

export default function RootLayout({ children }) {
  return (
    <html lang="es" className={`${geistSans.variable} ${geistMono.variable}`}>
      <body style={{ margin: 0, minHeight: '100vh', fontFamily: 'system-ui, sans-serif' }}>

        {/* Navbar compartido — aparece en TODAS las páginas automáticamente */}
        <Navbar />

        {/* Contenido de cada página */}
        {children}

      </body>
    </html>
  )
}