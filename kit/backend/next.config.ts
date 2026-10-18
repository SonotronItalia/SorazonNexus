import { withPayload } from '@payloadcms/next/withPayload'
import type { NextConfig } from 'next'

// Il backend non ha pagine pubbliche: la radice porta al pannello.
// Se il tuo next.config.ts originale aveva altre opzioni (webpack, extensionAlias), tienile qui.
const nextConfig: NextConfig = {
  output: 'standalone',
  async redirects() {
    return [{ source: '/', destination: '/admin', permanent: false }]
  },
}

export default withPayload(nextConfig, { devBundleServerPackages: false })
