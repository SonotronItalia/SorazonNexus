import type { GlobalConfig } from 'payload'

import { link } from '@/fields/link'
import { notifyFrontend } from '@/hooks/notifyFrontend'

export const Footer: GlobalConfig = {
  slug: 'footer',
  label: 'Piè di pagina',
  admin: { group: 'Impostazioni' },
  access: {
    read: () => true,
  },
  fields: [
    {
      type: 'tabs',
      tabs: [
        {
          label: 'Menu',
          description: 'Collegamenti in fondo a ogni pagina (es. Privacy, Cookie policy).',
          fields: [
            {
              name: 'navItems',
              label: 'Voci del menu in fondo',
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
          ],
        },
        {
          label: 'Dati legali',
          description:
            'Dati obbligatori della società, in fondo a ogni pagina e nei dati per Google.',
          fields: [
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
                {
                  type: 'row',
                  fields: [
                    {
                      name: 'telefono',
                      label: 'Telefono principale',
                      type: 'text',
                      admin: { description: 'Con prefisso internazionale, es. +39 0721 808759' },
                    },
                    { name: 'email', label: 'Email principale', type: 'email' },
                  ],
                },
              ],
            },
          ],
        },
      ],
    },
  ],
  hooks: {
    afterChange: [notifyFrontend('globals')],
  },
}
