import type { Block } from 'payload'

import { sfondoSezione } from '@/fields/sfondoSezione'

/**
 * Prodotto guidato dallo scorrimento: la sezione resta ferma sullo schermo mentre si scorre e,
 * passaggio dopo passaggio, cambiano immagine e testo (con ingrandimenti e dissolvenze); oppure
 * un video avanza al ritmo dello scorrimento (es. un render 3D del dispositivo esportato in video).
 * Con "riduci movimento" o gli effetti spenti diventa un normale elenco di immagini e testi.
 */
export const ProdottoScorrimento: Block = {
  slug: 'prodottoScorrimento',
  interfaceName: 'ProdottoScorrimentoBlock',
  // Nomi corti nel database: Postgres tronca in silenzio gli identificatori oltre 63 caratteri
  dbName: 'prod_scorr',
  labels: {
    singular: 'Prodotto guidato dallo scorrimento',
    plural: 'Prodotto guidato dallo scorrimento',
  },
  fields: [
    {
      type: 'row',
      fields: [
        {
          name: 'occhiello',
          label: 'Occhiello',
          type: 'text',
          admin: { placeholder: 'es. Il dispositivo' },
        },
        { name: 'titolo', label: 'Titolo', type: 'text' },
      ],
    },
    sfondoSezione('scuro'),
    {
      name: 'tipo',
      label: 'Animazione',
      type: 'select',
      defaultValue: 'immagini',
      options: [
        { label: 'Immagini, una per passaggio', value: 'immagini' },
        { label: 'Video che avanza con lo scorrimento', value: 'video' },
      ],
      admin: {
        description:
          'Video: un file MP4 breve (es. rotazione o apertura del dispositivo), esportato con un fotogramma chiave ogni pochi fotogrammi perché lo scorrimento sia fluido.',
      },
    },
    {
      name: 'video',
      label: 'Video',
      type: 'upload',
      relationTo: 'media',
      admin: { condition: (_, s) => s?.tipo === 'video' },
      validate: (v: unknown, { siblingData }: { siblingData: { tipo?: string } }) =>
        siblingData?.tipo !== 'video' || Boolean(v) || 'Scegli il video',
    },
    {
      name: 'passaggi',
      label: 'Passaggi',
      type: 'array',
      dbName: 'prod_scorr_pass',
      minRows: 1,
      maxRows: 6,
      labels: { singular: 'Passaggio', plural: 'Passaggi' },
      admin: { description: 'Ogni passaggio occupa circa uno schermo di scorrimento.' },
      fields: [
        {
          name: 'immagine',
          label: 'Immagine',
          type: 'upload',
          relationTo: 'media',
          admin: { description: "Con l'animazione a video l'immagine non serve." },
        },
        {
          type: 'row',
          fields: [
            { name: 'occhiello', label: 'Occhiello', type: 'text' },
            { name: 'titolo', label: 'Titolo', type: 'text', required: true },
          ],
        },
        { name: 'testo', label: 'Testo', type: 'textarea', maxLength: 280 },
      ],
    },
  ],
}
