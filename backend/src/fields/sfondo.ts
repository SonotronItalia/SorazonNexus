import type { Field } from 'payload'

/**
 * Sfondo di un blocco: varianti fisse oppure un colore della tavolozza ("Colori del sito").
 * Nome del campo corto ("colore"): i nomi dei vincoli di Postgres hanno un limite di 63 caratteri
 * e con un nome lungo verrebbero troncati (i campi relazione non accettano dbName).
 */
export const campiSfondo = (): Field[] => [
  {
    name: 'sfondo',
    type: 'select',
    defaultValue: 'nessuno',
    options: [
      { label: 'Nessuno', value: 'nessuno' },
      { label: 'Tenue', value: 'tenue' },
      { label: 'Scuro', value: 'scuro' },
      { label: 'Colore del sito', value: 'colore' },
    ],
  },
  {
    name: 'colore',
    label: 'Colore di sfondo',
    type: 'relationship',
    relationTo: 'colori',
    admin: {
      condition: (_data, siblingData) => siblingData?.sfondo === 'colore',
      description: 'Si aggiunge o si modifica in "Colori del sito".',
    },
    validate: (valore: unknown, { siblingData }: { siblingData: Record<string, unknown> }) =>
      siblingData?.sfondo !== 'colore' || Boolean(valore) || 'Scegli un colore della tavolozza',
  },
]
