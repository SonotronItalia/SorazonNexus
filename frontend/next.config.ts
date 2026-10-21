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
    // Immagini ottimizzate in cache per un mese (browser, nginx, una CDN): il loro indirizzo
    // contiene la data di modifica, quindi un'immagine sostituita ha un indirizzo nuovo
    minimumCacheTTL: 2678400,
  },
  async headers() {
    // File fissi del sito (loghi predefiniti, bandiere, icona): un giorno, poi il browser usa la
    // copia che ha e la rinnova in background. I file di /_next/static sono già "immutable"
    const unGiorno = {
      key: 'Cache-Control',
      value: 'public, max-age=86400, stale-while-revalidate=604800',
    }
    return [
      { source: '/bandiere/:file*', headers: [unGiorno] },
      { source: '/logo_sorazon.svg', headers: [unGiorno] },
      { source: '/logo_sorazon_neg.svg', headers: [unGiorno] },
      { source: '/favicon.svg', headers: [unGiorno] },
    ]
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
