import type { Field } from 'payload'

/**
 * Larghezza di un blocco rispetto ai contenuti della pagina, dal 30% al 100% a passi di 10,
 * sempre centrata. Sui telefoni il blocco occupa comunque tutta la larghezza.
 */
export const campoLarghezza = (): Field => ({
  name: 'larghezza',
  type: 'select',
  defaultValue: '100',
  options: ['100', '90', '80', '70', '60', '50', '40', '30'].map((v) => ({
    label: `Larghezza ${v}%`,
    value: v,
  })),
})
