import type { NextConfig } from 'next'

import redirects from './redirects.js'

// Indirizzo INTERNO del backend. In Docker è http://backend:3000; in locale http://localhost:3001.
const INTERNAL = process.env.PAYLOAD_INTERNAL_URL || 'http://localhost:3001'

const nextConfig: NextConfig = {
  output: 'standalone',
  redirects,
  async rewrites() {
    return [
      // Le immagini passano dal dominio del sito: il browser non conosce mai l'indirizzo del backend
      { source: '/media/:path*', destination: `${INTERNAL}/api/media/file/:path*` },
      // L'invio dei moduli del sito (blocco Form) arriva da qui al backend
      { source: '/api/form-submissions', destination: `${INTERNAL}/api/form-submissions` },
    ]
  },
}

export default nextConfig
