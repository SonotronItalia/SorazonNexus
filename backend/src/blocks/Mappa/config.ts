import type { Block } from 'payload'

// Mappa di Google Maps per un indirizzo. Per la privacy la mappa si carica solo quando il
// visitatore la chiede (Google imposta cookie): prima si vede un riquadro con l'indirizzo.
export const Mappa: Block = {
  slug: 'mappa',
  interfaceName: 'MappaBlock',
  labels: { singular: 'Mappa', plural: 'Mappe' },
  fields: [
    { name: 'titolo', type: 'text' },
    {
      name: 'indirizzo',
      type: 'text',
      required: true,
      admin: {
        description: 'Indirizzo da cercare su Google Maps, es. Strada Nazionale Adriatica Sud 44, 61032 Fano PU',
      },
    },
    {
      name: 'altezza',
      type: 'select',
      defaultValue: 'media',
      options: [
        { label: 'Bassa', value: 'bassa' },
        { label: 'Media', value: 'media' },
        { label: 'Alta', value: 'alta' },
      ],
    },
  ],
}
