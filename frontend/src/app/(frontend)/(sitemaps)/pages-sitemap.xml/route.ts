import { getServerSideSitemap } from 'next-sitemap'

import { getPagesForSitemap } from '@/lib/content'
import { getServerSideURL } from '@/utilities/getURL'

// Non generata in build: dati in cache con il tag "pages-sitemap"
export const dynamic = 'force-dynamic'

export async function GET() {
  const SITE_URL = getServerSideURL()
  const dateFallback = new Date().toISOString()

  const pages = await getPagesForSitemap()

  const sitemap = [
    { loc: `${SITE_URL}/posts`, lastmod: dateFallback },
    ...pages
      .filter((page) => Boolean(page?.slug))
      .map((page) => ({
        loc: page.slug === 'home' ? `${SITE_URL}/` : `${SITE_URL}/${page.slug}`,
        lastmod: page.updatedAt || dateFallback,
      })),
  ]

  return getServerSideSitemap(sitemap)
}
