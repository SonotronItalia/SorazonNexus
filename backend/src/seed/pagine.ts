/**
 * Pagine del seed da file Markdown (src/seed/dati/pagine/*.md).
 *
 * In cima al file, tra due righe "---", un'intestazione YAML con i campi della pagina e gli stessi
 * nomi che hanno nel CMS (title, slug, hero, layout...), più "bozza: true" per non pubblicarla.
 * Convenzioni nei valori:
 * - un campo "richText" scritto come testo è Markdown (titoli, grassetto, corsivo, link, elenchi);
 * - "media:nomefile.jpg" è un'immagine di src/seed/media (elencata in dati/media.csv);
 * - "pagina:slug" è un collegamento a un'altra pagina.
 * - "colore:Nome" è un colore della tavolozza (dati/colori.csv, nell'admin "Colori del sito");
 * - "effetto:Nome" è un effetto della sezione "Effetti" (dati/effetti.csv);
 * - "modulo:Titolo" è un modulo di dati/moduli (es. "form: modulo:Contatti" nel blocco formBlock).
 * Sono Markdown anche "introContent" (testo sopra un modulo) e, nei moduli, "confirmationMessage"
 * e "message".
 * Sotto l'intestazione, il testo in Markdown diventa uno o più blocchi di testo:
 * "<!-- blocco -->" separa i blocchi, "<!-- colonna -->" divide un blocco in colonne affiancate.
 * Senza "layout" nell'intestazione i blocchi di testo sono tutta la pagina; con "layout", ogni
 * "- blockType: content" senza colonne prende il blocco di testo successivo.
 */
import { parse } from 'yaml'

type Oggetto = Record<string, unknown>

export type FilePagina = {
  file: string
  slug: string
  bozza: boolean
  dati: Oggetto
  // I collegamenti "pagina:slug": servono per creare prima le pagine collegate
  collegamenti: string[]
}

// Larghezza delle colonne di un blocco di testo in base a quante sono
const LARGHEZZE = { 1: 'full', 2: 'half', 3: 'oneThird' } as const

export function leggiPagina(file: string, testo: string): FilePagina {
  const m = testo.replace(/\r\n/g, '\n').match(/^---\n([\s\S]*?)\n---\n?([\s\S]*)$/)
  if (!m) throw new Error(`${file}: manca l'intestazione YAML tra due righe "---"`)
  const { bozza, ...dati } = (parse(m[1]) ?? {}) as Oggetto
  if (typeof dati.slug !== 'string' || typeof dati.title !== 'string') {
    throw new Error(`${file}: nell'intestazione servono "title" e "slug"`)
  }

  const blocchiTesto = m[2].trim()
    ? m[2].split(/^<!-- blocco -->$/m).map((blocco, i) => {
        const colonne = blocco.split(/^<!-- colonna -->$/m).map((c) => c.trim())
        const size = LARGHEZZE[colonne.length as keyof typeof LARGHEZZE]
        if (!size) throw new Error(`${file}: il blocco di testo ${i + 1} ha più di 3 colonne`)
        return { blockType: 'content', columns: colonne.map((richText) => ({ size, richText })) }
      })
    : []

  if (!Array.isArray(dati.layout)) {
    dati.layout = blocchiTesto
  } else {
    dati.layout = dati.layout.map((b: Oggetto) => {
      if (b.blockType !== 'content' || b.columns) return b
      const testoSuccessivo = blocchiTesto.shift()
      if (!testoSuccessivo)
        throw new Error(`${file}: nel layout c'è un blocco "content" vuoto in più`)
      return testoSuccessivo
    })
    if (blocchiTesto.length) {
      throw new Error(
        `${file}: ${blocchiTesto.length} blocchi di testo senza un "- blockType: content" nel layout`,
      )
    }
  }

  const collegamenti = [...JSON.stringify(dati).matchAll(/"pagina:([^"]+)"/g)].map((c) => c[1])
  return { file, slug: dati.slug, bozza: bozza === true, dati, collegamenti }
}

type Risolutori = {
  markdown: (testo: string) => unknown
  media: (file: string) => number | string
  pagina: (slug: string) => number | string
  colore: (nome: string) => number | string
  effetto: (nome: string) => number | string
  modulo: (titolo: string) => number | string
}

// Campi di testo formattato scritti in Markdown nei file del seed
const CAMPI_MARKDOWN = new Set(['richText', 'introContent', 'confirmationMessage', 'message'])

// Applica le convenzioni: Markdown nei campi di CAMPI_MARKDOWN, "media:", "pagina:", "colore:",
// "effetto:", "modulo:" negli altri
export function risolvi(valore: unknown, r: Risolutori, chiave = ''): unknown {
  if (Array.isArray(valore)) return valore.map((v) => risolvi(v, r))
  if (valore && typeof valore === 'object') {
    return Object.fromEntries(Object.entries(valore).map(([k, v]) => [k, risolvi(v, r, k)]))
  }
  if (typeof valore === 'string') {
    if (CAMPI_MARKDOWN.has(chiave)) return r.markdown(valore)
    if (valore.startsWith('media:')) return r.media(valore.slice('media:'.length))
    if (valore.startsWith('colore:')) return r.colore(valore.slice('colore:'.length))
    if (valore.startsWith('effetto:')) return r.effetto(valore.slice('effetto:'.length))
    if (valore.startsWith('modulo:')) return r.modulo(valore.slice('modulo:'.length))
    if (valore.startsWith('pagina:'))
      return { relationTo: 'pages', value: r.pagina(valore.slice('pagina:'.length)) }
  }
  return valore
}
