import type { CollectionConfig } from 'payload'

import { authenticated } from '../access/authenticated'
import { notifyFrontend } from '@/hooks/notifyFrontend'

// Codice esadecimale a 6 cifre, es. #0095AC (si accetta anche senza "#")
const ESADECIMALE = /^#?[0-9a-fA-F]{6}$/

/**
 * Tavolozza del sito: i colori si salvano qui una volta, con un nome, e i blocchi con sfondo
 * li scelgono da questo elenco. Cambiando un codice cambia ovunque è usato.
 * Il testo sopra il colore (chiaro o scuro) lo decide il sito, per restare leggibile.
 */
export const Colori: CollectionConfig = {
  slug: 'colori',
  labels: { singular: 'Colore del sito', plural: 'Colori del sito' },
  admin: {
    useAsTitle: 'nome',
    defaultColumns: ['nome', 'codice'],
    description:
      "Colori per gli sfondi dei blocchi, la sovrapposizione degli hero e il testo (\"Stile testo\" nell'editor).",
  },
  access: {
    read: () => true,
    create: authenticated,
    update: authenticated,
    delete: authenticated,
  },
  fields: [
    {
      name: 'nome',
      type: 'text',
      required: true,
      unique: true,
      admin: { description: 'Es. Celeste Sorazon' },
    },
    {
      name: 'codice',
      type: 'text',
      required: true,
      admin: { description: 'Codice esadecimale a 6 cifre, es. #0095AC' },
      validate: (valore: string | null | undefined) =>
        (valore && ESADECIMALE.test(valore)) ||
        'Scrivi un codice esadecimale a 6 cifre, es. #0095AC',
      hooks: {
        // Sempre nella stessa forma: con "#" e maiuscolo
        beforeValidate: [
          ({ value }) =>
            typeof value === 'string' ? `#${value.trim().replace(/^#/, '').toUpperCase()}` : value,
        ],
      },
    },
  ],
  hooks: {
    // Le pagine che usano il colore vanno ridisegnate
    afterChange: [notifyFrontend('pages', 'globals')],
    afterDelete: [notifyFrontend('pages', 'globals')],
  },
}
