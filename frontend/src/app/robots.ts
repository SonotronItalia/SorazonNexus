import type { MetadataRoute } from 'next'

import { getSeo } from '@/lib/content'
import { getServerSideURL } from '@/utilities/getURL'
import { crawlerAI, percorsiEsclusi, SEMPRE_ESCLUSI } from '@/utilities/seo'

// Sostituisce next-sitemap in postbuild, che fissava l'indirizzo del sito al momento della build
export const dynamic = 'force-dynamic'

/**
 * robots.txt dalle scelte di "SEO e motori AI": pagine escluse, assistenti AI ammessi (citati in
 * modo esplicito: il sito vuole essere citato, GEO) o bloccati, sito nascosto del tutto.
 */
export default async function robots(): Promise<MetadataRoute.Robots> {
  const SITE_URL = getServerSideURL()
  const seo = await getSeo()

  if (seo?.ricerca?.nascondiSito) {
    return { rules: [{ userAgent: '*', disallow: '/' }] }
  }

  const esclusi = [...SEMPRE_ESCLUSI, ...percorsiEsclusi(seo)]
  const { ammessi, bloccati } = crawlerAI(seo)
  return {
    rules: [
      { userAgent: '*', allow: '/', disallow: esclusi },
      ...(ammessi.length
        ? [{ userAgent: [...ammessi, 'Bingbot'], allow: '/', disallow: esclusi }]
        : []),
      ...(bloccati.length ? [{ userAgent: bloccati, disallow: '/' }] : []),
    ],
    sitemap: [`${SITE_URL}/pages-sitemap.xml`, `${SITE_URL}/posts-sitemap.xml`],
    host: SITE_URL,
  }
}
