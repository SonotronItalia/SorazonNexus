import type { Seo } from '@/payload-types'

import type { VoceSitemap } from '@/lib/content'

import { LINGUA_PRINCIPALE, percorsoDoc } from './lingue'
import { nonIndicizzare } from './seo'

/**
 * Indirizzi della sitemap per pagine o notizie: l'italiano sempre, le altre lingue attive solo se
 * il documento è tradotto (slug nella lingua) e non nascosto in quella lingua. Le pagine escluse in "SEO e motori AI" restano fuori.
 */
export const vociSitemap = (
  docs: VoceSitemap[],
  raccolta: 'pages' | 'posts',
  attive: string[],
  seo: Seo | null,
  sito: string,
  quando: string,
) =>
  docs.flatMap((d) =>
    attive.flatMap((lingua) => {
      const slug = d.slug?.[lingua]
      if (!slug) return []
      if (lingua !== LINGUA_PRINCIPALE && d.nascosta?.[lingua]) return []
      const percorso = percorsoDoc(lingua, slug, raccolta)
      if (nonIndicizzare(percorso, seo)) return []
      return [{ loc: `${sito}${percorso === '/' ? '/' : percorso}`, lastmod: d.updatedAt || quando }]
    }),
  )
