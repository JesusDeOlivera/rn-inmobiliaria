import { Geist, Geist_Mono } from 'next/font/google'
import './globals.css'
import Navbar from '../components/Navbar'
import { SITE_URL, SITE_NAME, SITE_DESCRIPTION } from '../lib/config'

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
  metadataBase: new URL(SITE_URL),
  title: {
    default: SITE_NAME,
    template: `%s | ${SITE_NAME}`,
  },
  description: SITE_DESCRIPTION,
  appleWebApp: { capable: true, statusBarStyle: 'default', title: SITE_NAME },
  formatDetection: { telephone: false, email: false, address: false },
  openGraph: {
    type: 'website',
    locale: 'es_AR',
    siteName: SITE_NAME,
    url: SITE_URL,
  },
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
    <html lang="es" data-scroll-behavior="smooth" className={`${geistSans.variable} ${geistMono.variable}`}>
      <body style={{ margin: 0, minHeight: '100vh', fontFamily: 'system-ui, sans-serif' }}>

        {/* Navbar compartido — aparece en TODAS las páginas automáticamente */}
        <Navbar />

        {/* Contenido de cada página */}
        {children}

      </body>
    </html>
  )
}