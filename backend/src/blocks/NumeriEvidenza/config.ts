import type { Block } from 'payload'

import { sfondoSezione } from '@/fields/sfondoSezione'

// Numeri grandi in evidenza (es. "37 centri", "dal 1992"): contano da zero quando compaiono.
// Centri e regioni li calcola il sito dalla collezione Centri, gli altri si scrivono qui.
export const NumeriEvidenza: Block = {
  slug: 'numeriEvidenza',
  interfaceName: 'NumeriEvidenzaBlock',
  labels: { singular: 'Numeri in evidenza', plural: 'Numeri in evidenza' },
  fields: [
    { name: 'titolo', label: 'Titolo', type: 'text' },
    sfondoSezione('scuro'),
    {
      name: 'voci',
      label: 'Numeri',
      type: 'array',
      minRows: 1,
      maxRows: 6,
      labels: { singular: 'Numero', plural: 'Numeri' },
      fields: [
        {
          type: 'row',
          fields: [
            {
              name: 'tipo',
              label: 'Valore',
              type: 'select',
              defaultValue: 'manuale',
              options: [
                { label: 'Scritto qui', value: 'manuale' },
                { label: 'Numero di centri (automatico)', value: 'centri' },
                { label: 'Numero di regioni (automatico)', value: 'regioni' },
              ],
            },
            {
              name: 'valore',
              label: 'Numero',
              type: 'number',
              admin: { condition: (_, s) => s?.tipo === 'manuale' || !s?.tipo },
            },
            {
              name: 'conta',
              label: 'Conta da zero',
              type: 'checkbox',
              defaultValue: true,
              admin: { description: 'Spento per gli anni (es. 1992).' },
            },
          ],
        },
        {
          type: 'row',
          fields: [
            {
              name: 'prefisso',
              label: 'Prima del numero',
              type: 'text',
              admin: { placeholder: 'es. dal' },
            },
            {
              name: 'suffisso',
              label: 'Dopo il numero',
              type: 'text',
              admin: { placeholder: 'es. ″ oppure +' },
            },
          ],
        },
        {
          name: 'etichetta',
          label: 'Etichetta',
          type: 'text',
          required: true,
          admin: { placeholder: 'es. centri in Italia' },
        },
      ],
    },
  ],
}
