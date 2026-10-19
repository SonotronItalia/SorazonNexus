import type { MetadataRoute } from 'next'

import { getServerSideURL } from '@/utilities/getURL'

// Sostituisce next-sitemap in postbuild, che fissava l'indirizzo del sito al momento della build
export const dynamic = 'force-dynamic'

// Pagine tecniche fuori dagli indici: API, anteprima delle bozze, risultati di ricerca
const ESCLUSI = ['/api/', '/next/', '/search']

// Crawler dei motori di risposta AI, permessi in modo esplicito (GEO): il sito vuole essere
// citato dagli assistenti. Per escluderne uno basta spostarlo in una regola "disallow".
const CRAWLER_AI = [
  'GPTBot',
  'OAI-SearchBot',
  'ChatGPT-User',
  'ClaudeBot',
  'Claude-SearchBot',
  'Claude-User',
  'PerplexityBot',
  'Perplexity-User',
  'Google-Extended',
  'Applebot-Extended',
  'Bingbot',
]

export default function robots(): MetadataRoute.Robots {
  const SITE_URL = getServerSideURL()
  return {
    rules: [
      { userAgent: '*', allow: '/', disallow: ESCLUSI },
      { userAgent: CRAWLER_AI, allow: '/', disallow: ESCLUSI },
    ],
    sitemap: [`${SITE_URL}/pages-sitemap.xml`, `${SITE_URL}/posts-sitemap.xml`],
    host: SITE_URL,
  }
}
