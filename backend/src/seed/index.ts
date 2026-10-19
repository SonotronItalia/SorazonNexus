/**
 * Contenuti di partenza per lo sviluppo: "make seed" (pnpm payload run src/seed/index.ts).
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
import { getPayload, type RequiredDataFromCollectionSlug } from 'payload'

import type { Centri, Media, Page } from '@/payload-types'
import { revalidateFrontend } from '@/hooks/notifyFrontend'

import { leggiCsv } from './csv'

const dir = path.dirname(fileURLToPath(import.meta.url))
const context = { disableRevalidate: true }

const payload = await getPayload({ config })
const log = (msg: string) => payload.logger.info(`[seed] ${msg}`)

// --- Rich text (Lexical) minimale: titoli e paragrafi ---

type RichText = NonNullable<Page['hero']['richText']>
type Node = RichText['root']['children'][number]

// Un pezzo di testo; "**così**" all'inizio di un paragrafo o di una voce diventa grassetto
const text = (t: string, bold = false) => ({
  type: 'text',
  text: t,
  version: 1,
  format: bold ? 1 : 0,
  detail: 0,
  mode: 'normal',
  style: '',
})
const inline = (t: string) => {
  const m = t.match(/^\*\*(.+?)\*\*(.*)$/s)
  return m ? [text(m[1], true), ...(m[2] ? [text(m[2])] : [])] : [text(t)]
}
const block = { direction: 'ltr' as const, format: '' as const, indent: 0, version: 1 }
const heading = (tag: 'h1' | 'h2' | 'h3', t: string): Node => ({ type: 'heading', tag, children: [text(t)], ...block })
const paragraph = (t: string): Node => ({ type: 'paragraph', children: inline(t), textFormat: 0, ...block })
const list = (...voci: string[]): Node => ({
  type: 'list',
  listType: 'bullet',
  tag: 'ul',
  start: 1,
  children: voci.map((v, i) => ({ type: 'listitem', value: i + 1, children: inline(v), ...block })),
  ...block,
})
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

// Blocco di testo a tutta larghezza (o due colonne affiancate)
const testo = (...children: Node[]) => ({
  blockType: 'content' as const,
  columns: [{ size: 'full' as const, richText: richText(...children) }],
})
const dueColonne = (sinistra: Node[], destra: Node[]) => ({
  blockType: 'content' as const,
  columns: [
    { size: 'half' as const, richText: richText(...sinistra) },
    { size: 'half' as const, richText: richText(...destra) },
  ],
})

// --- Centri da src/seed/centri.csv (estratto da contatti.pdf; si può modificare con Excel) ---

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
  const righe = leggiCsv(fs.readFileSync(path.join(dir, 'centri.csv'), 'utf8'))
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

// --- Terapia e Indicazioni: testi del vecchio sito riportati alla lettera, IN BOZZA.
// Contengono affermazioni sanitarie: vanno riviste da chi è competente prima di pubblicarle.

await seedPage(
  {
    title: 'Terapia',
    slug: 'terapia',
    hero: { type: 'lowImpact', richText: richText(heading('h1', 'Terapia')) },
    layout: [
      testo(
        heading('h2', 'Terapia intensiva antinfiammatoria'),
        paragraph('Mirata > infiltrante > profonda. Non invasiva, non a contatto, non dolorosa.'),
        paragraph('**A tripla azione:**'),
        list(
          'Ad onde soniche pressorie',
          'A radiofrequenza con campo elettromagnetico ionizzante',
          'Ad energia ossigenatoria di OZONO',
        ),
        heading('h2', 'Azione terapeutica'),
        list(
          '**Stato degenerativo articolare** (artrosi): cartilagine articolare, liquido sinoviale',
          '**Artrite** - Flogosi - inibizione delle prostaglandine',
          '**Dolore** - Ossidazione (inattivazione) dei trasmettitori nervosi',
          '**Traumi** - Contusivi - Distorsivi',
          "**Si utilizza anche come terapia antinfiammatoria:** prima di un intervento chirurgico per ridurre il dolore e la flogosi; dopo l'intervento chirurgico quando il paziente avverte ancora dolore ed è limitato nei movimenti",
          '**Seduta terapeutica:** 1 volta a settimana per 4/6 settimane.',
        ),
        heading('h2', "Meccanismo d'azione"),
        heading('h3', 'Onde soniche pressorie'),
        paragraph(
          "Le ONDE SONICHE pressorie si irradiano nei tessuti in rapida sequenza. Agiscono per risonanza favorendo la penetrazione dell'OZONO a livello transdermico tramite I CANALI IONICI.",
        ),
        heading('h3', 'Radiofrequenza con campo elettromagnetico ionizzante'),
        paragraph(
          "La RADIOFREQUENZA, nota anche con l'acronimo RF indica generalmente un segnale elettrico o un'onda elettromagnetica ad alta frequenza che si propaga nell'etere o in un cavo coassiale.",
        ),
        paragraph(
          "La radiofrequenza emettendo l'alta frequenza modulata nella camera di ionizzazione, crea un campo elettromagnetico ionizzante antinfiammatorio che a distanza va a polarizzare i tessuti aprendo i canali ionici.",
        ),
        heading('h3', 'Energia ossigenatoria di ozono'),
        paragraph(
          "Un elevatore di tensione genera una scarica a corona che produce nella camera di ionizzazione un'energia ossigenatoria di ozono che si va ad incanalare nelle parti che stiamo trattando a livello transdermico, tramite i canali ionici.",
        ),
        paragraph(
          "L'ozono per la formazione di perossidi ha effetto antibatterico, antivirale e germicida con proprietà ossidante; agisce come antinfiammatorio per inibizione delle prostaglandine, sostanze fondamentali nello sviluppo di un processo infiammatorio e come antidolorifico per ossidazione dei trasmettitori nervosi che determinano il dolore. Agisce sulla riduzione delle calcificazioni presenti nei tessuti e nelle articolazioni, possiede anche una significativa attività antalgica, riabilitativa nell'ambito del dolore muscolo scheletrico vertebrale, osteoarticolare, acuto - cronico riferito ad artrosi, periartriti, tendiniti, fasciti e borsiti.",
        ),
        paragraph(
          'Le applicazioni di Ossigeno/Ozono sono assolutamente innocue e prive di effetti collaterali. "Si tratta di Ossigeno e quindi non si può neanche essere allergici" e non presentano, in linea di massima, controindicazioni. E\' medicina naturale.',
        ),
        paragraph(
          "L'Ossigeno/Ozono terapia, è una tecnica dolce che sfrutta le potenzialità dell'ozono, combinato con l'ossigeno, di stimolare ed aumentare i meccanismi di protezione nei confronti della produzione dei radicali liberi (determinandone la riduzione) e di sostanze tossiche per le cellule.",
        ),
        paragraph(
          "Attiva la circolazione in tutti i tessuti, stimolandone anche la rigenerazione e favorendo il rilascio dell'ossigeno agli stessi, svolgendo azione:",
        ),
        list('Analgesica', 'Antinfiammatoria', 'Antivirale', 'Antibatterica', 'Immunomodulante'),
        paragraph(
          "E' una miscela di gas costituita da Ossigeno/Ozono, utilizzata nel trattamento del dolore di diversa origine e nel trattamento conservativo di patologie traumatiche che interessano muscoli, tendini ed articolazioni.",
        ),
        paragraph(
          'I dati emersi dalla ricerca scientifica evidenziano un ruolo antinfiammatorio ed analgesico dovuti da diversi meccanismi di azione:',
        ),
        list(
          'Una minore produzione dei mediatori della FLOGOSI (infiammazione), inibizione delle PROSTAGLANDINE',
          "L'ossidazione (inattivazione) dei METABOLITI ALGOGENI delle parti nervose",
          'Netto miglioramento della MICROCIRCOLAZIONE SANGUIGNA LOCALE, che con un miglior apporto di ossigeno agisce con una più rapida eliminazione delle sostanze tossiche con rigenerazione delle strutture anatomiche lese.',
          'Una riduzione ed eliminazione dei cataboliti (sostanze tossiche) nel liquido sinoviale, migliorando lo stato degenerativo della cartilagine.',
        ),
      ),
    ],
  },
  'draft',
)

// Zone del corpo e patologie, in due colonne
const zona = (nome: string, patologie: string) => [heading('h3', nome), paragraph(patologie)]

await seedPage(
  {
    title: 'Indicazioni',
    slug: 'indicazioni',
    hero: { type: 'lowImpact', richText: richText(heading('h1', 'Indicazioni terapeutiche')) },
    layout: [
      testo(list('Artrosi', 'Infiammazioni articolari', 'Traumi')),
      dueColonne(
        [
          ...zona('Temporo mandibolare', 'artrite - artrosi - dolore di masticazione'),
          ...zona(
            'Colonna cervicale',
            'artrite - artrosi - cervicalgia - discopatie - vertigini - nausea - traumi contrattivi, contusivi',
          ),
          ...zona(
            'Colonna dorsale',
            'artrite - artrosi - discopatie - dolori crolli vertebrali - traumi contrattivi, contusivi',
          ),
          ...zona(
            'Colonna lombare sacrale',
            'artrite - artrosi - discopatia - radicolite - sciatalgia sacroileite - lombalgia - colpo della strega - traumi contrattivi, contusivi - dolore trauma coccige',
          ),
          ...zona(
            'Spalla',
            'artrite - artrosi - periartrite scapolo omerale - cuffia rotatori - tendinopatia calcifica - sovraspinato - CLBO - acromion claveare - borsite sad - calcificazioni - brachialgia - lussazione - lesione muscolo tendinea traumi contrattivi - contusivi',
          ),
          ...zona('Gomito', 'artrite - artrosi - epicondilite (gomito tennista) - traumi contrattivi, contusivi'),
          ...zona('Polso', 'artrite - artrosi - rizartrosi - tendinite - traumi contrattivi, contusivi, distorsivi'),
        ],
        [
          ...zona(
            'Mano',
            'artrite - artrosi - tunnel carpale - dito a scatto - metacarpalgia - traumi contrattivi, contusivi',
          ),
          ...zona(
            'Anca',
            'artrite - coxartrosi - coxalgia - pubalgia - lussazione - necrosi testa femore, ovalizzata',
          ),
          ...zona('Coscia/Gamba', 'traumi contrattivi, contusivi - ematomi'),
          ...zona(
            'Ginocchio',
            'artrite - gonartrosi - meniscopatie degenerative - lesioni legamenti - sinoviti - traumi distorsivi, contusivi - cisti di baker',
          ),
          ...zona(
            'Caviglia',
            "artrite - artrosi - traumi distorsivi, contusivi - lesioni - calcificazioni tendine d'achille",
          ),
          ...zona(
            'Piede',
            'artrite - artrosi - talloniti - tarsalgie - speroni calcaneari - metatarsalgie - alluce valgo - sesamoidi - neuroma di Morton - tendinite - fascite plantare - trauma contusivo',
          ),
          ...zona(
            'Patologie varie',
            'artrite reumatoide - artralgia - tendinite tenosinovite - calcificazioni - borsiti - sinoviti periostite - ritardi di consolidazione ossea',
          ),
        ],
      ),
    ],
  },
  'draft',
)

// Vecchi indirizzi del sito Joomla (menu di www.sorazon.it) verso i nuovi
for (const [from, url] of [
  ['/it', '/'],
  ['/index.php', '/'],
  ['/it/dispositivo', '/dispositivo'],
  ['/it/terapia', '/terapia'],
  ['/it/indicazioni', '/indicazioni'],
  ['/it/notizie', '/posts'],
  ['/it/contatti', '/centri'],
]) {
  await seedRedirect(from, url)
}
log('redirect dai vecchi indirizzi aggiornati')

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

// Durante il seed gli avvisi al frontend sono spenti: uno solo alla fine, con tutti i tag
await revalidateFrontend(
  ['pages', 'pages-sitemap', 'posts', 'posts-sitemap', 'globals', 'redirects', 'centri'],
  payload,
)
log('cache del frontend aggiornata (se il frontend è acceso)')

log('fatto')
process.exit(0)
