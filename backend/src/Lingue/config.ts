import type { GlobalConfig } from 'payload'

import { nascostaSenzaPermesso, permesso } from '@/access/ruoli'
import { notifyFrontend } from '@/hooks/notifyFrontend'
import { LINGUE_TRADUCIBILI, PAESI } from '@/lingue'

/**
 * Lingue del sito e selettore con le bandiere. L'italiano c'è sempre ed è la prima; le altre si
 * scelgono dall'elenco di src/lingue.ts, si attivano e si ordinano qui. Una lingua attiva compare
 * nel selettore e nel pannello (per tradurre); le singole pagine si mostrano in quella lingua solo
 * quando sono tradotte ("Pubblicata in questa lingua").
 */
export const Lingue: GlobalConfig = {
  slug: 'lingue',
  label: 'Lingue e selettore',
  admin: {
    group: 'Impostazioni',
    hidden: nascostaSenzaPermesso('lingue'),
    description:
      "Le lingue del sito oltre all'italiano. Attivandone una compare nel selettore con la bandiera; le pagine appaiono in quella lingua solo quando sono tradotte.",
  },
  access: {
    read: () => true,
    update: permesso('lingue', 'modifica'),
  },
  fields: [
    {
      name: 'stile',
      label: 'Aspetto del selettore',
      type: 'select',
      required: true,
      defaultValue: 'bandiera-nome',
      options: [
        { label: 'Bandiera e nome della lingua (es. English)', value: 'bandiera-nome' },
        { label: 'Bandiera e sigla (es. EN)', value: 'bandiera-sigla' },
        { label: 'Solo bandiera', value: 'bandiera' },
      ],
    },
    {
      name: 'elenco',
      label: 'Lingue',
      labels: { singular: 'Lingua', plural: 'Lingue' },
      type: 'array',
      dbName: 'lingue_el',
      admin: {
        description:
          "L'ordine qui è l'ordine nel selettore, dopo l'italiano. Trascina per cambiarlo. Una lingua che non c'è nell'elenco va aggiunta da uno sviluppatore.",
        components: { RowLabel: '@/components/admin/EtichettaLingua#EtichettaLingua' },
      },
      validate: (righe: unknown) => {
        const codici = (Array.isArray(righe) ? righe : []).map((r) => (r as { codice?: string })?.codice)
        return new Set(codici).size === codici.length || 'Ogni lingua può comparire una volta sola'
      },
      fields: [
        {
          type: 'row',
          fields: [
            {
              name: 'codice',
              label: 'Lingua',
              type: 'select',
              required: true,
              options: LINGUE_TRADUCIBILI.map((l) => ({ label: `${l.etichetta} (${l.nome})`, value: l.codice })),
            },
            {
              name: 'bandiera',
              label: 'Bandiera',
              type: 'select',
              admin: { description: 'Vuota: quella tipica della lingua.' },
              options: Object.entries(PAESI).map(([codice, paese]) => ({ label: paese, value: codice })),
            },
            {
              name: 'attiva',
              label: 'Attiva sul sito',
              type: 'checkbox',
              defaultValue: false,
              admin: { description: 'Spenta: si può tradurre ma non compare nel selettore.' },
            },
          ],
        },
      ],
    },
  ],
  hooks: {
    afterChange: [notifyFrontend('globals', 'pages', 'posts', 'pages-sitemap', 'posts-sitemap')],
  },
}
