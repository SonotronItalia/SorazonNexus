import type { Block, Field } from 'payload'

import {
  FixedToolbarFeature,
  HeadingFeature,
  InlineToolbarFeature,
  lexicalEditor,
} from '@payloadcms/richtext-lexical'

import { link } from '@/fields/link'

const columnFields: Field[] = [
  {
    name: 'size',
    label: 'Larghezza',
    type: 'select',
    defaultValue: 'oneThird',
    options: [
      {
        label: 'Un terzo',
        value: 'oneThird',
      },
      {
        label: 'Metà',
        value: 'half',
      },
      {
        label: 'Due terzi',
        value: 'twoThirds',
      },
      {
        label: 'Intera',
        value: 'full',
      },
    ],
  },
  {
    name: 'richText',
    type: 'richText',
    editor: lexicalEditor({
      features: ({ rootFeatures }) => {
        return [
          ...rootFeatures,
          HeadingFeature({ enabledHeadingSizes: ['h2', 'h3', 'h4'] }),
          FixedToolbarFeature(),
          InlineToolbarFeature(),
        ]
      },
    }),
    label: false,
  },
  {
    name: 'enableLink',
    label: 'Aggiungi un collegamento',
    type: 'checkbox',
  },
  link({
    overrides: {
      admin: {
        condition: (_data, siblingData) => {
          return Boolean(siblingData?.enableLink)
        },
      },
    },
  }),
]

export const Content: Block = {
  slug: 'content',
  labels: { singular: 'Testo', plural: 'Testi' },
  interfaceName: 'ContentBlock',
  fields: [
    {
      name: 'columns',
      label: 'Colonne',
      labels: { singular: 'Colonna', plural: 'Colonne' },
      type: 'array',
      admin: {
        initCollapsed: true,
      },
      fields: columnFields,
    },
  ],
}
