import { mediaSrc } from '@/lib/api'

/**
 * URL di un file media, sempre relativo al sito (/media/...): il browser non conosce il backend.
 * cacheTag (di solito updatedAt) cambia l'URL quando il file viene sostituito.
 */
export const getMediaUrl = (url: string | null | undefined, cacheTag?: string | null): string => {
  const src = mediaSrc(url)
  if (!src) return ''
  return cacheTag ? `${src}?${encodeURIComponent(cacheTag)}` : src
}
