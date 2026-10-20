import type { CollectionConfig } from 'payload'
import { nascostaSenzaPermesso, permesso } from '@/access/ruoli'
import { POSIZIONI } from '@/fields/posizioni'

import { notifyFrontend } from '@/hooks/notifyFrontend'

/**
 * Effetti visivi riutilizzabili (sezione "Effetti" dell'admin): ognuno è un tipo di animazione
 * (scritto e verificato nel codice del sito, frontend/src/components/Effetti) con i suoi
 * parametri. Si scelgono negli hero (Banner, High Impact, Sorazon) e nel Contenitore.
 * "Attivo" spegne l'effetto ovunque senza toglierlo dalle pagine.
 * Vincoli per la fotosensibilità nel codice: niente lampeggi, dissolvenze morbide.
 */
export const Effetti: CollectionConfig = {
  slug: 'effetti',
  labels: { singular: 'Effetto', plural: 'Effetti' },
  admin: {
    useAsTitle: 'nome',
    defaultColumns: ['nome', 'tipo', 'attivo'],
    group: 'Aspetto del sito',
    hidden: nascostaSenzaPermesso('effetti'),
    description:
      'Effetti animati per hero e contenitori. Spegnendo "Attivo" l\'effetto sparisce da tutte le pagine che lo usano.',
  },
  access: {
    read: () => true,
    create: permesso('effetti', 'crea'),
    update: permesso('effetti', 'modifica'),
    delete: permesso('effetti', 'elimina'),
  },
  fields: [
    {
      type: 'row',
      fields: [
        {
          name: 'nome',
          type: 'text',
          required: true,
          unique: true,
          admin: { description: 'Es. Scarica celeste' },
        },
        {
          name: 'attivo',
          type: 'checkbox',
          defaultValue: true,
          admin: { description: "Spento: l'effetto non si vede in nessuna pagina" },
        },
      ],
    },
    {
      name: 'tipo',
      type: 'select',
      required: true,
      options: [
        { label: 'Alone pulsante', value: 'pulsazione' },
        { label: 'Scarica di Tesla', value: 'scarica' },
        { label: 'Particelle luminose', value: 'particelle' },
        { label: 'Onde concentriche', value: 'onde' },
        { label: 'Bagliore in movimento', value: 'bagliore' },
        { label: 'Personalizzato (dalla sezione "Tipi di effetto")', value: 'personalizzato' },
      ],
    },
    {
      name: 'tipoPersonalizzato',
      label: 'Tipo personalizzato',
      type: 'relationship',
      relationTo: 'tipi-effetto',
      admin: {
        condition: (_, s = {}) => s.tipo === 'personalizzato',
        description: 'Il codice dell\'animazione, scritto nella sezione "Tipi di effetto".',
      },
      validate: (valore: unknown, { siblingData }: { siblingData: Record<string, unknown> }) =>
        siblingData?.tipo !== 'personalizzato' ||
        Boolean(valore) ||
        'Scegli un tipo personalizzato',
    },
    {
      type: 'row',
      fields: [
        {
          name: 'colore',
          type: 'relationship',
          relationTo: 'colori',
          admin: { description: "Dalla tavolozza. Vuoto: il colore tipico dell'effetto." },
        },
        {
          name: 'intensita',
          label: 'Intensità',
          type: 'select',
          defaultValue: 'media',
          options: [
            { label: 'Bassa', value: 'bassa' },
            { label: 'Media', value: 'media' },
            { label: 'Alta', value: 'alta' },
          ],
        },
        {
          name: 'velocita',
          label: 'Velocità',
          type: 'select',
          defaultValue: 'normale',
          options: [
            { label: 'Lenta', value: 'lenta' },
            { label: 'Normale', value: 'normale' },
            { label: 'Veloce', value: 'veloce' },
          ],
        },
        {
          name: 'posizione',
          label: 'Punto di partenza',
          type: 'select',
          defaultValue: 'centro-destra',
          admin: {
            condition: (_, s = {}) =>
              ['scarica', 'onde', 'pulsazione', 'personalizzato'].includes(s.tipo),
          },
          options: POSIZIONI,
        },
      ],
    },
  ],
  hooks: {
    afterChange: [notifyFrontend('pages', 'globals')],
    afterDelete: [notifyFrontend('pages', 'globals')],
  },
}
