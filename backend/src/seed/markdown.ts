import {
  BoldFeature,
  editorConfigFactory,
  HeadingFeature,
  ItalicFeature,
  LinkFeature,
  OrderedListFeature,
  ParagraphFeature,
  UnderlineFeature,
  UnorderedListFeature,
} from '@payloadcms/richtext-lexical'
import type { SanitizedConfig } from 'payload'

// Editor usato per passare dal Markdown dei file del seed al rich text di Payload e ritorno
// (make seed e make esporta): le stesse funzioni di testo dei campi del sito
export const editorMarkdown = (config: SanitizedConfig) =>
  editorConfigFactory.fromFeatures({
    config,
    features: [
      ParagraphFeature(),
      HeadingFeature({ enabledHeadingSizes: ['h1', 'h2', 'h3', 'h4'] }),
      BoldFeature(),
      ItalicFeature(),
      UnderlineFeature(),
      LinkFeature(),
      UnorderedListFeature(),
      OrderedListFeature(),
    ],
  })
