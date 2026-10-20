import type { Block } from 'payload'

import { link } from '@/fields/link'

// Barra del prodotto che resta fissa sotto l'header mentre si scorre la pagina (stile pagine
// prodotto): nome a sinistra, pulsante a destra. Va messa come primo blocco della pagina.
export const BarraProdotto: Block = {
  slug: 'barraProdotto',
  interfaceName: 'BarraProdottoBlock',
  labels: { singular: 'Barra prodotto', plural: 'Barre prodotto' },
  fields: [
    {
      type: 'row',
      fields: [
        {
          name: 'nome',
          label: 'Nome',
          type: 'text',
          required: true,
          admin: { placeholder: 'es. Sorazon' },
        },
        {
          name: 'sottotitolo',
          label: 'Accanto al nome',
          type: 'text',
          admin: { placeholder: 'es. Studio · Maxi' },
        },
      ],
    },
    link({ appearances: false }),
  ],
}
