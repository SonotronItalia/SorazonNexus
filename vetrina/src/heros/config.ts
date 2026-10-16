import type { Field } from 'payload'

import {
  FixedToolbarFeature,
  HeadingFeature,
  InlineToolbarFeature,
  lexicalEditor,
} from '@payloadcms/richtext-lexical'

import { linkGroup } from '@/fields/linkGroup'

export const hero: Field = {
  name: 'hero',
  type: 'group',
  fields: [
    {
      name: 'type',
      type: 'select',
      defaultValue: 'lowImpact',
      label: 'Type',
      options: [
        {
          label: 'None',
          value: 'none',
        },
        {
          label: 'High Impact',
          value: 'highImpact',
        },
        {
          label: 'Medium Impact',
          value: 'mediumImpact',
        },
        {
          label: 'Low Impact',
          value: 'lowImpact',
        },
        {
          label: 'Sorazon (Home)',
          value: 'sorazon',
        },
      ],
      required: true,
    },
    {
      name: 'richText',
      type: 'richText',
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
      label: false,
    },
    linkGroup({
      overrides: {
        maxRows: 2,
      },
    }),
    {
      name: 'media',
      type: 'upload',
      admin: {
        // Aggiunto 'sorazon' per consentire il caricamento dell'immagine di sfondo/prodotto
        condition: (_, { type } = {}) => ['highImpact', 'mediumImpact', 'sorazon'].includes(type),
      },
      relationTo: 'media',
      required: true,
    },
{
  name: 'effetto_pulsazione',
  type: 'checkbox',
  label: 'Effetto pulsazione (alone luminoso)',
  defaultValue: true,
  admin: { condition: (_, { type } = {}) => type === 'sorazon' },
},
{
  name: 'effetto_scarica',
  type: 'checkbox',
  label: 'Effetto scarica di Tesla (viola)',
  defaultValue: false,
  admin: { condition: (_, { type } = {}) => type === 'sorazon' },
},
  ],
  label: false,
}