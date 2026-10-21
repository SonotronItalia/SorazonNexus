import { withPayload } from '@payloadcms/next/withPayload'
import type { NextConfig } from 'next'

// Il backend non ha pagine pubbliche: la radice porta al pannello.
// Se il tuo next.config.ts originale aveva altre opzioni (webpack, extensionAlias), tienile qui.
const nextConfig: NextConfig = {
  // Niente "X-Powered-By: Next.js": non dire a chi attacca che tecnologia usiamo
  poweredByHeader: false,
  output: 'standalone',
  // I manuali della pagina "Guida" si leggono dal disco: vanno copiati nella build
  outputFileTracingIncludes: { '/**/*': ['./src/guida/**/*.md'] },
  async redirects() {
    return [{ source: '/', destination: '/admin', permanent: false }]
  },
}

export default withPayload(nextConfig, { devBundleServerPackages: false })
