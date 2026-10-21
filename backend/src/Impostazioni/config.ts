import type { Field, GlobalConfig } from 'payload'

import { campoConPermesso, eAmministratore, nascostaSenzaPermesso, permesso } from '@/access/ruoli'
import { campoSocial } from '@/fields/social'
import { link } from '@/fields/link'
import { notifyFrontend } from '@/hooks/notifyFrontend'

// La scheda "Analisi e pubblicità" ha un permesso a sé (Ruoli e permessi): può inserire script
const analisi = campoConPermesso('impostazioni-analisi', 'modifica')

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
  // Solo chi ha il permesso cambia il tracciamento (gli altri vedono il valore ma non lo modificano)
  access: { create: analisi, update: analisi },
  validate: (valore: string | null | undefined) =>
    !valore || formato.test(valore.trim()) || `Formato non valido: deve essere come ${esempio}`,
  hooks: {
    beforeChange: [({ value }) => (typeof value === 'string' ? value.trim().toUpperCase() : value)],
  },
})

// Un file della raccolta "marchio" (loghi e icona, anche SVG)
const fileMarchio = (name: string, label: string, description: string): Field => ({
  name,
  label,
  type: 'upload',
  relationTo: 'marchio',
  admin: { description, width: '50%' },
})

/**
 * Impostazioni generali del sito, a schede: Google
 * (Tag Manager, Analytics, Ads, Consent Mode), avviso in cima alle pagine, profili social, marchio
 * (loghi e icona del sito).
 */
export const Impostazioni: GlobalConfig = {
  slug: 'impostazioni',
  label: 'Impostazioni del sito',
  admin: {
    group: 'Impostazioni',
    hidden: nascostaSenzaPermesso('impostazioni'),
    description: 'Le impostazioni generali valgono per tutte le pagine del sito.',
  },
  access: {
    read: () => true,
    update: permesso('impostazioni', 'modifica'),
  },
  fields: [
    {
      // Nome, descrizione e tutto ciò che riguarda Google e gli assistenti AI: Avanzate > SEO
      name: 'rimandoSeo',
      type: 'ui',
      admin: { components: { Field: '@/components/admin/RimandoSeo#RimandoSeo' } },
    },
    {
      type: 'tabs',
      tabs: [
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
              access: { create: analisi, update: analisi },
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
          localized: true,
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
        {
          // Loghi e icona: file della raccolta "marchio" (l'unica che accetta SVG, controllati).
          // Vuoti: il sito usa i file del marchio Sorazon nel codice (frontend/public)
          name: 'marchio',
          label: 'Marchio',
          description:
            "Logo e icona del sito. Le dimensioni a schermo le decide il sito: carica il file intero, senza margini attorno. Formati: SVG (consigliato), PNG o WebP di almeno 1000 px di larghezza. Un campo vuoto usa il logo Sorazon predefinito.",
          fields: [
            {
              type: 'row',
              fields: [
                fileMarchio('positivo', 'Logo per sfondo chiaro', 'Barra in alto con il tema chiaro.'),
                fileMarchio(
                  'negativo',
                  'Logo per sfondo scuro',
                  'Barra in alto con il tema scuro e sopra le aperture scure.',
                ),
              ],
            },
            {
              type: 'row',
              fields: [
                fileMarchio(
                  'compatto',
                  'Logo compatto (facoltativo)',
                  'Una versione più piccola, per esempio solo il simbolo: barra ridotta durante lo scorrimento e telefoni. Vuoto: il logo intero.',
                ),
                fileMarchio(
                  'compattoNegativo',
                  'Logo compatto per sfondo scuro (facoltativo)',
                  'Vuoto: il logo compatto (o il logo per sfondo scuro).',
                ),
              ],
            },
            fileMarchio(
              'piede',
              'Logo del piè di pagina (facoltativo)',
              'Il piè di pagina è nero. Vuoto: il logo per sfondo scuro.',
            ),
            {
              type: 'row',
              fields: [
                fileMarchio(
                  'icona',
                  'Icona del sito',
                  "Quadrata, SVG o PNG di almeno 512 × 512 px. Il sito ne ricava tutte le misure: scheda del browser, iPhone (Aggiungi a Home), Android.",
                ),
                fileMarchio(
                  'iconaScura',
                  'Icona per il tema scuro del browser (facoltativa)',
                  'Per la scheda del browser quando il sistema è in tema scuro (per esempio se l\'icona è nera). Vuoto: la stessa icona.',
                ),
              ],
            },
            {
              // Tema del pannello (components/admin/TemaPannello): spento = Payload standard
              name: 'pannelloSorazon',
              label: 'Aspetto Sorazon del pannello',
              type: 'checkbox',
              defaultValue: true,
              access: { update: eAmministratore },
              admin: {
                description:
                  'Colori, carattere e angoli del marchio anche in questo pannello. Spegnilo se dopo un aggiornamento qualcosa nel pannello non si vede bene: torna subito l\'aspetto standard. Lo cambia solo un amministratore.',
              },
            },
          ],
        },
      ],
    },
  ],
  hooks: {
    afterChange: [notifyFrontend('globals')],
  },
}
