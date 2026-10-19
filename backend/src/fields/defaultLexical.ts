import type { TextFieldSingleValidation } from 'payload'
import {
  AlignFeature,
  BoldFeature,
  ItalicFeature,
  LinkFeature,
  OrderedListFeature,
  ParagraphFeature,
  lexicalEditor,
  UnderlineFeature,
  UnorderedListFeature,
  type LinkFields,
} from '@payloadcms/richtext-lexical'

import { StileTestoFeature } from '@/components/admin/StileTesto/feature.server'

// Editor di base: tutti i campi di testo del sito lo ereditano (rootFeatures) e aggiungono i titoli.
// Elenchi puntati e numerati, allineamento e "Stile testo" (dimensione e colore dalla tavolozza).
export const defaultLexical = lexicalEditor({
  features: [
    ParagraphFeature(),
    UnderlineFeature(),
    BoldFeature(),
    ItalicFeature(),
    UnorderedListFeature(),
    OrderedListFeature(),
    AlignFeature(),
    StileTestoFeature(),
    LinkFeature({
      enabledCollections: ['pages', 'posts'],
      fields: ({ defaultFields }) => {
        const defaultFieldsWithoutUrl = defaultFields.filter((field) => {
          if ('name' in field && field.name === 'url') return false
          return true
        })

        return [
          ...defaultFieldsWithoutUrl,
          {
            name: 'url',
            type: 'text',
            admin: {
              condition: (_data, siblingData) => siblingData?.linkType !== 'internal',
            },
            label: ({ t }) => t('fields:enterURL'),
            required: true,
            validate: ((value, options) => {
              if ((options?.siblingData as LinkFields)?.linkType === 'internal') {
                return true // no validation needed, as no url should exist for internal links
              }
              return value ? true : 'URL is required'
            }) as TextFieldSingleValidation,
          },
        ]
      },
    }),
  ],
})
