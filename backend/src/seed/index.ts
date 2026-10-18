/**
 * Contenuti di partenza per lo sviluppo: "make seed" (pnpm payload run src/seed/index.ts).
 *
 * Ripetibile: cerca prima di creare (utente per email, media per nome file, pagine per slug,
 * centri per nome + città + indirizzo) e aggiorna quello che trova. Non cancella nulla.
 * Le chiamate passano context.disableRevalidate: niente avvisi al frontend durante l'importazione.
 */
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

import config from '@payload-config'
import { getPayload, type RequiredDataFromCollectionSlug } from 'payload'

import type { Centri, Media, Page } from '@/payload-types'

const dir = path.dirname(fileURLToPath(import.meta.url))
const context = { disableRevalidate: true }

const payload = await getPayload({ config })
const log = (msg: string) => payload.logger.info(`[seed] ${msg}`)

// --- Rich text (Lexical) minimale: titoli e paragrafi ---

type RichText = NonNullable<Page['hero']['richText']>
type Node = RichText['root']['children'][number]

const text = (t: string) => ({
  type: 'text',
  text: t,
  version: 1,
  format: 0,
  detail: 0,
  mode: 'normal',
  style: '',
})
const block = { direction: 'ltr' as const, format: '' as const, indent: 0, version: 1 }
const heading = (tag: 'h1' | 'h2', t: string): Node => ({ type: 'heading', tag, children: [text(t)], ...block })
const paragraph = (t: string): Node => ({ type: 'paragraph', children: [text(t)], textFormat: 0, ...block })
const richText = (...children: Node[]): RichText => ({ root: { type: 'root', children, ...block } })

// --- Utente amministratore di sviluppo ---

async function seedAdmin() {
  const email = process.env.SEED_ADMIN_EMAIL
  const password = process.env.SEED_ADMIN_PASSWORD
  if (!email || !password || password === 'cambiami') {
    throw new Error('Imposta SEED_ADMIN_EMAIL e SEED_ADMIN_PASSWORD in backend/.env (scripts/env.sh li genera)')
  }
  const { docs } = await payload.find({ collection: 'users', where: { email: { equals: email } }, limit: 1 })
  if (docs[0]) return log(`utente ${email} già presente`)
  await payload.create({ collection: 'users', data: { email, password, name: 'Admin sviluppo' }, context })
  log(`creato utente ${email} (password in backend/.env)`)
}

// --- Media: i file stanno in src/seed/media ---

async function seedMedia(file: string, alt: string): Promise<Media> {
  const { docs } = await payload.find({ collection: 'media', where: { filename: { equals: file } }, limit: 1 })
  if (docs[0]) return docs[0]
  return payload.create({ collection: 'media', data: { alt }, filePath: path.join(dir, 'media', file), context })
}

// --- Pagine: aggiornate se lo slug esiste già, sempre pubblicate ---

async function seedPage(data: RequiredDataFromCollectionSlug<'pages'>): Promise<Page> {
  const { docs } = await payload.find({ collection: 'pages', where: { slug: { equals: data.slug } }, limit: 1 })
  const full = { ...data, _status: 'published' as const }
  const page = docs[0]
    ? await payload.update({ collection: 'pages', id: docs[0].id, data: full, context })
    : await payload.create({ collection: 'pages', data: full, context })
  log(`pagina /${data.slug} ${docs[0] ? 'aggiornata' : 'creata'}`)
  return page
}

// --- Centri da src/seed/centri.json ---

type CentroSeed = Omit<Centri, 'id' | 'createdAt' | 'updatedAt' | 'coordinate'>

async function seedCentri() {
  const centri = JSON.parse(fs.readFileSync(path.join(dir, 'centri.json'), 'utf8')) as CentroSeed[]
  const key = (c: Pick<Centri, 'nome_struttura' | 'citta' | 'indirizzo'>) =>
    [c.nome_struttura, c.citta, c.indirizzo ?? ''].join('|').toLowerCase()

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

const fotoDispositivo = await seedMedia('dispositivo-sorazon.jpg', 'Dispositivo Sorazon: unità base e manipolo')
const fotoUnitaBase = await seedMedia('unita_base.jpg', 'Unità base Sorazon')
const fotoManipolo = await seedMedia('manipolo_trasduttore.jpg', 'Manipolo trasduttore Sorazon')
log('media pronti')

await seedCentri()

const centri = await seedPage({
  title: 'Centri',
  slug: 'centri',
  hero: { type: 'lowImpact', richText: richText(heading('h1', 'Centri di riferimento')) },
  layout: [
    {
      blockType: 'centriList',
      titolo: 'Elenco per regione',
      // Testo del vecchio sito (pagina Contatti)
      introduzione:
        'Ambulatori in Italia abilitati a praticare la terapia Sorazon, con operatori che hanno effettuato il corso Formativo-Operativo-Teorico Pratico, con acquisizione di Attestato di Idoneità.\nConseguito presso la sede aziendale ed il Centro Medico Polispecialistico di Fano (PU).',
      mostraIndice: true,
      colonne: '2',
    },
  ],
})

// Dati del vecchio sito (pagina Dispositivo), riportati senza modifiche di contenuto
const dispositivo = await seedPage({
  title: 'Dispositivo',
  slug: 'dispositivo',
  hero: { type: 'lowImpact', richText: richText(heading('h1', 'Dispositivo')) },
  layout: [
    {
      blockType: 'schedaProdotto',
      titolo: 'Sorazon',
      descrizione: 'Apparecchio elettromedicale composto da unità base e manipolo trasduttore.',
      immagine: fotoDispositivo.id,
      posizioneImmagine: 'sinistra',
      sfondo: 'nessuno',
      colonneComponenti: '2',
      gruppi: [
        {
          titolo: 'Dati tecnici',
          voci: [{ testo: 'Tensione di lavoro: 220 Vac' }, { testo: 'Potenza assorbita: 200 W' }],
        },
        {
          titolo: 'Dimensioni apparecchio',
          voci: [
            { testo: 'L 49 cm × H 30,5 cm × P 49 cm' },
            { testo: 'Monitor: 10" LCD colore' },
            { testo: 'Peso apparecchio: 20 kg' },
          ],
        },
        {
          titolo: 'Omologazione',
          voci: [
            { testo: 'Marchio CE' },
            { testo: 'Elettromedicale Classe 2a' },
            { testo: 'Apparecchiatura non invasiva, non a contatto' },
          ],
        },
      ],
      componenti: [
        {
          nome: 'Unità base',
          foto: fotoUnitaBase.id,
          composto_da: [
            { testo: 'Monitor LCD 10" colore' },
            { testo: 'Generatore di radiofrequenza' },
            { testo: 'Generatore di onde soniche (risonanza magnetica)' },
            { testo: 'Software in lingua italiana' },
            { testo: 'Mouse' },
          ],
        },
        {
          nome: 'Manipolo trasduttore',
          foto: fotoManipolo.id,
          composto_da: [{ testo: 'Camera di ionizzazione' }, { testo: 'Generatore di ozono' }],
        },
      ],
    },
  ],
})

await seedPage({
  title: 'Home',
  slug: 'home',
  hero: {
    type: 'sorazon',
    // Titolo e sottotitolo del vecchio sito; il claim sanitario resta fuori finché non è rivisto
    richText: richText(heading('h1', 'Evoluzione terapeutica'), paragraph('Brevetto Italia Europa')),
    links: [
      {
        link: {
          type: 'reference',
          reference: { relationTo: 'pages', value: centri.id },
          label: 'Trova un centro',
          appearance: 'default',
        },
      },
      {
        link: {
          type: 'reference',
          reference: { relationTo: 'pages', value: dispositivo.id },
          label: 'Il dispositivo',
          appearance: 'outline',
        },
      },
    ],
    media: fotoDispositivo.id,
    effetto_pulsazione: true,
    effetto_scarica: false,
  },
  layout: [
    {
      blockType: 'cta',
      richText: richText(
        heading('h2', 'Trova il centro più vicino'),
        paragraph('Ambulatori in Italia abilitati a praticare la terapia Sorazon.'),
      ),
      links: [
        {
          link: {
            type: 'reference',
            reference: { relationTo: 'pages', value: centri.id },
            label: 'Elenco dei centri',
            appearance: 'default',
          },
        },
      ],
    },
  ],
})

await payload.updateGlobal({
  slug: 'header',
  data: {
    navItems: [
      { link: { type: 'reference', reference: { relationTo: 'pages', value: dispositivo.id }, label: 'Dispositivo' } },
      { link: { type: 'reference', reference: { relationTo: 'pages', value: centri.id }, label: 'Centri' } },
      { link: { type: 'custom', url: '/posts', label: 'Notizie' } },
    ],
  },
  context,
})
log('menu dell\'header aggiornato')

log('fatto')
process.exit(0)
