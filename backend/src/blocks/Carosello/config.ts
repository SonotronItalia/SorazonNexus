import type { Block } from 'payload'

import { link } from '@/fields/link'
import { sfondoSezione } from '@/fields/sfondoSezione'

// Carosello orizzontale di schede grandi (stile "Le novità"): si scorre con le frecce o il dito
export const Carosello: Block = {
  slug: 'carosello',
  interfaceName: 'CaroselloBlock',
  labels: { singular: 'Carosello', plural: 'Caroselli' },
  fields: [
    { name: 'titolo', label: 'Titolo', type: 'text' },
    sfondoSezione('tenue'),
    {
      name: 'schede',
      label: 'Schede',
      type: 'array',
      minRows: 1,
      maxRows: 10,
      labels: { singular: 'Scheda', plural: 'Schede' },
      fields: [
        {
          name: 'immagine',
          label: 'Immagine',
          type: 'upload',
          relationTo: 'media',
          required: true,
        },
        {
          type: 'row',
          fields: [
            {
              name: 'occhiello',
              label: 'Occhiello',
              type: 'text',
              admin: { placeholder: 'es. Terapia' },
            },
            { name: 'titolo', label: 'Titolo', type: 'text', required: true },
          ],
        },
        { name: 'testo', label: 'Testo breve', type: 'textarea', maxLength: 200 },
        {
          name: 'conLink',
          label: 'Aggiungi un collegamento',
          type: 'checkbox',
          defaultValue: false,
        },
        link({
          appearances: false,
          overrides: {
            admin: { condition: (_: unknown, s: { conLink?: boolean }) => Boolean(s?.conLink) },
          },
        }),
      ],
    },
  ],
}
