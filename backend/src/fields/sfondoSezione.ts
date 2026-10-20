import type { Field } from 'payload'

// Sfondo delle sezioni in stile pagina prodotto: alternanza di bianco, grigio chiarissimo e nero
// Con "nessuno" (blocchi nati senza sfondo, come Modulo e Mappa) il blocco resta com'era
export const sfondoSezione = (
  predefinito: 'nessuno' | 'scuro' | 'chiaro' | 'tenue' = 'scuro',
): Field => ({
  name: 'sfondo',
  label: 'Sfondo',
  type: 'select',
  defaultValue: predefinito,
  options: [
    ...(predefinito === 'nessuno' ? [{ label: 'Nessuno', value: 'nessuno' }] : []),
    { label: 'Nero profondo', value: 'scuro' },
    { label: 'Bianco', value: 'chiaro' },
    { label: 'Grigio chiarissimo', value: 'tenue' },
  ],
  admin: { description: 'Alternare sezioni chiare e scure dà ritmo alla pagina.' },
})
