import type { Block } from 'payload'

import { campoLarghezza } from '@/fields/larghezza'
import { campiSfondo } from '@/fields/sfondo'

// Griglia di immagini (es. radiografie) con etichetta e sottotitolo, come la vecchia pagina Risultati:
// al passaggio del mouse l'immagine si illumina e compare il sottotitolo.
// I testi clinici vanno rivisti da chi è competente in azienda prima della pubblicazione.
export const GalleriaRisultati: Block = {
  slug: 'galleriaRisultati',
  interfaceName: 'GalleriaRisultatiBlock',
  labels: { singular: 'Galleria risultati', plural: 'Gallerie risultati' },
  fields: [
    { name: 'titolo', type: 'text' },
    { name: 'introduzione', type: 'textarea' },
    {
      type: 'row',
      fields: [
        {
          name: 'colonne',
          type: 'select',
          defaultValue: '2',
          options: [
            { label: '2 colonne', value: '2' },
            { label: '3 colonne', value: '3' },
          ],
        },
        campoLarghezza(),
      ],
    },
    { type: 'row', fields: campiSfondo() },
    {
      // Nome corto per il limite di 63 caratteri dei nomi dei vincoli di Postgres
      name: 'schede',
      label: 'Colore delle schede',
      type: 'relationship',
      relationTo: 'colori',
      admin: { description: 'Colore dietro le immagini. Vuoto: grigio scuro (#36353A).' },
    },
    {
      name: 'voci',
      type: 'array',
      required: true,
      minRows: 1,
      labels: { singular: 'Immagine', plural: 'Immagini' },
      fields: [
        { name: 'immagine', type: 'upload', relationTo: 'media', required: true },
        {
          name: 'etichetta',
          type: 'text',
          required: true,
          admin: { description: 'Ad esempio: Coxartrosi, Epicondilite' },
        },
        {
          name: 'sottotitolo',
          type: 'text',
          admin: { description: "Compare sotto l'etichetta al passaggio del mouse. Ad esempio: Artrosi" },
        },
        { name: 'descrizione', type: 'textarea' },
      ],
    },
  ],
}
