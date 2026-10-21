import { getServerSideSitemap } from 'next-sitemap'

import { getLingue, getPostsForSitemap, getSeo } from '@/lib/content'
import { getServerSideURL } from '@/utilities/getURL'
import { lingueAttive } from '@/utilities/lingueAttive'
import { vociSitemap } from '@/utilities/sitemap'

// Non generata in build: dati in cache con il tag "posts-sitemap"
export const dynamic = 'force-dynamic'

export async function GET() {
  const SITE_URL = getServerSideURL()
  const dateFallback = new Date().toISOString()

  // Notizie in tutte le lingue attive in cui sono tradotte; le escluse restano fuori
  const [posts, seo, lingue] = await Promise.all([getPostsForSitemap(), getSeo(), getLingue()])
  const attive = lingueAttive(lingue).map((l) => l.codice)

  return getServerSideSitemap(vociSitemap(posts, 'posts', attive, seo, SITE_URL, dateFallback))
}
