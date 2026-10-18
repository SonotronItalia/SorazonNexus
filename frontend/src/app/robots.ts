import type { MetadataRoute } from 'next'

import { getServerSideURL } from '@/utilities/getURL'

// Sostituisce next-sitemap in postbuild, che fissava l'indirizzo del sito al momento della build
export const dynamic = 'force-dynamic'

export default function robots(): MetadataRoute.Robots {
  const SITE_URL = getServerSideURL()
  return {
    rules: { userAgent: '*', allow: '/' },
    sitemap: [`${SITE_URL}/pages-sitemap.xml`, `${SITE_URL}/posts-sitemap.xml`],
  }
}
