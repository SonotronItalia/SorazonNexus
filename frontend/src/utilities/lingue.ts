/**
 * Lingue del sito (stesso elenco di backend/src/lingue.ts). L'italiano non ha prefisso negli
 * indirizzi; le altre sì: /en/therapy. Quali sono attive lo decide il pannello ("Lingue e selettore").
 */
export const LINGUA_PRINCIPALE = 'it'

export const LINGUE: { codice: string; nome: string; bandiera: string; locale: string }[] = [
  { codice: 'it', nome: 'Italiano', bandiera: 'it', locale: 'it_IT' },
  { codice: 'en', nome: 'English', bandiera: 'gb', locale: 'en_GB' },
  { codice: 'de', nome: 'Deutsch', bandiera: 'de', locale: 'de_DE' },
  { codice: 'fr', nome: 'Français', bandiera: 'fr', locale: 'fr_FR' },
  { codice: 'es', nome: 'Español', bandiera: 'es', locale: 'es_ES' },
  { codice: 'pt', nome: 'Português', bandiera: 'pt', locale: 'pt_PT' },
  { codice: 'nl', nome: 'Nederlands', bandiera: 'nl', locale: 'nl_NL' },
  { codice: 'pl', nome: 'Polski', bandiera: 'pl', locale: 'pl_PL' },
  { codice: 'ro', nome: 'Română', bandiera: 'ro', locale: 'ro_RO' },
  { codice: 'cs', nome: 'Čeština', bandiera: 'cz', locale: 'cs_CZ' },
  { codice: 'el', nome: 'Ελληνικά', bandiera: 'gr', locale: 'el_GR' },
  { codice: 'sv', nome: 'Svenska', bandiera: 'se', locale: 'sv_SE' },
]

export const CODICI = new Set(LINGUE.map((l) => l.codice))
export const SECONDARIE = new Set(LINGUE.filter((l) => l.codice !== LINGUA_PRINCIPALE).map((l) => l.codice))

export const linguaValida = (codice: string | null | undefined) =>
  codice && CODICI.has(codice) ? codice : LINGUA_PRINCIPALE

// Percorso nella lingua: "/terapia" in italiano, "/en/therapy" in inglese ("/en" per la home)
export const conPrefisso = (lingua: string, percorso: string) => {
  if (lingua === LINGUA_PRINCIPALE) return percorso || '/'
  if (!percorso || percorso === '/') return `/${lingua}`
  return `/${lingua}${percorso.startsWith('/') ? '' : '/'}${percorso}`
}

// Percorso di una pagina o notizia dal suo slug
export const percorsoDoc = (lingua: string, slug: string, raccolta: 'pages' | 'posts' = 'pages') =>
  conPrefisso(lingua, raccolta === 'posts' ? `/posts/${slug}` : slug === 'home' ? '/' : `/${slug}`)

/** Bandiera e nome di una lingua (con la bandiera scelta nel pannello, se c'è) */
export type LinguaAttiva = { codice: string; nome: string; bandiera: string }
