import type { Block } from 'payload'

import { sfondoSezione } from '@/fields/sfondoSezione'

// Griglia di schede arrotondate (stile pagine prodotto): titolo, testo formattato e immagine
// facoltativa. Serve a dare struttura a pagine di testo senza cambiarne le parole
export const Schede: Block = {
  slug: 'schede',
  interfaceName: 'SchedeBlock',
  labels: { singular: 'Schede in evidenza', plural: 'Schede in evidenza' },
  fields: [
    {
      type: 'row',
      fields: [
        { name: 'occhiello', label: 'Occhiello', type: 'text' },
        { name: 'titolo', label: 'Titolo della sezione', type: 'text' },
      ],
    },
    {
      type: 'row',
      fields: [
        sfondoSezione('chiaro'),
        {
          name: 'colonne',
          label: 'Colonne',
          type: 'select',
          defaultValue: '3',
          options: [
            { label: '2', value: '2' },
            { label: '3', value: '3' },
          ],
        },
      ],
    },
    {
      name: 'schede',
      label: 'Schede',
      type: 'array',
      minRows: 1,
      maxRows: 18,
      labels: { singular: 'Scheda', plural: 'Schede' },
      fields: [
        {
          type: 'row',
          fields: [
            { name: 'occhiello', label: 'Occhiello', type: 'text' },
            { name: 'titolo', label: 'Titolo', type: 'text' },
          ],
        },
        { name: 'richText', label: 'Testo', type: 'richText' },
        {
          name: 'immagine',
          label: 'Immagine (facoltativa)',
          type: 'upload',
          relationTo: 'media',
        },
      ],
    },
  ],
}
