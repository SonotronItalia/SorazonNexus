import type { Field, GlobalConfig } from 'payload'

import { authenticated } from '@/access/authenticated'
import { campoSoloAmministratori } from '@/access/ruoli'
import { campoSocial } from '@/fields/social'
import { link } from '@/fields/link'
import { notifyFrontend } from '@/hooks/notifyFrontend'

// Formati degli ID di Google: un ID sbagliato non deve finire nella pagina
export const FORMATI_ID = {
  gtm: /^GTM-[A-Z0-9]{4,10}$/,
  ga: /^G-[A-Z0-9]{4,12}$/,
  ads: /^AW-\d{6,12}$/,
} as const

const idGoogle = (
  name: string,
  label: string,
  formato: RegExp,
  esempio: string,
  descrizione: string,
): Field => ({
  name,
  label,
  type: 'text',
  admin: {
    description: `${descrizione} Esempio: ${esempio}. Vuoto: non si usa.`,
    placeholder: esempio,
  },
  // Solo un amministratore cambia il tracciamento (un redattore vede il valore ma non lo modifica)
  access: { create: campoSoloAmministratori, update: campoSoloAmministratori },
  validate: (valore: string | null | undefined) =>
    !valore || formato.test(valore.trim()) || `Formato non valido: deve essere come ${esempio}`,
  hooks: {
    beforeChange: [({ value }) => (typeof value === 'string' ? value.trim().toUpperCase() : value)],
  },
})

/**
 * Impostazioni generali del sito, in un solo posto e a schede: nome e descrizione, Google
 * (Tag Manager, Analytics, Ads, Consent Mode), avviso in cima alle pagine, profili social.
 */
export const Impostazioni: GlobalConfig = {
  slug: 'impostazioni',
  label: 'Impostazioni del sito',
  admin: {
    group: 'Impostazioni',
    description: 'Le impostazioni generali valgono per tutte le pagine del sito.',
  },
  access: {
    read: () => true,
    update: authenticated,
  },
  fields: [
    {
      // Collegamento agli Strumenti avanzati, visibile solo agli amministratori
      name: 'strumentiAvanzati',
      type: 'ui',
      admin: {
        components: { Field: '@/components/admin/StrumentiAvanzati/Collegamento#Collegamento' },
      },
    },
    {
      type: 'tabs',
      tabs: [
        {
          label: 'Generale',
          fields: [
            {
              name: 'nomeSito',
              label: 'Nome del sito',
              type: 'text',
              required: true,
              defaultValue: 'Sorazon',
              admin: {
                description:
                  'Compare nel titolo delle pagine su Google e nelle condivisioni sui social.',
              },
            },
            {
              name: 'descrizioneSito',
              label: 'Descrizione del sito',
              type: 'textarea',
              maxLength: 200,
              admin: {
                description:
                  'Frase usata da Google e dalle condivisioni quando una pagina non ha una descrizione propria. Ideale: 120-160 caratteri.',
              },
            },
          ],
        },
        {
          name: 'analisi',
          label: 'Analisi e pubblicità',
          description:
            'Strumenti di Google per misurare le visite e le campagne. Si attivano solo dopo il consenso del visitatore (banner dei cookie). Li modifica solo un amministratore.',
          fields: [
            {
              name: 'modalitaConsenso',
              label: 'Modalità del consenso (Google Consent Mode v2)',
              type: 'select',
              required: true,
              defaultValue: 'base',
              options: [
                {
                  label: 'Base: nessun contatto con Google prima del consenso (consigliata)',
                  value: 'base',
                },
                {
                  label:
                    'Avanzata: Google riceve segnali anonimi, senza cookie, anche prima del consenso',
                  value: 'avanzata',
                },
              ],
              admin: {
                description:
                  'Avanzata stima anche le visite di chi rifiuta i cookie, ma il browser contatta Google subito: deciderla con il consulente privacy e indicarla nella cookie policy.',
              },
              access: { create: campoSoloAmministratori, update: campoSoloAmministratori },
            },
            idGoogle(
              'googleTagManagerId',
              'ID di Google Tag Manager',
              FORMATI_ID.gtm,
              'GTM-ABC1234',
              'Con Tag Manager, Analytics e Ads si configurano dentro Tag Manager e i due campi sotto non servono. Attenzione: chi gestisce Tag Manager può aggiungere script al sito.',
            ),
            idGoogle(
              'googleAnalyticsId',
              'ID di Google Analytics 4',
              FORMATI_ID.ga,
              'G-ABC123XYZ9',
              'Si trova in Analytics > Amministrazione > Stream di dati.',
            ),
            idGoogle(
              'googleAdsId',
              'ID di Google Ads',
              FORMATI_ID.ads,
              'AW-123456789',
              'Per misurare le conversioni delle campagne. Si trova in Google Ads > Strumenti > Conversioni.',
            ),
          ],
        },
        {
          name: 'avviso',
          label: 'Avviso in cima al sito',
          description:
            'Una striscia sopra il menu, in tutte le pagine: chiusure per ferie, eventi, novità. Con le date si accende e si spegne da sola.',
          fields: [
            {
              type: 'row',
              fields: [
                { name: 'attivo', label: "Mostra l'avviso", type: 'checkbox', defaultValue: false },
                {
                  name: 'chiudibile',
                  label: 'Il visitatore può chiuderlo',
                  type: 'checkbox',
                  defaultValue: true,
                  admin: { description: 'Chiuso, non ricompare finché non si cambia il testo.' },
                },
              ],
            },
            {
              name: 'testo',
              label: 'Testo',
              type: 'text',
              maxLength: 160,
              admin: {
                description: 'Breve, una riga. Es. "Chiusi per ferie dal 10 al 24 agosto".',
              },
              validate: (
                valore: string | null | undefined,
                { siblingData }: { siblingData: { attivo?: boolean } },
              ) => !siblingData?.attivo || Boolean(valore?.trim()) || "Scrivi il testo dell'avviso",
            },
            {
              name: 'stile',
              label: 'Stile',
              type: 'select',
              defaultValue: 'informazione',
              options: [
                { label: 'Informazione (colori tenui)', value: 'informazione' },
                { label: 'Importante (in evidenza)', value: 'importante' },
                { label: 'Promozione (colore del sito)', value: 'promozione' },
              ],
            },
            {
              type: 'row',
              fields: [
                {
                  name: 'inizio',
                  label: 'Dal',
                  type: 'date',
                  admin: {
                    date: { pickerAppearance: 'dayAndTime' },
                    description: 'Vuoto: da subito.',
                  },
                },
                {
                  name: 'fine',
                  label: 'Al',
                  type: 'date',
                  admin: {
                    date: { pickerAppearance: 'dayAndTime' },
                    description: 'Vuoto: finché non lo spegni.',
                  },
                  validate: (
                    valore: unknown,
                    { siblingData }: { siblingData: { inizio?: string } },
                  ) =>
                    !valore ||
                    !siblingData?.inizio ||
                    new Date(String(valore)) > new Date(siblingData.inizio) ||
                    "La fine deve venire dopo l'inizio",
                },
              ],
            },
            {
              name: 'conLink',
              label: 'Aggiungi un collegamento',
              type: 'checkbox',
              defaultValue: false,
            },
            link({
              appearances: false,
              overrides: {
                admin: { condition: (_: unknown, s: { conLink?: boolean }) => Boolean(s?.conLink) },
              },
            }),
          ],
        },
        {
          label: 'Social',
          fields: [campoSocial],
        },
      ],
    },
  ],
  hooks: {
    afterChange: [notifyFrontend('globals')],
  },
}
