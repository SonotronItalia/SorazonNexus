/**
 * Lingue in cui il sito si può tradurre. L'italiano è la lingua principale (indirizzi senza
 * prefisso); le altre hanno il prefisso (/en/…) e si attivano dalla voce "Lingue" del pannello.
 * Una lingua nuova va aggiunta qui (codice, nomi, bandiere) con una migrazione: Postgres
 * conserva l'elenco delle lingue nello schema.
 * Lo stesso elenco (codici e bandiere) è in frontend/src/utilities/lingue.ts.
 */
export type Lingua = {
  codice: string
  /** Nome nella lingua stessa, per il selettore del sito */
  nome: string
  /** Nome in italiano, per il pannello */
  etichetta: string
  /** Bandiere tra cui scegliere (codici ISO dei paesi, la prima è la predefinita) */
  bandiere: string[]
}

export const LINGUA_PRINCIPALE = 'it'

export const LINGUE: Lingua[] = [
  { codice: 'it', nome: 'Italiano', etichetta: 'Italiano', bandiere: ['it', 'ch'] },
  { codice: 'en', nome: 'English', etichetta: 'Inglese', bandiere: ['gb', 'us', 'ie'] },
  { codice: 'de', nome: 'Deutsch', etichetta: 'Tedesco', bandiere: ['de', 'at', 'ch'] },
  { codice: 'fr', nome: 'Français', etichetta: 'Francese', bandiere: ['fr', 'be', 'ch'] },
  { codice: 'es', nome: 'Español', etichetta: 'Spagnolo', bandiere: ['es', 'mx', 'ar'] },
  { codice: 'pt', nome: 'Português', etichetta: 'Portoghese', bandiere: ['pt', 'br'] },
  { codice: 'nl', nome: 'Nederlands', etichetta: 'Olandese', bandiere: ['nl', 'be'] },
  { codice: 'pl', nome: 'Polski', etichetta: 'Polacco', bandiere: ['pl'] },
  { codice: 'ro', nome: 'Română', etichetta: 'Rumeno', bandiere: ['ro', 'md'] },
  { codice: 'cs', nome: 'Čeština', etichetta: 'Ceco', bandiere: ['cz'] },
  { codice: 'el', nome: 'Ελληνικά', etichetta: 'Greco', bandiere: ['gr', 'cy'] },
  { codice: 'sv', nome: 'Svenska', etichetta: 'Svedese', bandiere: ['se', 'fi'] },
]

// Nomi dei paesi delle bandiere, per il pannello
export const PAESI: Record<string, string> = {
  it: 'Italia',
  ch: 'Svizzera',
  gb: 'Regno Unito',
  us: 'Stati Uniti',
  ie: 'Irlanda',
  de: 'Germania',
  at: 'Austria',
  fr: 'Francia',
  be: 'Belgio',
  es: 'Spagna',
  mx: 'Messico',
  ar: 'Argentina',
  pt: 'Portogallo',
  br: 'Brasile',
  nl: 'Paesi Bassi',
  pl: 'Polonia',
  ro: 'Romania',
  md: 'Moldavia',
  cz: 'Repubblica Ceca',
  gr: 'Grecia',
  cy: 'Cipro',
  se: 'Svezia',
  fi: 'Finlandia',
}

export const LINGUE_TRADUCIBILI = LINGUE.filter((l) => l.codice !== LINGUA_PRINCIPALE)
