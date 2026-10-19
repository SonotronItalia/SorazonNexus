import type { Field } from 'payload'

/**
 * Effetti di uno spazio (hero, contenitore): elenco di effetti della sezione "Effetti", ognuno
 * con "Attivo qui" per spegnerlo in questo punto senza toglierlo.
 */
export const campoEffetti = (overrides: Partial<Field> = {}): Field =>
  ({
    name: 'effetti',
    type: 'array',
    labels: { singular: 'Effetto', plural: 'Effetti' },
    admin: {
      // Righe aperte: nome dell'effetto e "Attivo qui" a colpo d'occhio
      initCollapsed: false,
      description:
        'Effetti animati dalla sezione "Effetti". Si vedono solo se attivi anche lì; il visitatore può spegnerli (fulmine nell\'header).',
    },
    fields: [
      {
        type: 'row',
        fields: [
          { name: 'effetto', type: 'relationship', relationTo: 'effetti', required: true },
          { name: 'attivo', label: 'Attivo qui', type: 'checkbox', defaultValue: true },
        ],
      },
    ],
    ...overrides,
  }) as Field
