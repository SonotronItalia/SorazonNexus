/**
 * Voci dell'admin i cui permessi si decidono nella sezione "Ruoli e permessi".
 * chiave: nome del gruppo di caselle nel ruolo (senza trattini: diventa una colonna del database).
 * azioni: le caselle disponibili (le globali non si creano né si eliminano).
 * redattore: permessi del ruolo "Redattore" creato dalla migrazione (come prima dei ruoli personalizzati).
 */
export type Azione = 'vede' | 'crea' | 'modifica' | 'elimina'

export type Risorsa = {
  slug: string
  chiave: string
  etichetta: string
  azioni: Azione[]
  redattore: Azione[]
}

const TUTTE: Azione[] = ['vede', 'crea', 'modifica', 'elimina']
const GLOBALE: Azione[] = ['vede', 'modifica']

export const RISORSE: Risorsa[] = [
  { slug: 'pages', chiave: 'pages', etichetta: 'Pagine', azioni: TUTTE, redattore: TUTTE },
  { slug: 'posts', chiave: 'posts', etichetta: 'Notizie', azioni: TUTTE, redattore: TUTTE },
  { slug: 'centri', chiave: 'centri', etichetta: 'Centri', azioni: TUTTE, redattore: TUTTE },
  { slug: 'media', chiave: 'media', etichetta: 'Immagini e file', azioni: TUTTE, redattore: TUTTE },
  { slug: 'forms', chiave: 'forms', etichetta: 'Moduli', azioni: TUTTE, redattore: TUTTE },
  {
    slug: 'form-submissions',
    chiave: 'formSubmissions',
    etichetta: 'Richieste ricevute',
    azioni: ['vede', 'elimina'],
    redattore: ['vede', 'elimina'],
  },
  { slug: 'colori', chiave: 'colori', etichetta: 'Colori del sito', azioni: TUTTE, redattore: TUTTE },
  { slug: 'effetti', chiave: 'effetti', etichetta: 'Effetti', azioni: TUTTE, redattore: TUTTE },
  { slug: 'torna-su', chiave: 'tornaSu', etichetta: 'Pulsante torna su', azioni: GLOBALE, redattore: GLOBALE },
  { slug: 'impostazioni', chiave: 'impostazioni', etichetta: 'Impostazioni del sito', azioni: GLOBALE, redattore: GLOBALE },
  {
    slug: 'impostazioni-analisi',
    chiave: 'impostazioniAnalisi',
    etichetta: 'Impostazioni: scheda "Analisi e pubblicità"',
    azioni: ['modifica'],
    redattore: [],
  },
  { slug: 'header', chiave: 'header', etichetta: 'Menu principale', azioni: GLOBALE, redattore: GLOBALE },
  { slug: 'footer', chiave: 'footer', etichetta: 'Piè di pagina', azioni: GLOBALE, redattore: GLOBALE },
  { slug: 'seo', chiave: 'seo', etichetta: 'SEO e motori AI', azioni: GLOBALE, redattore: [] },
  { slug: 'categories', chiave: 'categories', etichetta: 'Categorie', azioni: TUTTE, redattore: [] },
  { slug: 'tipi-effetto', chiave: 'tipiEffetto', etichetta: 'Tipi di effetto (codice)', azioni: TUTTE, redattore: [] },
  { slug: 'redirects', chiave: 'redirects', etichetta: 'Reindirizzamenti', azioni: TUTTE, redattore: [] },
  { slug: 'search', chiave: 'search', etichetta: 'Indice di ricerca', azioni: TUTTE, redattore: [] },
  { slug: 'users', chiave: 'users', etichetta: 'Utenti', azioni: TUTTE, redattore: [] },
  { slug: 'ruoli', chiave: 'ruoli', etichetta: 'Ruoli e permessi', azioni: TUTTE, redattore: [] },
]

export const risorsa = (slug: string): Risorsa => {
  const r = RISORSE.find((x) => x.slug === slug)
  if (!r) throw new Error(`Risorsa "${slug}" non elencata in access/risorse.ts`)
  return r
}
