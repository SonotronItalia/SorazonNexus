import type { GlobalConfig } from 'payload'

import { link } from '@/fields/link'
import { notifyFrontend } from '@/hooks/notifyFrontend'

export const Header: GlobalConfig = {
  slug: 'header',
  label: 'Menu principale',
  admin: {
    group: 'Impostazioni',
    description:
      'Voci del menu in cima a ogni pagina. Le pagine in bozza si vedono solo dopo la pubblicazione.',
  },
  access: {
    read: () => true,
  },
  fields: [
    {
      name: 'navItems',
      label: 'Voci del menu',
      type: 'array',
      fields: [
        link({
          appearances: false,
        }),
      ],
      maxRows: 8,
      admin: {
        initCollapsed: true,
        components: {
          RowLabel: '@/Header/RowLabel#RowLabel',
        },
      },
    },
  ],
  hooks: {
    afterChange: [notifyFrontend('globals')],
  },
}
