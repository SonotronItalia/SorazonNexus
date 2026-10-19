import type { Block } from 'payload'

import { campiSfondo } from '@/fields/sfondo'

export const SchedaProdotto: Block = {
  slug: 'schedaProdotto',
  interfaceName: 'SchedaProdottoBlock',
  labels: { singular: 'Scheda prodotto', plural: 'Schede prodotto' },
  fields: [
    { name: 'titolo', type: 'text', required: true },
    { name: 'descrizione', type: 'textarea' },
    { name: 'immagine', type: 'upload', relationTo: 'media', required: true },
    {
      type: 'row',
      fields: [
        {
          name: 'posizioneImmagine',
          type: 'select',
          defaultValue: 'sinistra',
          options: [
            { label: 'Immagine a sinistra', value: 'sinistra' },
            { label: 'Immagine a destra', value: 'destra' },
          ],
        },
        {
          name: 'colonneComponenti',
          type: 'select',
          defaultValue: '3',
          options: [
            { label: 'Componenti su 2 colonne', value: '2' },
            { label: 'Componenti su 3 colonne', value: '3' },
          ],
        },
      ],
    },
    { type: 'row', fields: campiSfondo() },
    {
      name: 'gruppi',
      type: 'array',
      labels: { singular: 'Gruppo di caratteristiche', plural: 'Gruppi di caratteristiche' },
      admin: { description: 'Ad esempio: Dati tecnici, Dimensioni, Omologazione' },
      fields: [
        { name: 'titolo', type: 'text', required: true },
        {
          name: 'voci',
          type: 'array',
          labels: { singular: 'Voce', plural: 'Voci' },
          fields: [{ name: 'testo', type: 'text', required: true }],
        },
      ],
    },
    {
      name: 'componenti',
      type: 'array',
      labels: { singular: 'Componente', plural: 'Componenti' },
      fields: [
        { name: 'nome', type: 'text', required: true },
        { name: 'foto', type: 'upload', relationTo: 'media' },
        {
          name: 'composto_da',
          // Nome breve per la tabella nel database: con quello lungo gli identificatori
          // superavano i 63 caratteri di Postgres e venivano troncati in silenzio
          dbName: 'parti',
          type: 'array',
          labels: { singular: 'Parte', plural: 'Parti' },
          fields: [{ name: 'testo', type: 'text', required: true }],
        },
      ],
    },
  ],
}