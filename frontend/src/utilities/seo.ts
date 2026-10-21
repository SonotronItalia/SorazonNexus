import type { Seo } from '@/payload-types'

import { DESCRIZIONE_SITO, SITE_NAME } from './mergeOpenGraph'

// Crawler di ogni assistente AI (le chiavi sono quelle di "SEO e motori AI" > Motori AI)
export const CRAWLER_AI: Record<string, string[]> = {
  chatgpt: ['GPTBot', 'OAI-SearchBot', 'ChatGPT-User'],
  claude: ['ClaudeBot', 'Claude-SearchBot', 'Claude-User'],
  perplexity: ['PerplexityBot', 'Perplexity-User'],
  gemini: ['Google-Extended'],
  apple: ['Applebot-Extended'],
  meta: ['meta-externalagent'],
  commonCrawl: ['CCBot'],
}

// Pagine tecniche sempre fuori dagli indici: API, anteprima delle bozze, risultati di ricerca
export const SEMPRE_ESCLUSI = ['/api/', '/next/', '/search']

// Nome e descrizione del sito dal CMS, con i valori nel codice come riserva
export const nomeSito = (seo: Seo | null | undefined) => seo?.nomeSito?.trim() || SITE_NAME
export const descrizioneSito = (seo: Seo | null | undefined) =>
  seo?.descrizioneSito?.trim() || DESCRIZIONE_SITO

// Titolo della pagina dal modello ("{pagina} | {sito}"); senza titolo (Home) solo il nome del sito
export const titoloPagina = (pagina: string | null | undefined, seo: Seo | null | undefined) => {
  const sito = nomeSito(seo)
  if (!pagina) return sito
  if (pagina.includes(sito)) return pagina
  const modello = seo?.modelloTitolo?.includes('{pagina}') ? seo.modelloTitolo : '{pagina} | {sito}'
  return modello.replaceAll('{pagina}', pagina).replaceAll('{sito}', sito).trim()
}

// Percorsi esclusi dall'admin, normalizzati ("/promo/" -> "/promo")
export const percorsiEsclusi = (seo: Seo | null | undefined) =>
  (seo?.ricerca?.escluse ?? [])
    .map((e) => e.percorso?.trim().replace(/\/+$/, ''))
    .filter((p): p is string => Boolean(p))

// La pagina non va indicizzata: tutto il sito nascosto, o il percorso (o una sua sottopagina) escluso
export const nonIndicizzare = (percorso: string, seo: Seo | null | undefined) => {
  if (seo?.ricerca?.nascondiSito) return true
  const p = percorso.replace(/\/+$/, '') || '/'
  return percorsiEsclusi(seo).some((e) => p === e || p.startsWith(`${e}/`))
}

// Crawler degli assistenti AI ammessi e bloccati (tutti ammessi se il CMS non risponde)
export const crawlerAI = (seo: Seo | null | undefined) => {
  const ammessi: string[] = []
  const bloccati: string[] = []
  for (const [chiave, crawler] of Object.entries(CRAWLER_AI)) {
    const scelta = (seo?.ai?.ammessi as Record<string, boolean | null | undefined> | undefined)?.[
      chiave
    ]
    ;(scelta === false ? bloccati : ammessi).push(...crawler)
  }
  return { ammessi, bloccati }
}
