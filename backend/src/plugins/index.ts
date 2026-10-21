import { formBuilderPlugin } from '@payloadcms/plugin-form-builder'
import { nestedDocsPlugin } from '@payloadcms/plugin-nested-docs'
import { redirectsPlugin } from '@payloadcms/plugin-redirects'
import { seoPlugin } from '@payloadcms/plugin-seo'
import { searchPlugin } from '@payloadcms/plugin-search'
import { Plugin } from 'payload'
import { notifyFrontend } from '@/hooks/notifyFrontend'
import { controllaModulo } from '@/hooks/controllaModulo'
import { accessoPubblico, nascostaSenzaPermesso, permesso } from '@/access/ruoli'
import { ordineMenu } from './ordineMenu'
import { GenerateTitle, GenerateURL } from '@payloadcms/plugin-seo/types'
import { FixedToolbarFeature, HeadingFeature, lexicalEditor } from '@payloadcms/richtext-lexical'
import { searchFields } from '@/search/fieldOverrides'
import { beforeSyncWithSearch } from '@/search/beforeSync'

import { Page, Post } from '@/payload-types'
import { soloAdminEliminaDefinitivo } from '@/hooks/cestino'
import { getServerSideURL } from '@/utilities/getURL'

const generateTitle: GenerateTitle<Post | Page> = ({ doc }) => {
  return doc?.title ? `${doc.title} | Sorazon` : 'Sorazon'
}

// Indirizzo per tutto ciò che riguarda il pubblico (moduli del sito)
const EMAIL_INFO = process.env.EMAIL_INFO || 'info@sonotronitalia.com'

const generateURL: GenerateURL<Post | Page> = ({ doc }) => {
  const url = getServerSideURL()

  return doc?.slug ? `${url}/${doc.slug}` : url
}

export const plugins: Plugin[] = [
  redirectsPlugin({
    collections: ['pages', 'posts'],
    overrides: {
      labels: { singular: 'Reindirizzamento', plural: 'Reindirizzamenti' },
      admin: {
        group: 'Avanzate',
        hidden: nascostaSenzaPermesso('redirects'),
        description:
          'Vecchi indirizzi del sito che portano a quelli nuovi (es. dal vecchio sito Joomla).',
      },
      access: accessoPubblico('redirects'),
      // @ts-expect-error - This is a valid override, mapped fields don't resolve to the same type
      fields: ({ defaultFields }) => {
        return defaultFields.map((field) => {
          if ('name' in field && field.name === 'from') {
            return {
              ...field,
              admin: {
                description:
                  'Indirizzo vecchio, es. /it/notizie. Vale entro un minuto dal salvataggio.',
              },
            }
          }
          return field
        })
      },
      hooks: {
        afterChange: [notifyFrontend('redirects')],
      },
    },
  }),
  nestedDocsPlugin({
    collections: ['categories'],
    generateURL: (docs) => docs.reduce((url, doc) => `${url}/${doc.slug}`, ''),
  }),
  seoPlugin({
    generateTitle,
    generateURL,
  }),
  formBuilderPlugin({
    fields: {
      payment: false,
    },
    // Destinatario predefinito delle email inviate dai moduli
    defaultToEmail: EMAIL_INFO,
    // Mittente delle email dei moduli: info@ se il modulo non ne indica uno
    beforeEmail: (emails) => emails.map((e) => ({ ...e, from: e.from || EMAIL_INFO })),
    // Controlli sugli invii (anti-spam, obbligatori, email valide): vedi hooks/controllaModulo.ts
    formSubmissionOverrides: {
      labels: { singular: 'Richiesta ricevuta', plural: 'Richieste ricevute' },
      admin: {
        group: 'Contatti',
        hidden: nascostaSenzaPermesso('form-submissions'),
        description: 'Messaggi inviati dai visitatori con i moduli del sito.',
      },
      // Inviare è pubblico (i visitatori del sito); leggere ed eliminare secondo il ruolo
      access: {
        create: () => true,
        read: permesso('form-submissions', 'vede'),
        update: () => false,
        delete: permesso('form-submissions', 'elimina'),
      },
      hooks: { beforeValidate: [controllaModulo] },
    },
    formOverrides: {
      labels: { singular: 'Modulo', plural: 'Moduli' },
      admin: { group: 'Contatti', hidden: nascostaSenzaPermesso('forms') },
      // Il sito legge i moduli per mostrarli nelle pagine
      access: accessoPubblico('forms'),
      // Cestino: "Elimina" sposta nel cestino; eliminazione definitiva solo amministratori (hooks/cestino.ts)
      trash: true,
      hooks: { beforeDelete: [soloAdminEliminaDefinitivo] },
      fields: ({ defaultFields }) => {
        return defaultFields.map((field) => {
          // Mittente predefinito di ogni email del modulo: l'indirizzo info
          if ('name' in field && field.name === 'emails' && field.type === 'array') {
            return {
              ...field,
              fields: field.fields.map((sub) =>
                'name' in sub && sub.name === 'emailFrom' && sub.type === 'text'
                  ? { ...sub, defaultValue: EMAIL_INFO }
                  : sub,
              ),
            }
          }
          if ('name' in field && field.name === 'confirmationMessage') {
            return {
              ...field,
              editor: lexicalEditor({
                features: ({ rootFeatures }) => {
                  return [
                    ...rootFeatures,
                    FixedToolbarFeature(),
                    HeadingFeature({ enabledHeadingSizes: ['h1', 'h2', 'h3', 'h4'] }),
                  ]
                },
              }),
            }
          }
          return field
        })
      },
    },
  }),
  searchPlugin({
    collections: ['posts'],
    beforeSync: beforeSyncWithSearch,
    searchOverrides: {
      labels: { singular: 'Voce di ricerca', plural: 'Indice di ricerca' },
      admin: {
        group: 'Avanzate',
        hidden: nascostaSenzaPermesso('search'),
        description: 'Si aggiorna da solo quando si salvano le notizie: non serve modificarlo.',
      },
      access: accessoPubblico('search'),
      fields: ({ defaultFields }) => {
        return [...defaultFields, ...searchFields]
      },
    },
  }),
  // Per ultimo: ordina i gruppi della barra laterale dell'admin
  ordineMenu,
]
