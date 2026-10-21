import { getServerSideSitemap } from 'next-sitemap'

import { getPostsForSitemap, getSeo } from '@/lib/content'
import { nonIndicizzare } from '@/utilities/seo'
import { getServerSideURL } from '@/utilities/getURL'

// Non generata in build: dati in cache con il tag "posts-sitemap"
export const dynamic = 'force-dynamic'

export async function GET() {
  const SITE_URL = getServerSideURL()
  const dateFallback = new Date().toISOString()

  // Le notizie escluse in SEO e motori AI non vanno nella mappa del sito
  const [posts, seo] = await Promise.all([getPostsForSitemap(), getSeo()])

  const sitemap = posts
    .filter((post) => Boolean(post?.slug))
    .filter((post) => !nonIndicizzare(`/posts/${post.slug}`, seo))
    .map((post) => ({
      loc: `${SITE_URL}/posts/${post.slug}`,
      lastmod: post.updatedAt || dateFallback,
    }))

  return getServerSideSitemap(sitemap)
}
