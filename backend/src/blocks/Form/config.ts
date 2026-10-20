import type { Block } from 'payload'

import { sfondoSezione } from '@/fields/sfondoSezione'

import {
  FixedToolbarFeature,
  HeadingFeature,
  InlineToolbarFeature,
  lexicalEditor,
} from '@payloadcms/richtext-lexical'

export const FormBlock: Block = {
  slug: 'formBlock',
  interfaceName: 'FormBlock',
  fields: [
    {
      name: 'form',
      type: 'relationship',
      relationTo: 'forms',
      required: true,
      label: 'Modulo',
    },
    {
      name: 'enableIntro',
      type: 'checkbox',
      label: 'Mostra un testo sopra il modulo',
    },
    {
      name: 'introContent',
      type: 'richText',
      admin: {
        condition: (_, { enableIntro }) => Boolean(enableIntro),
      },
      editor: lexicalEditor({
        features: ({ rootFeatures }) => {
          return [
            ...rootFeatures,
            HeadingFeature({ enabledHeadingSizes: ['h1', 'h2', 'h3', 'h4'] }),
            FixedToolbarFeature(),
            InlineToolbarFeature(),
          ]
        },
      }),
      label: 'Testo sopra il modulo',
    },
    sfondoSezione('nessuno'),
  ],
  graphQL: {
    singularName: 'FormBlock',
  },
  labels: {
    plural: 'Moduli',
    singular: 'Modulo',
  },
}
