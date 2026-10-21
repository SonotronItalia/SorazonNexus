import type { NextConfig } from 'next'

// Indirizzo INTERNO del backend. In Docker è http://backend:3000; in locale http://localhost:3001.
const INTERNAL = process.env.PAYLOAD_INTERNAL_URL || 'http://localhost:3001'

const nextConfig: NextConfig = {
  // Niente "X-Powered-By: Next.js": non dire a chi attacca che tecnologia usiamo
  poweredByHeader: false,
  output: 'standalone',
  images: {
    // /media/** arriva dal backend con ?updatedAt per rinnovare la cache; gli altri file locali senza query
    localPatterns: [{ pathname: '/media/**' }, { pathname: '/**', search: '' }],
    // ImageMedia usa quality={100}; da Next 16 il valore predefinito ammesso è solo 75
    qualities: [75, 100],
  },
  async redirects() {
    // La home è la pagina con slug "home": un solo indirizzo, niente contenuto duplicato
    return [{ source: '/home', destination: '/', permanent: true }]
  },
  async rewrites() {
    return [
      // Le immagini passano dal dominio del sito: il browser non conosce mai l'indirizzo del backend
      { source: '/media/:path*', destination: `${INTERNAL}/api/media/file/:path*` },
      // Loghi e icona (Impostazioni del sito > Marchio): file della raccolta "marchio"
      { source: '/marchio/:path*', destination: `${INTERNAL}/api/marchio/file/:path*` },
      // I browser chiedono /favicon.ico anche senza link: l'icona del sito in PNG
      { source: '/favicon.ico', destination: '/icone/32.png' },
      // L'invio dei moduli del sito (blocco Form) arriva da qui al backend
      { source: '/api/form-submissions', destination: `${INTERNAL}/api/form-submissions` },
    ]
  },
}

export default nextConfig