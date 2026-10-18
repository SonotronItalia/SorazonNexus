import { getServerSideSitemap } from 'next-sitemap'

import { getPostsForSitemap } from '@/lib/content'
import { getServerSideURL } from '@/utilities/getURL'

// Non generata in build: dati in cache con il tag "posts-sitemap"
export const dynamic = 'force-dynamic'

export async function GET() {
  const SITE_URL = getServerSideURL()
  const dateFallback = new Date().toISOString()

  const posts = await getPostsForSitemap()

  const sitemap = posts
    .filter((post) => Boolean(post?.slug))
    .map((post) => ({
      loc: `${SITE_URL}/posts/${post.slug}`,
      lastmod: post.updatedAt || dateFallback,
    }))

  return getServerSideSitemap(sitemap)
}
