import type { CollectionConfig } from 'payload'
import { nascostaSenzaPermesso, permesso } from '@/access/ruoli'

import {
  FixedToolbarFeature,
  InlineToolbarFeature,
  lexicalEditor,
} from '@payloadcms/richtext-lexical'
import path from 'path'
import { fileURLToPath } from 'url'

import { anyone } from '../access/anyone'
import { soloAdminEliminaDefinitivo } from '@/hooks/cestino'
import { CACHE_MEDIA } from '@/utilities/cacheMedia'

const filename = fileURLToPath(import.meta.url)
const dirname = path.dirname(filename)

export const Media: CollectionConfig = {
  slug: 'media',
  labels: { singular: 'Immagine o file', plural: 'Immagini e file' },
  admin: { group: 'Contenuti', hidden: nascostaSenzaPermesso('media') },
  folders: true,
  // Cestino (i file restano sul disco finché non si elimina definitivamente): "Elimina" sposta nel cestino; eliminazione definitiva solo amministratori (hooks/cestino.ts)
  trash: true,
  access: {
    create: permesso('media', 'crea'),
    delete: permesso('media', 'elimina'),
    read: anyone,
    update: permesso('media', 'modifica'),
  },
  fields: [
    {
      name: 'alt',
      type: 'text',
      //required: true,
    },
    {
      name: 'caption',
      type: 'richText',
      editor: lexicalEditor({
        features: ({ rootFeatures }) => {
          return [...rootFeatures, FixedToolbarFeature(), InlineToolbarFeature()]
        },
      }),
    },
  ],
  hooks: { beforeDelete: [soloAdminEliminaDefinitivo] },
  upload: {
    // Cache di una settimana per i file caricati (utilities/cacheMedia.ts)
    modifyResponseHeaders: ({ headers }) => {
      headers.set('Cache-Control', CACHE_MEDIA)
      return headers
    },
    // Solo immagini, PDF e video: niente SVG, HTML o altri file che il browser potrebbe eseguire
    // (i media si aprono dal dominio del sito: un file HTML caricato diventerebbe una pagina)
    mimeTypes: [
      'image/jpeg',
      'image/png',
      'image/webp',
      'image/avif',
      'image/gif',
      'application/pdf',
      'video/mp4',
      'video/webm',
    ],
    // Upload to the public/media directory in Next.js making them publicly accessible even outside of Payload
    staticDir: process.env.MEDIA_DIR || path.resolve(dirname, '../../public/media'),
    adminThumbnail: 'thumbnail',
    focalPoint: true,
    imageSizes: [
      {
        name: 'thumbnail',
        width: 300,
      },
      {
        name: 'square',
        width: 500,
        height: 500,
      },
      {
        name: 'small',
        width: 600,
      },
      {
        name: 'medium',
        width: 900,
      },
      {
        name: 'large',
        width: 1400,
      },
      {
        name: 'xlarge',
        width: 1920,
      },
      {
        name: 'og',
        width: 1200,
        height: 630,
        crop: 'center',
      },
    ],
  },
}
