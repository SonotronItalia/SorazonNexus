/**
 * Contenuti di partenza per lo sviluppo: "make seed" (pnpm payload run src/seed/index.ts).
 * I contenuti stanno in src/seed/dati (tabelle CSV e pagine in Markdown, vedi pagine.ts) e le
 * immagini in src/seed/media: questo file contiene solo la logica di caricamento.
 *
 * Ripetibile: cerca prima di creare (utente per email, media per nome file, pagine per slug,
 * centri per città + indirizzo, o città + nome se manca l'indirizzo) e aggiorna quello che trova.
 * Non cancella nulla.
 * Le chiamate passano context.disableRevalidate: niente avvisi al frontend durante l'importazione.
 */
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

import config from '@payload-config'
import { convertMarkdownToLexical } from '@payloadcms/richtext-lexical'
import { getPayload, type RequiredDataFromCollectionSlug, type TypedLocale } from 'payload'
import { parse } from 'yaml'

import type { Centri, Media, Page } from '@/payload-types'
import { revalidateFrontend } from '@/hooks/notifyFrontend'

import { leggiCsv } from './csv'
import { cartellaMarchio, seedMarchio } from './marchio'
import { editorMarkdown as configEditorMarkdown } from './markdown'
import { leggiPagina, risolvi } from './pagine'

const dir = path.dirname(fileURLToPath(import.meta.url))
const context = { disableRevalidate: true }

const payload = await getPayload({ config })
const log = (msg: string) => payload.logger.info(`[seed] ${msg}`)

// Cartella dei dati: tabelle CSV (separatore ";", si aprono con Excel) e pagine in Markdown
const dati = (...parti: string[]) => path.join(dir, 'dati', ...parti)
const leggiTabella = (file: string) => leggiCsv(fs.readFileSync(dati(file), 'utf8'))

// Markdown -> rich text di Payload, con le stesse funzioni di testo dei campi del sito
const editorMarkdown = await configEditorMarkdown(payload.config)
const markdown = (testo: string) => convertMarkdownToLexical({ editorConfig: editorMarkdown, markdown: testo })

// --- Utente amministratore di sviluppo ---

async function seedAdmin() {
  const email = process.env.SEED_ADMIN_EMAIL
  const password = process.env.SEED_ADMIN_PASSWORD
  // In produzione l'admin si crea dal pannello (primo accesso): senza variabili si salta
  if (!email || !password) return log('utente admin non creato: SEED_ADMIN_EMAIL/PASSWORD non impostati')
  if (password === 'cambiami') {
    throw new Error('SEED_ADMIN_PASSWORD è ancora "cambiami": scripts/env.sh ne genera una sicura')
  }
  const { docs } = await payload.find({ collection: 'users', where: { email: { equals: email } }, limit: 1 })
  if (docs[0]) return log(`utente ${email} già presente`)
  // Ruolo con accesso completo (lo crea la migrazione "ruoli"; su un database nuovo lo crea qui)
  const { docs: completi } = await payload.find({ collection: 'ruoli', where: { completo: { equals: true } }, limit: 1 })
  const ruolo = completi[0] ?? (await payload.create({ collection: 'ruoli', data: { nome: 'Amministratore', completo: true }, context }))
  await payload.create({ collection: 'users', data: { email, password, name: 'Admin sviluppo', profilo: ruolo.id }, context })
  log(`creato utente ${email} (password in backend/.env)`)
}

// --- Media: i file stanno in src/seed/media, l'elenco con il testo alternativo in dati/media.csv ---

async function seedMedia(file: string, alt: string): Promise<Media> {
  const { docs } = await payload.find({ collection: 'media', where: { filename: { equals: file } }, limit: 1 })
  const filePath = path.join(dir, 'media', file)
  if (!fs.existsSync(filePath)) throw new Error(`dati/media.csv: manca il file src/seed/media/${file}`)
  if (!docs[0]) return payload.create({ collection: 'media', data: { alt }, filePath, context })
  // File cambiato in src/seed/media (es. immagine di qualità migliore): sostituito con lo stesso
  // nome, così pagine e blocchi che lo usano lo mostrano subito
  if (docs[0].filesize === fs.statSync(filePath).size) return docs[0]
  return payload.update({
    collection: 'media',
    id: docs[0].id,
    data: {},
    filePath,
    overwriteExistingFiles: true,
    context,
  })
}

// --- Pagine: aggiornate se lo slug esiste già, sempre pubblicate ---

// stato "draft": la pagina resta in bozza (non visibile sul sito) finché qualcuno non la pubblica.
// Su una pagina già pubblicata una bozza aggiunge solo una nuova versione, non la ritira.
async function seedPage(
  data: RequiredDataFromCollectionSlug<'pages'>,
  stato: 'published' | 'draft' = 'published',
): Promise<Page> {
  const draft = stato === 'draft'
  const { docs } = await payload.find({
    collection: 'pages',
    where: { slug: { equals: data.slug } },
    limit: 1,
    draft,
  })
  const full = { ...data, _status: stato }
  const page = docs[0]
    ? await payload.update({ collection: 'pages', id: docs[0].id, data: full, draft, context })
    : await payload.create({ collection: 'pages', data: full, draft, context })
  log(`pagina /${data.slug} ${docs[0] ? 'aggiornata' : 'creata'}${draft ? ' (bozza)' : ''}`)
  return page
}

// Redirect permanenti dai vecchi indirizzi (Joomla) ai nuovi, aggiornati se esistono già
async function seedRedirect(from: string, url: string) {
  const { docs } = await payload.find({ collection: 'redirects', where: { from: { equals: from } }, limit: 1 })
  const data = { from, to: { type: 'custom' as const, url } }
  if (docs[0]) await payload.update({ collection: 'redirects', id: docs[0].id, data, context })
  else await payload.create({ collection: 'redirects', data, context })
}

// --- Centri da dati/centri.csv (estratto da contatti.pdf) ---

type CentroSeed = Omit<Centri, 'id' | 'createdAt' | 'updatedAt' | 'coordinate'>

// Colonne del CSV = campi della collezione
const CAMPI_CENTRO = [
  'regione',
  'provincia',
  'citta',
  'nome_struttura',
  'indirizzo',
  'telefoni',
  'email',
  'sito',
  'professionisti',
]

async function seedCentri() {
  // Nei professionisti ogni riga della cella è una persona. Una cella vuota svuota il campo
  // anche nel database. Regione e città obbligatorie le controlla Payload.
  const righe = leggiTabella('centri.csv')
  const centri = righe.map((r) =>
    Object.fromEntries(CAMPI_CENTRO.map((k) => [k, r[k] ?? null])),
  ) as unknown as CentroSeed[]
  // Il nome resta fuori quando c'è l'indirizzo: correggerlo nel CSV aggiorna il centro, non lo duplica
  const key = (c: Pick<Centri, 'nome_struttura' | 'citta' | 'indirizzo'>) =>
    [c.citta, c.indirizzo || c.nome_struttura].join('|').toLowerCase()

  const { docs: esistenti } = await payload.find({ collection: 'centri', pagination: false, depth: 0 })
  const perChiave = new Map(esistenti.map((c) => [key(c), c.id]))

  let creati = 0
  let aggiornati = 0
  for (const centro of centri) {
    const id = perChiave.get(key(centro))
    if (id) {
      await payload.update({ collection: 'centri', id, data: centro, context })
      aggiornati++
    } else {
      await payload.create({ collection: 'centri', data: centro, context })
      creati++
    }
  }
  log(`centri: ${creati} creati, ${aggiornati} aggiornati (${centri.length} nel file)`)
}

// --- Esecuzione ---

await seedAdmin()

const idMedia = new Map<string, number | string>()
for (const { file, alt } of leggiTabella('media.csv')) idMedia.set(file, (await seedMedia(file, alt ?? file)).id)
log('media pronti')

await seedCentri()

// Tavolozza dei colori (dati/colori.csv): aggiornata per nome, così i codici si correggono dal file
const idColori = new Map<string, number | string>()
for (const { nome, codice } of leggiTabella('colori.csv')) {
  const { docs } = await payload.find({ collection: 'colori', where: { nome: { equals: nome } }, limit: 1 })
  const colore = docs[0]
    ? await payload.update({ collection: 'colori', id: docs[0].id, data: { codice }, context })
    : await payload.create({ collection: 'colori', data: { nome, codice }, context })
  idColori.set(nome, colore.id)
}
log(`colori pronti (${idColori.size})`)

// Effetti (dati/effetti.csv): aggiornati per nome; "attivo" si/no, colore per nome dalla tavolozza
const idEffetti = new Map<string, number | string>()
for (const r of leggiTabella('effetti.csv')) {
  const data = {
    nome: r.nome,
    tipo: r.tipo as 'pulsazione',
    attivo: (r.attivo ?? 'si').toLowerCase() !== 'no',
    colore: r.colore ? (idColori.get(r.colore) as number) : null,
    intensita: (r.intensita || 'media') as 'media',
    velocita: (r.velocita || 'normale') as 'normale',
    posizione: (r.posizione || 'centro-destra') as 'centro-destra',
  }
  if (r.colore && !idColori.has(r.colore)) throw new Error(`dati/effetti.csv: colore "${r.colore}" non in colori.csv`)
  const { docs } = await payload.find({ collection: 'effetti', where: { nome: { equals: r.nome } }, limit: 1 })
  const effetto = docs[0]
    ? await payload.update({ collection: 'effetti', id: docs[0].id, data, context })
    : await payload.create({ collection: 'effetti', data, context })
  idEffetti.set(r.nome, effetto.id)
}
log(`effetti pronti (${idEffetti.size})`)

// Moduli (dati/moduli/*.yml), cercati per titolo: le pagine li usano con "modulo:Titolo"
const idModuli = new Map<string, number | string>()
const risolutoriModuli = {
  markdown,
  media: () => {
    throw new Error('nei moduli non si usano immagini')
  },
  pagina: () => {
    throw new Error('nei moduli i collegamenti alle pagine si scrivono come link Markdown')
  },
  colore: () => {
    throw new Error('nei moduli non si usano colori')
  },
  effetto: () => {
    throw new Error('nei moduli non si usano effetti')
  },
  modulo: () => {
    throw new Error('un modulo non può contenerne un altro')
  },
}
for (const f of fs.readdirSync(dati('moduli')).filter((f) => f.endsWith('.yml')).sort()) {
  const data = risolvi(parse(fs.readFileSync(dati('moduli', f), 'utf8')), risolutoriModuli) as RequiredDataFromCollectionSlug<'forms'>
  if (!data.title) throw new Error(`moduli/${f}: manca "title"`)
  const { docs } = await payload.find({ collection: 'forms', where: { title: { equals: data.title } }, limit: 1, depth: 0 })
  const modulo = docs[0]
    ? await payload.update({ collection: 'forms', id: docs[0].id, data, context })
    : await payload.create({ collection: 'forms', data, context })
  idModuli.set(data.title, modulo.id)
}
log(`moduli pronti (${idModuli.size})`)

// Pagine: prima quelle senza collegamenti, poi quelle che puntano a pagine già create
const idPagine = new Map<string, number | string>()
const { docs: pagineEsistenti } = await payload.find({ collection: 'pages', pagination: false, depth: 0, draft: true })
pagineEsistenti.forEach((p) => p.slug && idPagine.set(p.slug, p.id))

const risolutori = {
  markdown,
  media: (file: string) => {
    const id = idMedia.get(file)
    if (id == null) throw new Error(`immagine "${file}" non elencata in dati/media.csv`)
    return id
  },
  effetto: (nome: string) => {
    const id = idEffetti.get(nome)
    if (id == null) throw new Error(`effetto "${nome}" non elencato in dati/effetti.csv`)
    return id
  },
  colore: (nome: string) => {
    const id = idColori.get(nome)
    if (id == null) throw new Error(`colore "${nome}" non elencato in dati/colori.csv`)
    return id
  },
  pagina: (slug: string) => {
    const id = idPagine.get(slug)
    if (id == null) throw new Error(`collegamento alla pagina "${slug}", che non esiste`)
    return id
  },
  modulo: (titolo: string) => {
    const id = idModuli.get(titolo)
    if (id == null) throw new Error(`modulo "${titolo}" che non esiste in dati/moduli`)
    return id
  },
}

const daCreare = fs
  .readdirSync(dati('pagine'))
  .filter((f) => f.endsWith('.md'))
  .sort()
  .map((f) => leggiPagina(f, fs.readFileSync(dati('pagine', f), 'utf8')))
const slugNeiFile = new Set(daCreare.map((p) => p.slug))
while (daCreare.length) {
  const i = daCreare.findIndex((p) => p.collegamenti.every((s) => s === p.slug || !slugNeiFile.has(s) || idPagine.has(s)))
  if (i < 0) throw new Error(`collegamenti circolari tra: ${daCreare.map((p) => p.file).join(', ')}`)
  const [p] = daCreare.splice(i, 1)
  const data = risolvi(p.dati, risolutori) as RequiredDataFromCollectionSlug<'pages'>
  const pagina = await seedPage(data, p.bozza ? 'draft' : 'published')
  idPagine.set(p.slug, pagina.id)
}

// Notizie (dati/notizie/*.md): intestazione YAML con i campi dell'articolo, sotto il testo in Markdown.
// "categorie" sono titoli di categoria (create se mancano); "bozza: true" la lascia non pubblicata.
const idCategorie = new Map<string, number | string>()
async function categoria(titolo: string) {
  if (!idCategorie.has(titolo)) {
    const { docs } = await payload.find({ collection: 'categories', where: { title: { equals: titolo } }, limit: 1 })
    const slug = titolo.toLowerCase().normalize('NFD').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')
    const c = docs[0] ?? (await payload.create({ collection: 'categories', data: { title: titolo, slug }, context }))
    idCategorie.set(titolo, c.id)
  }
  return idCategorie.get(titolo)!
}
for (const f of fs.readdirSync(dati('notizie')).filter((f) => f.endsWith('.md')).sort()) {
  const m = fs
    .readFileSync(dati('notizie', f), 'utf8')
    .replace(/\r\n/g, '\n')
    .match(/^---\n([\s\S]*?)\n---\n?([\s\S]*)$/)
  if (!m) throw new Error(`notizie/${f}: manca l'intestazione YAML tra due righe "---"`)
  const { bozza, categorie = [], ...campi } = (parse(m[1]) ?? {}) as Record<string, unknown> & {
    categorie?: string[]
  }
  if (typeof campi.slug !== 'string' || typeof campi.title !== 'string') {
    throw new Error(`notizie/${f}: nell'intestazione servono "title" e "slug"`)
  }
  const stato = bozza === true ? 'draft' : 'published'
  const data = {
    ...(risolvi(campi, risolutori) as object),
    content: markdown(m[2].trim()),
    categories: await Promise.all(categorie.map(categoria)),
    _status: stato,
  } as RequiredDataFromCollectionSlug<'posts'>
  const draft = stato === 'draft'
  const { docs } = await payload.find({ collection: 'posts', where: { slug: { equals: campi.slug } }, limit: 1, draft })
  if (docs[0]) await payload.update({ collection: 'posts', id: docs[0].id, data, draft, context })
  else await payload.create({ collection: 'posts', data, draft, context })
  log(`notizia /posts/${campi.slug} ${docs[0] ? 'aggiornata' : 'creata'}${draft ? ' (bozza)' : ''}`)
}

// Vecchi indirizzi del sito Joomla verso i nuovi
for (const { da, a } of leggiTabella('redirect.csv')) await seedRedirect(da, a)
log('redirect dai vecchi indirizzi aggiornati')

// Menu dell'header: una voce per riga, verso una pagina (per slug) o un indirizzo
await payload.updateGlobal({
  slug: 'header',
  data: {
    navItems: leggiTabella('menu.csv').map(({ etichetta, pagina, url }) => ({
      link: pagina
        ? { type: 'reference' as const, reference: risolvi(`pagina:${pagina}`, risolutori) as never, label: etichetta }
        : { type: 'custom' as const, url, label: etichetta },
    })),
  },
  context,
})
log("menu dell'header aggiornato")

// Footer: dati legali della società (dati/footer.yml)
await payload.updateGlobal({
  slug: 'footer',
  data: parse(fs.readFileSync(dati('footer.yml'), 'utf8')),
  context,
})
log('footer aggiornato')

// SEO e motori AI (dati/seo.yml): solo i valori ancora vuoti nel CMS, così non si
// sovrascrive mai quello che è stato cambiato dall'admin
const seoAttuale = (await payload.findGlobal({ slug: 'seo', depth: 0 })) as unknown as Record<string, unknown>
const seoSeed = parse(fs.readFileSync(dati('seo.yml'), 'utf8')) as Record<string, string>
const mancanti = Object.fromEntries(
  Object.entries(seoSeed).filter(([k]) => !String(seoAttuale[k] ?? '').trim()),
)
if (Object.keys(mancanti).length) {
  await payload.updateGlobal({ slug: 'seo', data: mancanti, context })
  log(`SEO e motori AI: impostati ${Object.keys(mancanti).join(', ')}`)
} else log('SEO e motori AI già compilati: non toccati')

// Marchio (Impostazioni del sito > Marchio): loghi e icona Sorazon solo se la scheda è vuota
log(`marchio: ${await seedMarchio(payload, cartellaMarchio(dir))}`)

// Lingue e selettore (dati/lingue.yml): solo se nel CMS non c'è ancora nessuna lingua
const lingueAttuali = await payload.findGlobal({ slug: 'lingue', depth: 0 })
if (!lingueAttuali.elenco?.length) {
  await payload.updateGlobal({ slug: 'lingue', data: parse(fs.readFileSync(dati('lingue.yml'), 'utf8')), context })
  log('lingue del sito impostate')
} else log('lingue del sito già impostate: non toccate')

// Traduzioni (dati/traduzioni/<lingua>/): pagine (Markdown come quelle italiane, con "pagina:"
// = slug italiano e "pubblicata: false" = salvata ma nascosta in quella lingua), menu, modulo e SEO
for (const lingua of fs.existsSync(dati('traduzioni')) ? fs.readdirSync(dati('traduzioni')).sort() : []) {
  const locale = lingua as TypedLocale
  const cartella = (...parti: string[]) => dati('traduzioni', lingua, ...parti)
  // Pagine
  for (const f of fs.existsSync(cartella('pagine')) ? fs.readdirSync(cartella('pagine')).filter((f) => f.endsWith('.md')).sort() : []) {
    const p = leggiPagina(f, fs.readFileSync(cartella('pagine', f), 'utf8'))
    const { pagina, pubblicata, ...resto } = p.dati as { pagina?: string; pubblicata?: boolean }
    const id = pagina ? idPagine.get(pagina) : undefined
    if (!id) throw new Error(`traduzioni/${lingua}/pagine/${f}: "pagina: ${pagina}" non esiste`)
    const data = risolvi(resto, risolutori) as RequiredDataFromCollectionSlug<'pages'>
    await payload.update({ collection: 'pages', id, locale, data: { ...data, nascosta: pubblicata === false, _status: 'published' }, context })
    log(`pagina /${lingua}/${p.slug} (da /${pagina}) ${pubblicata === false ? 'da rivedere, nascosta' : 'pubblicata'}`)
  }
  // Menu dell'header nella lingua
  if (fs.existsSync(cartella('menu.csv'))) {
    const righe = leggiCsv(fs.readFileSync(cartella('menu.csv'), 'utf8'))
    await payload.updateGlobal({
      slug: 'header',
      locale,
      data: {
        navItems: righe.map(({ etichetta, pagina, url }) => ({
          link: pagina
            ? { type: 'reference' as const, reference: risolvi(`pagina:${pagina}`, risolutori) as never, label: etichetta }
            : { type: 'custom' as const, url, label: etichetta },
        })),
      },
      context,
    })
    log(`menu in ${lingua} aggiornato`)
  }
  // Moduli: stessi campi dell'italiano (per posizione), testi tradotti
  for (const f of fs.existsSync(cartella('moduli')) ? fs.readdirSync(cartella('moduli')).filter((f) => f.endsWith('.yml')).sort() : []) {
    const t = risolvi(parse(fs.readFileSync(cartella('moduli', f), 'utf8')), risolutoriModuli) as {
      title: string
      fields?: Record<string, unknown>[]
      emails?: Record<string, unknown>[]
    } & Record<string, unknown>
    const { docs } = await payload.find({ collection: 'forms', where: { title: { equals: t.title } }, limit: 1, depth: 0 })
    if (!docs[0]) throw new Error(`traduzioni/${lingua}/moduli/${f}: modulo "${t.title}" non trovato`)
    const unisci = (base: Record<string, unknown>[] | null | undefined, tradotti?: Record<string, unknown>[]) =>
      (base ?? []).map((b, i) => {
        const tr = tradotti?.[i] ?? {}
        const opzioni = (b.options as Record<string, unknown>[] | undefined)?.map((o, j) => ({
          ...o,
          ...((tr.options as Record<string, unknown>[] | undefined)?.[j] ?? {}),
        }))
        return { ...b, ...tr, ...(opzioni ? { options: opzioni } : {}) }
      })
    const { title: _titolo, fields, emails, ...testi } = t
    await payload.update({
      collection: 'forms',
      id: docs[0].id,
      locale,
      data: {
        ...testi,
        fields: unisci(docs[0].fields as never, fields),
        emails: unisci(docs[0].emails as never, emails),
      } as never,
      context,
    })
    log(`modulo "${t.title}" tradotto in ${lingua}`)
  }
  // SEO: descrizione del sito e presentazione per llms.txt nella lingua (solo se vuote)
  if (fs.existsSync(cartella('seo.yml'))) {
    const attuale = (await payload.findGlobal({ slug: 'seo', locale, fallbackLocale: false, depth: 0 })) as unknown as Record<string, unknown>
    const voci = parse(fs.readFileSync(cartella('seo.yml'), 'utf8')) as Record<string, string>
    const vuote = Object.fromEntries(Object.entries(voci).filter(([k]) => !String(attuale[k] ?? '').trim()))
    if (Object.keys(vuote).length) await payload.updateGlobal({ slug: 'seo', locale, data: vuote, context })
  }
}

// Durante il seed gli avvisi al frontend sono spenti: uno solo alla fine, con tutti i tag
await revalidateFrontend(
  ['pages', 'pages-sitemap', 'posts', 'posts-sitemap', 'globals', 'redirects', 'centri'],
  payload,
)
log('cache del frontend aggiornata (se il frontend è acceso)')

log('fatto')
process.exit(0)
