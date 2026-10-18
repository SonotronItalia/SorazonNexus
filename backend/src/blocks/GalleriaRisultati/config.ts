import type { Block } from 'payload'

// Griglia di immagini (es. radiografie) con un'etichetta ciascuna, come la vecchia pagina Risultati.
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
        {
          name: 'sfondo',
          type: 'select',
          defaultValue: 'nessuno',
          options: [
            { label: 'Nessuno', value: 'nessuno' },
            { label: 'Tenue', value: 'tenue' },
            { label: 'Scuro', value: 'scuro' },
          ],
        },
      ],
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
        { name: 'descrizione', type: 'textarea' },
      ],
    },
  ],
}
