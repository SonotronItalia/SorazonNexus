import type { Field } from 'payload'
import { POSIZIONI } from '@/fields/posizioni'

import {
  FixedToolbarFeature,
  HeadingFeature,
  InlineToolbarFeature,
  lexicalEditor,
} from '@payloadcms/richtext-lexical'

import { linkGroup } from '@/fields/linkGroup'
import { campoEffetti } from '@/fields/effetti'
import { idYouTube } from '@/utilities/youtube'

// Hero con immagine grande: hanno sovrapposizione, video e posizione del titolo
const HERO_GRANDI = ['banner', 'highImpact']


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
        {
          // Immagine intera a tutta larghezza (senza ritagli) con il titolo sovrapposto in alto
          label: 'Banner (immagine intera con titolo)',
          value: 'banner',
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
        condition: (_, { type } = {}) =>
          ['highImpact', 'mediumImpact', 'sorazon', 'banner'].includes(type),
        description:
          'Con un video fa da anteprima: si vede prima del caricamento, con "riduci movimento" e senza consenso a YouTube.',
      },
      relationTo: 'media',
      required: true,
    },
    {
      name: 'bordoImmagine',
      label: "Bordo attorno all'immagine",
      type: 'checkbox',
      defaultValue: true,
      admin: {
        condition: (_, { type } = {}) => type === 'sorazon',
        description: "Spento: l'immagine si fonde con lo sfondo, senza cornice né ombra.",
      },
    },
    // --- Opzioni degli hero grandi (Banner e High Impact) ---
    {
      type: 'row',
      admin: { condition: (_, { type } = {}) => HERO_GRANDI.includes(type) },
      fields: [
        {
          name: 'sfondoMedia',
          label: 'Sfondo',
          type: 'select',
          defaultValue: 'immagine',
          options: [
            { label: 'Immagine', value: 'immagine' },
            { label: 'Video', value: 'video' },
          ],
        },
        {
          name: 'posizioneTitolo',
          label: 'Posizione del titolo',
          type: 'select',
          admin: { description: 'Vuoto: in alto al centro (Banner), al centro (High Impact).' },
          options: POSIZIONI,
        },
        {
          name: 'proporzione',
          label: 'Proporzione',
          type: 'select',
          admin: {
            condition: (_, { type } = {}) => type === 'banner',
            description: "Vuoto: come l'immagine (16:9 con un video).",
          },
          options: [
            { label: '16:9', value: '16-9' },
            { label: '21:9', value: '21-9' },
            { label: '3:1', value: '3-1' },
          ],
        },
      ],
    },
    {
      name: 'video',
      type: 'group',
      admin: {
        condition: (_, siblingData = {}) =>
          HERO_GRANDI.includes(siblingData.type) && siblingData.sfondoMedia === 'video',
        description: 'Il video parte muto e in loop; il visitatore può metterlo in pausa.',
      },
      fields: [
        {
          name: 'sorgente',
          type: 'select',
          defaultValue: 'file',
          options: [
            { label: 'File della libreria Media (mp4, webm)', value: 'file' },
            { label: 'YouTube (solo con il consenso ai contenuti esterni)', value: 'youtube' },
            { label: 'Indirizzo diretto di un file video (URL)', value: 'url' },
          ],
        },
        {
          name: 'file',
          type: 'upload',
          relationTo: 'media',
          filterOptions: { mimeType: { contains: 'video' } },
          admin: { condition: (_, s = {}) => s.sorgente === 'file' },
          validate: (valore: unknown, { siblingData }: { siblingData: Record<string, unknown> }) =>
            siblingData?.sorgente !== 'file' || Boolean(valore) || 'Scegli un video della libreria',
        },
        {
          name: 'url',
          type: 'text',
          admin: {
            condition: (_, s = {}) => s.sorgente === 'youtube' || s.sorgente === 'url',
            description: 'YouTube: il link del video. URL: indirizzo di un file .mp4 o .webm.',
          },
          validate: (
            valore: unknown,
            { siblingData }: { siblingData: Record<string, unknown> },
          ) => {
            const sorgente = siblingData?.sorgente
            if (sorgente === 'file') return true
            if (typeof valore !== 'string' || !valore) return 'Inserisci il link del video'
            if (sorgente === 'youtube')
              return idYouTube(valore) ? true : 'Non è un link di YouTube valido'
            return (
              /^https?:\/\/\S+$/i.test(valore) || 'Inserisci un indirizzo che inizia con http(s)://'
            )
          },
        },
      ],
    },
    {
      type: 'row',
      admin: { condition: (_, { type } = {}) => HERO_GRANDI.includes(type) },
      fields: [
        {
          name: 'overlay',
          label: 'Sovrapposizione sopra immagine o video',
          type: 'select',
          defaultValue: 'nessuna',
          options: [
            { label: 'Nessuna', value: 'nessuna' },
            { label: 'Leggera', value: 'leggera' },
            { label: 'Media', value: 'media' },
            { label: 'Forte', value: 'forte' },
          ],
        },
        {
          name: 'coloreOverlay',
          label: 'Colore della sovrapposizione',
          type: 'relationship',
          relationTo: 'colori',
          admin: {
            condition: (_, s = {}) => Boolean(s.overlay) && s.overlay !== 'nessuna',
            description: 'Vuoto: nero.',
          },
        },
      ],
    },
    // Effetti animati (sezione "Effetti"): negli hero grandi e in quello Sorazon
    campoEffetti({
      admin: {
        initCollapsed: false,
        condition: (_, { type } = {}) => ['sorazon', 'banner', 'highImpact'].includes(type),
        description:
          'Effetti animati dalla sezione "Effetti". Si vedono solo se attivi anche lì; il visitatore può spegnerli (fulmine nell\'header).',
      },
    }),
  ],
  label: false,
}
