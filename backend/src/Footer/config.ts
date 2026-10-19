import type { GlobalConfig } from 'payload'

import { link } from '@/fields/link'
import { notifyFrontend } from '@/hooks/notifyFrontend'

export const Footer: GlobalConfig = {
  slug: 'footer',
  access: {
    read: () => true,
  },
  fields: [
    {
      name: 'navItems',
      type: 'array',
      fields: [
        link({
          appearances: false,
        }),
      ],
      maxRows: 6,
      admin: {
        initCollapsed: true,
        components: {
          RowLabel: '@/Footer/RowLabel#RowLabel',
        },
      },
    },
    {
      // Dati obbligatori sul sito di un'azienda (partita IVA ecc.): in fondo a ogni pagina
      name: 'datiLegali',
      label: 'Dati legali della società',
      type: 'group',
      fields: [
        { name: 'ragioneSociale', label: 'Ragione sociale', type: 'text' },
        { name: 'indirizzo', label: 'Sede legale', type: 'text' },
        {
          type: 'row',
          fields: [
            { name: 'partitaIva', label: 'Partita IVA', type: 'text' },
            { name: 'codiceFiscale', label: 'Codice fiscale', type: 'text' },
            { name: 'rea', label: 'REA', type: 'text' },
          ],
        },
        { name: 'pec', label: 'PEC', type: 'email' },
      ],
    },
  ],
  hooks: {
    afterChange: [notifyFrontend('globals')],
  },
}
