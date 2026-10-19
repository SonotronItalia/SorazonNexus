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
      // Profili social: nel footer con il logo ufficiale della piattaforma
      name: 'social',
      label: 'Social',
      type: 'array',
      labels: { singular: 'Profilo social', plural: 'Profili social' },
      admin: {
        initCollapsed: false,
        description:
          'Il logo della piattaforma compare in fondo a ogni pagina e apre il profilo in una nuova scheda.',
      },
      fields: [
        {
          type: 'row',
          fields: [
            {
              name: 'piattaforma',
              type: 'select',
              required: true,
              options: [
                { label: 'Facebook', value: 'facebook' },
                { label: 'Instagram', value: 'instagram' },
                { label: 'LinkedIn', value: 'linkedin' },
                { label: 'YouTube', value: 'youtube' },
                { label: 'X (Twitter)', value: 'x' },
                { label: 'TikTok', value: 'tiktok' },
                { label: 'WhatsApp', value: 'whatsapp' },
                { label: 'Threads', value: 'threads' },
                { label: 'Telegram', value: 'telegram' },
                { label: 'Pinterest', value: 'pinterest' },
              ],
            },
            {
              name: 'url',
              label: 'Indirizzo del profilo',
              type: 'text',
              required: true,
              admin: {
                description: 'Es. https://www.facebook.com/sorazon (WhatsApp: https://wa.me/39...)',
              },
              validate: (valore: string | null | undefined) =>
                (typeof valore === 'string' && /^https:\/\/\S+$/i.test(valore)) ||
                "Incolla l'indirizzo completo che inizia con https://",
            },
          ],
        },
      ],
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
  hooks: {
    afterChange: [notifyFrontend('globals')],
  },
}
