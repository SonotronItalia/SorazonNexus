import { getServerSideSitemap } from 'next-sitemap'

import { getPagesForSitemap, getSeo } from '@/lib/content'
import { nonIndicizzare } from '@/utilities/seo'
import { getServerSideURL } from '@/utilities/getURL'

// Non generata in build: dati in cache con il tag "pages-sitemap"
export const dynamic = 'force-dynamic'

export async function GET() {
  const SITE_URL = getServerSideURL()
  const dateFallback = new Date().toISOString()

  // Le pagine escluse in SEO e motori AI non vanno nella mappa del sito
  const [pages, seo] = await Promise.all([getPagesForSitemap(), getSeo()])

  const sitemap = [
    { loc: `${SITE_URL}/posts`, lastmod: dateFallback },
    ...pages
      .filter((page) => Boolean(page?.slug))
      .filter((page) => !nonIndicizzare(page.slug === 'home' ? '/' : `/${page.slug}`, seo))
      .map((page) => ({
        loc: page.slug === 'home' ? `${SITE_URL}/` : `${SITE_URL}/${page.slug}`,
        lastmod: page.updatedAt || dateFallback,
      })),
  ]

  return getServerSideSitemap(sitemap)
}
