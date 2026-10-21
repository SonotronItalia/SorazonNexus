import type { BlockSlug, CollectionConfig } from 'payload'
import { nascostaSenzaPermesso, permesso } from '@/access/ruoli'

import { authenticatedOrPublished } from '../../access/authenticatedOrPublished'
import { BLOCCHI_PAGINA } from '@/blocks/blocchiPagina'
import { hero } from '@/heros/config'
import { slugField } from 'payload'
import { populatePublishedAt } from '../../hooks/populatePublishedAt'
import { generatePreviewPath } from '../../utilities/generatePreviewPath'
import { notifyFrontend } from '@/hooks/notifyFrontend'
import { anteprimaEndpoint } from '@/endpoints/anteprima'

import {
  MetaDescriptionField,
  MetaImageField,
  MetaTitleField,
  OverviewField,
  PreviewField,
} from '@payloadcms/plugin-seo/fields'

export const Pages: CollectionConfig<'pages'> = {
  slug: 'pages',
  labels: { singular: 'Pagina', plural: 'Pagine' },
  // Bozze per l'anteprima del frontend (GET /api/pages/anteprima/:slug)
  endpoints: [anteprimaEndpoint('pages')],
  access: {
    create: permesso('pages', 'crea'),
    delete: permesso('pages', 'elimina'),
    read: authenticatedOrPublished,
    update: permesso('pages', 'modifica'),
  },
  // This config controls what's populated by default when a page is referenced
  // https://payloadcms.com/docs/queries/select#defaultpopulate-collection-config-property
  // Type safe if the collection slug generic is passed to `CollectionConfig` - `CollectionConfig<'pages'>
  defaultPopulate: {
    title: true,
    slug: true,
  },
  admin: {
    group: 'Contenuti',
    hidden: nascostaSenzaPermesso('pages'),
    defaultColumns: ['title', 'slug', 'updatedAt'],
    livePreview: {
      url: ({ data, req }) =>
        generatePreviewPath({
          slug: data?.slug,
          collection: 'pages',
          req,
        }),
    },
    preview: (data, { req }) =>
      generatePreviewPath({
        slug: data?.slug as string,
        collection: 'pages',
        req,
      }),
    useAsTitle: 'title',
  },
  fields: [
    {
      name: 'title',
      label: 'Titolo',
      type: 'text',
      localized: true,
      required: true,
    },
    {
      type: 'tabs',
      tabs: [
        {
          fields: [hero],
          label: 'Apertura (in alto)',
        },
        {
          fields: [
            {
              name: 'layout',
              label: 'Blocchi della pagina',
              // Ogni lingua ha i suoi blocchi ("Copia in un'altra lingua" per partire dall'italiano)
              localized: true,
              labels: { singular: 'Blocco', plural: 'Blocchi' },
              type: 'blocks',
              // Riferimenti per nome ai blocchi di config.blocks (payload.config.ts): gli stessi
              // che si possono mettere dentro il Contenitore
              blocks: [],
              // (nella pagina solo il Contenitore di 1° livello: gli altri stanno al suo interno)
              blockReferences: BLOCCHI_PAGINA.map((b) => b.slug as BlockSlug).filter(
                (slug) => !/^contenitore\d$/.test(slug),
              ),
              required: true,
              admin: {
                initCollapsed: true,
              },
            },
          ],
          label: 'Contenuto',
        },
        {
          name: 'meta',
          label: 'SEO',
          localized: true,
          fields: [
            OverviewField({
              titlePath: 'meta.title',
              descriptionPath: 'meta.description',
              imagePath: 'meta.image',
            }),
            MetaTitleField({
              hasGenerateFn: true,
            }),
            MetaImageField({
              relationTo: 'media',
            }),

            MetaDescriptionField({}),
            PreviewField({
              // if the `generateUrl` function is configured
              hasGenerateFn: true,

              // field paths to match the target field for data
              titlePath: 'meta.title',
              descriptionPath: 'meta.description',
            }),
          ],
        },
      ],
    },
    {
      name: 'publishedAt',
      label: 'Data di pubblicazione',
      type: 'date',
      admin: {
        position: 'sidebar',
      },
    },
    {
      // Una traduzione pubblicata ("Pubblica modifiche" nella lingua scelta) si vede sul sito;
      // questa spunta la nasconde in quella lingua (per esempio mentre la si rivede)
      name: 'nascosta',
      label: 'Nascondi in questa lingua',
      type: 'checkbox',
      localized: true,
      defaultValue: false,
      admin: {
        position: 'sidebar',
        description:
          "Solo per le traduzioni: la pagina non compare in questa lingua finché la spunta è attiva. In italiano non ha effetto.",
      },
    },
    slugField({
      localized: true,
      // Parte finale dell'indirizzo della pagina, es. /terapia
      overrides: (campo) => {
        const slug = campo.fields.find((f) => 'name' in f && f.name === 'slug')
        if (slug) Object.assign(slug, { label: 'Indirizzo (es. terapia)' })
        return campo
      },
    }),
  ],
  // "globals": il menu dell'header mostra solo le pagine pubblicate, quindi va rinfrescato
  // anche quando una pagina viene pubblicata, ritirata, rinominata o eliminata
  hooks: {
    afterChange: [notifyFrontend('pages', 'pages-sitemap', 'globals')],
    beforeChange: [populatePublishedAt],
    afterDelete: [notifyFrontend('pages', 'pages-sitemap', 'globals')],
  },
  versions: {
    drafts: {
      autosave: {
        interval: 100, // We set this interval for optimal live preview
      },
      schedulePublish: true,
    },
    maxPerDoc: 50,
  },
}
