import { getServerSideSitemap } from 'next-sitemap'

import { getLingue, getPagesForSitemap, getSeo } from '@/lib/content'
import { getServerSideURL } from '@/utilities/getURL'
import { conPrefisso } from '@/utilities/lingue'
import { lingueAttive } from '@/utilities/lingueAttive'
import { vociSitemap } from '@/utilities/sitemap'

// Non generata in build: dati in cache con il tag "pages-sitemap"
export const dynamic = 'force-dynamic'

export async function GET() {
  const SITE_URL = getServerSideURL()
  const dateFallback = new Date().toISOString()

  // Pagine in tutte le lingue attive; le escluse in SEO e motori AI restano fuori
  const [pages, seo, lingue] = await Promise.all([getPagesForSitemap(), getSeo(), getLingue()])
  const attive = lingueAttive(lingue).map((l) => l.codice)

  const sitemap = [
    { loc: `${SITE_URL}${conPrefisso('it', '/posts')}`, lastmod: dateFallback },
    ...vociSitemap(pages, 'pages', attive, seo, SITE_URL, dateFallback),
  ]

  return getServerSideSitemap(sitemap)
}
