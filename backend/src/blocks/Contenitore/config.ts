import type { Block, BlockSlug } from 'payload'

import { campoLarghezza } from '@/fields/larghezza'
import { campoEffetti } from '@/fields/effetti'
import { campiSfondo } from '@/fields/sfondo'

// Spazi a misure fisse: la scelta è "quanto", la misura esatta la decide il sito
const SPAZI = [
  { label: 'Nessuno', value: 'nessuno' },
  { label: 'Piccolo', value: 'piccolo' },
  { label: 'Medio', value: 'medio' },
  { label: 'Grande', value: 'grande' },
]

// Blocchi che si possono mettere in una colonna (oltre al contenitore del livello successivo)
const BLOCCHI_INTERNI: BlockSlug[] = [
  'cta',
  'content',
  'mediaBlock',
  'archive',
  'formBlock',
  'centriList',
  'schedaProdotto',
  'galleriaRisultati',
  'mappa',
  'numeriEvidenza',
  'carosello',
  // Non dentro le colonne: "prodottoScorrimento" (occupa tutto lo schermo) e "barraProdotto"
  // (fissa sotto l'header, va come primo blocco della pagina)
]

// Livelli di annidamento: Payload 3 non accetta un blocco che contiene se stesso (va in ciclo
// infinito), quindi ogni livello è un blocco a sé: contenitore, contenitore2, contenitore3.
export const LIVELLI_CONTENITORE = 3

export const slugContenitore = (livello: number) =>
  (livello === 1 ? 'contenitore' : `contenitore${livello}`) as BlockSlug

/**
 * Contenitore a colonne, come il blocco "Colonne" degli editor a blocchi di WordPress: ogni
 * colonna contiene altri blocchi e, fino al 3° livello, un altro Contenitore.
 * I blocchi interni sono riferimenti per nome a config.blocks (payload.config.ts): i dati
 * finiscono nelle stesse tabelle dei blocchi usati direttamente nella pagina.
 * Sul sito tutti i livelli usano lo stesso componente.
 */
const creaContenitore = (livello: number): Block => ({
  slug: slugContenitore(livello),
  interfaceName: livello === 1 ? 'ContenitoreBlock' : `Contenitore${livello}Block`,
  labels:
    livello === 1
      ? { singular: 'Contenitore', plural: 'Contenitori' }
      : {
          singular: `Contenitore (${livello}° livello)`,
          plural: `Contenitori (${livello}° livello)`,
        },
  fields: [
    {
      type: 'row',
      fields: [
        campoLarghezza(),
        {
          name: 'allineamento',
          label: 'Allineamento verticale delle colonne',
          type: 'select',
          defaultValue: 'inizio',
          options: [
            { label: 'In alto', value: 'inizio' },
            { label: 'Al centro', value: 'centro' },
            { label: 'In basso', value: 'fine' },
          ],
        },
      ],
    },
    {
      type: 'row',
      fields: [
        {
          name: 'spazioColonne',
          label: 'Spazio tra le colonne',
          type: 'select',
          defaultValue: 'medio',
          options: SPAZI,
        },
        {
          name: 'spazioVerticale',
          label: 'Spazio sopra e sotto',
          type: 'select',
          defaultValue: 'nessuno',
          options: SPAZI,
        },
      ],
    },
    { type: 'row', fields: campiSfondo() },
    campoEffetti(),
    {
      name: 'colonne',
      type: 'array',
      minRows: 1,
      maxRows: 4,
      required: true,
      labels: { singular: 'Colonna', plural: 'Colonne' },
      admin: {
        description: "Da 1 a 4 colonne affiancate; sui telefoni vanno una sotto l'altra.",
        initCollapsed: false,
      },
      fields: [
        {
          name: 'larghezza',
          label: 'Larghezza della colonna',
          type: 'select',
          defaultValue: 'auto',
          options: [
            { label: 'Automatica (divide lo spazio con le altre)', value: 'auto' },
            { label: '25%', value: '25' },
            { label: '33%', value: '33' },
            { label: '50%', value: '50' },
            { label: '66%', value: '66' },
            { label: '75%', value: '75' },
          ],
        },
        {
          name: 'blocchi',
          type: 'blocks',
          labels: { singular: 'Blocco', plural: 'Blocchi' },
          blocks: [],
          blockReferences:
            livello < LIVELLI_CONTENITORE
              ? [...BLOCCHI_INTERNI, slugContenitore(livello + 1)]
              : BLOCCHI_INTERNI,
        },
      ],
    },
  ],
})

export const CONTENITORI: Block[] = Array.from({ length: LIVELLI_CONTENITORE }, (_, i) =>
  creaContenitore(i + 1),
)
