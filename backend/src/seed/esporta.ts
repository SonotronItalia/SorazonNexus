/**
 * Esporta le pagine pubblicate del CMS nei file del seed (make esporta): il sito com'è adesso
 * diventa il contenuto di partenza di "make seed". Legge via REST (CMS_URL, predefinito
 * http://127.0.0.1:3001), quindi funziona sia con make dev sia con lo stack, e non scrive nulla
 * nel database.
 *
 * Scrive dati/pagine/<slug>.md e dati/traduzioni/<lingua>/pagine/<slug>.md nel formato di
 * pagine.ts: gli id diventano "media:file", "pagina:slug", "colore:Nome", "effetto:Nome",
 * "modulo:Titolo"; il rich text diventa Markdown quando ci sta senza perdere nulla, altrimenti
 * resta nel formato di Payload (es. "Stile testo"). Le immagini usate e non ancora nel seed si
 * scaricano in media/ e si aggiungono a media.csv, come i colori mancanti in colori.csv.
 * Le righe di commento in cima ai file esistenti restano. Le pagine solo in bozza non si
 * toccano (l'API anonima vede solo il pubblicato).
 */
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

import configPromise from '@payload-config'
import { convertLexicalToMarkdown, convertMarkdownToLexical } from '@payloadcms/richtext-lexical'
import type { SerializedEditorState } from '@payloadcms/richtext-lexical/lexical'
import type { FlattenedField } from 'payload'
import { stringify } from 'yaml'

import { leggiCsv } from './csv'
import { editorMarkdown } from './markdown'

type Oggetto = Record<string, unknown>

const config = await configPromise
const editor = await editorMarkdown(config)
const CMS = (process.env.CMS_URL ?? 'http://127.0.0.1:3001').replace(/\/$/, '')
const dir = path.dirname(fileURLToPath(import.meta.url))
const dati = (...parti: string[]) => path.join(dir, 'dati', ...parti)

async function api<T = Oggetto>(percorso: string): Promise<T> {
  const r = await fetch(`${CMS}/api/${percorso}`)
  if (!r.ok) throw new Error(`${CMS}/api/${percorso}: ${r.status}`)
  return r.json() as Promise<T>
}
const tutti = async (collezione: string, extra = '') =>
  (await api<{ docs: Oggetto[] }>(`${collezione}?limit=1000&depth=0${extra}`)).docs

// --- Nomi al posto degli id ---

const media = new Map((await tutti('media')).map((m) => [m.id, m]))
const colori = new Map((await tutti('colori')).map((c) => [c.id, c]))
const effetti = new Map((await tutti('effetti')).map((e) => [e.id, e]))
const moduli = new Map((await tutti('forms', '&locale=it')).map((f) => [f.id, f]))
const slugPagine = new Map((await tutti('pages', '&locale=it')).map((p) => [p.id, p.slug as string]))

const usati = { media: new Set<Oggetto>(), colori: new Set<Oggetto>() }

function nome(collezione: string, id: unknown): unknown {
  if (id == null || typeof id === 'object') return id
  switch (collezione) {
    case 'media': {
      const m = media.get(id)
      if (!m) return undefined
      usati.media.add(m)
      return `media:${m.filename}`
    }
    case 'colori': {
      const c = colori.get(id)
      if (!c) return undefined
      usati.colori.add(c)
      return `colore:${c.nome}`
    }
    case 'effetti':
      return effetti.has(id) ? `effetto:${effetti.get(id)!.nome}` : undefined
    case 'forms':
      return moduli.has(id) ? `modulo:${moduli.get(id)!.title}` : undefined
    case 'pages':
      return slugPagine.has(id) ? `pagina:${slugPagine.get(id)}` : undefined
  }
  return id
}

// --- Rich text: Markdown se il passaggio avanti e indietro dà lo stesso testo ---

// Solo ciò che il Markdown sa rappresentare: tipo, titolo, elenco, testo, formato, link
const essenziale = (n: unknown): unknown => {
  if (!n || typeof n !== 'object') return n
  const o = n as Oggetto
  return {
    type: o.type,
    tag: o.tag,
    listType: o.listType,
    text: o.text,
    format: o.type === 'text' ? o.format : undefined,
    style: o.style || undefined,
    align: o.type !== 'text' && o.format ? o.format : undefined,
    url: (o.fields as Oggetto | undefined)?.url,
    linkType: (o.fields as Oggetto | undefined)?.linkType,
    newTab: (o.fields as Oggetto | undefined)?.newTab || undefined,
    children: Array.isArray(o.children) ? o.children.map(essenziale) : undefined,
  }
}

// Collegamenti interni e immagini dentro il testo: id → nome, come nei campi
function nomiNelTesto(n: unknown): unknown {
  if (Array.isArray(n)) return n.map(nomiNelTesto)
  if (!n || typeof n !== 'object') return n
  const o = n as Oggetto
  const fuori: Oggetto = {}
  for (const [k, v] of Object.entries(o)) {
    const rel = v as Oggetto | null
    if (k === 'doc' && rel && typeof rel === 'object' && 'relationTo' in rel)
      fuori[k] = nome(String(rel.relationTo), rel.value) ?? rel
    else if (k === 'value' && typeof o.relationTo === 'string' && typeof v !== 'object')
      fuori[k] = nome(o.relationTo, v) ?? v
    else fuori[k] = nomiNelTesto(v)
  }
  return fuori
}

function testo(valore: unknown): unknown {
  if (!valore || typeof valore !== 'object' || !('root' in valore)) return valore
  const data = valore as SerializedEditorState
  try {
    const md = convertLexicalToMarkdown({ data, editorConfig: editor }).trim()
    const ritorno = convertMarkdownToLexical({ editorConfig: editor, markdown: md })
    if (JSON.stringify(essenziale(ritorno.root)) === JSON.stringify(essenziale(data.root))) return md
  } catch {
    // Nodi che il Markdown non conosce: resta il formato di Payload
  }
  return nomiNelTesto(valore)
}

// --- Campi: si segue lo schema di Payload per sapere cosa è un id e cosa un testo ---

const blocchi = new Map((config.blocks ?? []).map((b) => [b.slug, b]))

function campi(valore: unknown, schema: FlattenedField[]): Oggetto | undefined {
  if (!valore || typeof valore !== 'object') return undefined
  const fuori: Oggetto = {}
  for (const f of schema) {
    if (f.name === 'id' || f.name === 'blockName') continue
    const v = (valore as Oggetto)[f.name]
    const r = campo(v, f)
    // Valori uguali al predefinito del campo: li rimette Payload, nel file sarebbero solo rumore
    const predefinito = 'defaultValue' in f && typeof f.defaultValue !== 'function' ? f.defaultValue : undefined
    if (predefinito !== undefined && JSON.stringify(r) === JSON.stringify(predefinito)) continue
    const vuoto = r == null || r === '' || (Array.isArray(r) && !r.length) ||
      (typeof r === 'object' && !Array.isArray(r) && !Object.keys(r as Oggetto).length)
    if (!vuoto) fuori[f.name] = r
  }
  return fuori
}

function campo(v: unknown, f: FlattenedField): unknown {
  if (v == null) return undefined
  switch (f.type) {
    case 'richText':
      return testo(v)
    case 'upload':
    case 'relationship': {
      const uno = (x: unknown) =>
        typeof f.relationTo === 'string'
          ? nome(f.relationTo, x)
          : x && typeof x === 'object'
            ? (() => {
                const r = x as Oggetto
                const n = nome(String(r.relationTo), r.value)
                // Collegamento a una pagina: "pagina:slug" vale già { relationTo, value }
                return r.relationTo === 'pages' ? n : { ...r, value: n }
              })()
            : x
      return Array.isArray(v) ? v.map(uno).filter((x) => x != null) : uno(v)
    }
    case 'group':
    case 'tab':
      return campi(v, f.flattenedFields)
    case 'array':
      return Array.isArray(v) ? v.map((riga) => campi(riga, f.flattenedFields)) : undefined
    case 'blocks':
      return Array.isArray(v)
        ? v.map((b: Oggetto) => {
            const def =
              blocchi.get(b.blockType as string) ??
              f.blocks.find((x) => x.slug === b.blockType)
            if (!def) throw new Error(`blocco "${b.blockType}" sconosciuto`)
            return { blockType: b.blockType, ...campi(b, def.flattenedFields) }
          })
        : undefined
    default:
      return v
  }
}

const pagine = config.collections.find((c) => c.slug === 'pages')!
const CAMPI_PAGINA = ['title', 'slug', 'meta', 'hero', 'layout']
const schemaPagina = pagine.flattenedFields.filter((f) => CAMPI_PAGINA.includes(f.name))

// --- File Markdown: commenti esistenti + intestazione YAML + blocchi di testo semplici ---

const LARGHEZZE: Record<number, string> = { 1: 'full', 2: 'half', 3: 'oneThird' }

function scriviFile(file: string, testa: Oggetto) {
  const layout = (testa.layout as Oggetto[] | undefined) ?? []
  const corpi: string[] = []
  // Un blocco di testo con colonne di larghezza standard e solo Markdown va sotto l'intestazione
  testa.layout = layout.map((b) => {
    const colonne = b.columns as Oggetto[] | undefined
    const semplice =
      b.blockType === 'content' &&
      Object.keys(b).length === 2 &&
      colonne?.length &&
      colonne.every(
        (c) =>
          typeof c.richText === 'string' &&
          Object.keys(c).every((k) => k === 'richText' || k === 'size') &&
          c.size === LARGHEZZE[colonne.length],
      )
    if (!semplice) return b
    corpi.push(colonne!.map((c) => c.richText).join('\n\n<!-- colonna -->\n\n'))
    return { blockType: 'content' }
  })
  if (!(testa.layout as unknown[]).length) delete testa.layout

  const commenti = fs.existsSync(file)
    ? (fs.readFileSync(file, 'utf8').replace(/\r\n/g, '\n').split('\n---\n')[0].match(/^#.*$/gm) ?? [])
    : []
  const yaml = stringify(testa, { lineWidth: 0 }).trimEnd()
  const corpo = corpi.join('\n\n<!-- blocco -->\n\n')
  fs.writeFileSync(
    file,
    `---\n${commenti.map((c) => c + '\n').join('')}${yaml}\n---\n${corpo ? corpo + '\n' : ''}`,
  )
}

const lingue = (await api<{ elenco?: { codice: string }[] }>('globals/lingue?depth=0')).elenco
  ?.map((l) => l.codice)
  .filter((l) => l !== 'it') ?? []

for (const lingua of ['it', ...lingue]) {
  const docs = await tutti('pages', `&locale=${lingua}&fallback-locale=none`)
  for (const doc of docs) {
    if (!doc.slug || !doc.title) continue
    const valori = campi(doc, schemaPagina)!
    const testa = Object.fromEntries(CAMPI_PAGINA.filter((k) => k in valori).map((k) => [k, valori[k]]))
    if (lingua === 'it') {
      scriviFile(dati('pagine', `${doc.slug}.md`), testa)
    } else {
      const cartella = dati('traduzioni', lingua, 'pagine')
      fs.mkdirSync(cartella, { recursive: true })
      scriviFile(path.join(cartella, `${doc.slug}.md`), {
        pagina: slugPagine.get(doc.id),
        ...(doc.nascosta ? { pubblicata: false } : {}),
        ...testa,
      })
    }
    console.log(`esportata /${lingua === 'it' ? '' : lingua + '/'}${doc.slug}`)
  }
}

// --- Immagini e colori usati che il seed non conosce ancora ---

const righeMedia = leggiCsv(fs.readFileSync(dati('media.csv'), 'utf8'))
const notiMedia = new Set(righeMedia.map((r) => r.file))
for (const m of usati.media) {
  const file = m.filename as string
  if (notiMedia.has(file)) continue
  const destinazione = path.join(dir, 'media', file)
  if (!fs.existsSync(destinazione)) {
    const r = await fetch(`${CMS}/api/media/file/${encodeURIComponent(file)}`)
    if (!r.ok) throw new Error(`immagine ${file}: ${r.status}`)
    fs.writeFileSync(destinazione, Buffer.from(await r.arrayBuffer()))
  }
  fs.appendFileSync(dati('media.csv'), `${file};${String(m.alt ?? '').replace(/;/g, ',')}\n`)
  console.log(`aggiunta l'immagine ${file}`)
}
const notiColori = new Set(leggiCsv(fs.readFileSync(dati('colori.csv'), 'utf8')).map((r) => r.nome))
for (const c of usati.colori) {
  if (notiColori.has(c.nome as string)) continue
  fs.appendFileSync(dati('colori.csv'), `${c.nome};${c.codice}\n`)
  console.log(`aggiunto il colore ${c.nome}`)
}
process.exit(0)
