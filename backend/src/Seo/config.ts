import type { Field, GlobalConfig } from 'payload'

import { nascostaSenzaPermesso, permesso } from '@/access/ruoli'
import { notifyFrontend } from '@/hooks/notifyFrontend'

// Assistenti AI che si possono ammettere o escludere (robots.txt). I nomi dei loro crawler stanno
// nel frontend (app/robots.ts), che li legge da qui con la stessa chiave
export const ASSISTENTI_AI = [
  { name: 'chatgpt', label: 'ChatGPT (OpenAI)' },
  { name: 'claude', label: 'Claude (Anthropic)' },
  { name: 'perplexity', label: 'Perplexity' },
  { name: 'gemini', label: 'Gemini e AI di Google' },
  { name: 'apple', label: 'Apple Intelligence' },
  { name: 'meta', label: 'Meta AI' },
  { name: 'commonCrawl', label: 'Common Crawl (archivio usato per addestrare molti modelli)' },
] as const

const percorso = (valore: unknown) =>
  typeof valore === 'string' && /^\/[^\s?#]*$/.test(valore.trim())
    ? true
    : 'Scrivi un percorso del sito che inizia con /, es. /promozione-2025'

const testo = (name: string, label: string, description?: string): Field => ({
  name,
  label,
  type: 'text',
  ...(description ? { admin: { description } } : {}),
})

/**
 * SEO e motori di risposta AI (GEO), in un solo posto: nome e descrizione del sito, titolo,
 * immagine di condivisione, verifiche di Google e Bing, pagine escluse, assistenti AI ammessi,
 * llms.txt e dati dell'azienda per i dati strutturati. Valori nel codice come riserva.
 */
export const Seo: GlobalConfig = {
  slug: 'seo',
  label: 'SEO e motori AI',
  admin: {
    group: 'Avanzate',
    hidden: nascostaSenzaPermesso('seo'),
    description:
      'Come il sito si presenta a Google, ai social e agli assistenti AI. Le modifiche valgono entro pochi secondi; un errore qui può far sparire il sito dalle ricerche.',
  },
  access: {
    read: () => true,
    update: permesso('seo', 'modifica'),
  },
  fields: [
    {
      type: 'tabs',
      tabs: [
        {
          label: 'Sito',
          fields: [
            {
              name: 'nomeSito',
              label: 'Nome del sito',
              type: 'text',
              required: true,
              defaultValue: 'Sorazon',
              admin: {
                description: 'Compare nel titolo delle pagine su Google e nelle condivisioni sui social.',
              },
            },
            {
              name: 'descrizioneSito',
              label: 'Descrizione del sito',
              type: 'textarea',
              maxLength: 200,
              admin: {
                description:
                  'Usata da Google, dalle condivisioni e da llms.txt quando una pagina non ha una descrizione propria. Ideale: 120-160 caratteri.',
              },
            },
            {
              name: 'modelloTitolo',
              label: 'Modello del titolo',
              type: 'text',
              defaultValue: '{pagina} | {sito}',
              admin: {
                description:
                  '{pagina} è il titolo della pagina, {sito} il nome del sito. La Home usa solo il nome del sito.',
              },
              validate: (v: unknown) =>
                !v || (typeof v === 'string' && v.includes('{pagina}')) || 'Il modello deve contenere {pagina}',
            },
            {
              name: 'immagineCondivisione',
              label: 'Immagine di condivisione predefinita',
              type: 'upload',
              relationTo: 'media',
              admin: {
                description:
                  'Per le pagine senza un\'immagine SEO propria (almeno 1200×630). Vuota: si genera un\'immagine con il titolo.',
              },
            },
          ],
        },
        {
          name: 'ricerca',
          label: 'Motori di ricerca',
          fields: [
            {
              name: 'nascondiSito',
              label: 'Nascondi tutto il sito ai motori di ricerca',
              type: 'checkbox',
              defaultValue: false,
              admin: {
                description:
                  'Solo per un sito di prova o in costruzione: Google e gli altri smettono di mostrarlo. Sul sito pubblico deve restare spento.',
              },
            },
            {
              type: 'row',
              fields: [
                testo(
                  'verificaGoogle',
                  'Codice di verifica di Google Search Console',
                  'Solo il codice del tag "google-site-verification".',
                ),
                testo('verificaBing', 'Codice di verifica di Bing', 'Il codice del tag "msvalidate.01".'),
              ],
            },
            {
              name: 'escluse',
              label: 'Pagine da non indicizzare',
              type: 'array',
              labels: { singular: 'Pagina esclusa', plural: 'Pagine escluse' },
              admin: {
                description:
                  'Restano visitabili ma non compaiono su Google né negli assistenti AI. API, anteprima e ricerca sono già escluse.',
              },
              fields: [
                {
                  name: 'percorso',
                  label: 'Percorso',
                  type: 'text',
                  required: true,
                  admin: { placeholder: '/promozione-2025' },
                  validate: percorso,
                },
              ],
            },
          ],
        },
        {
          name: 'ai',
          label: 'Motori AI (GEO)',
          description:
            'Gli assistenti ammessi leggono il sito e possono citarlo nelle risposte. Escluderne uno vale da quando il suo crawler rilegge robots.txt.',
          fields: [
            {
              name: 'ammessi',
              label: 'Assistenti che possono leggere il sito',
              type: 'group',
              fields: [
                {
                  type: 'row',
                  fields: ASSISTENTI_AI.map((a) => ({
                    name: a.name,
                    label: a.label,
                    type: 'checkbox' as const,
                    defaultValue: true,
                  })),
                },
              ],
            },
            {
              name: 'llmsPresentazione',
              label: 'Presentazione in llms.txt',
              type: 'textarea',
              admin: {
                description:
                  'Testo in più sotto la descrizione del sito nel file /llms.txt (il sommario del sito per gli assistenti AI). Solo fatti, niente affermazioni sanitarie.',
              },
            },
            {
              type: 'row',
              fields: [
                {
                  name: 'llmsCentri',
                  label: 'llms.txt: elenco dei centri per regione',
                  type: 'checkbox',
                  defaultValue: true,
                },
                {
                  name: 'llmsNotizie',
                  label: 'llms.txt: elenco delle notizie',
                  type: 'checkbox',
                  defaultValue: true,
                },
              ],
            },
          ],
        },
        {
          name: 'azienda',
          label: "Dati dell'azienda",
          description:
            'Per i dati strutturati che leggono Google e gli assistenti AI (chi siamo, dove siamo, come contattarci). I dati in fondo alle pagine si cambiano nel Piè di pagina; i profili social in Impostazioni del sito.',
          fields: [
            {
              type: 'row',
              fields: [
                testo('ragioneSociale', 'Ragione sociale'),
                {
                  name: 'logo',
                  label: 'Logo',
                  type: 'upload',
                  relationTo: 'media',
                  admin: { description: 'Vuoto: il logo del sito.' },
                },
              ],
            },
            {
              type: 'row',
              fields: [
                testo('via', 'Via e numero'),
                testo('cap', 'CAP'),
                testo('citta', 'Città'),
                testo('provincia', 'Provincia (sigla)'),
              ],
            },
            {
              type: 'row',
              fields: [
                testo('telefono', 'Telefono', 'Con prefisso internazionale, es. +39 0721 808759'),
                { name: 'email', label: 'Email', type: 'email' },
              ],
            },
            {
              type: 'row',
              fields: [testo('partitaIva', 'Partita IVA'), testo('codiceFiscale', 'Codice fiscale')],
            },
          ],
        },
      ],
    },
  ],
  hooks: {
    afterChange: [notifyFrontend('globals', 'pages-sitemap', 'posts-sitemap')],
  },
}
