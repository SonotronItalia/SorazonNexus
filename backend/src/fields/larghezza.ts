import type { Field } from 'payload'

/**
 * Larghezza di un blocco rispetto ai contenuti della pagina, dal 30% al 100% a passi di 10,
 * sempre centrata. Sui telefoni il blocco occupa comunque tutta la larghezza.
 * Con { schermo: true } c'è anche "Tutto lo schermo": il blocco esce dalla larghezza della
 * pagina e arriva ai bordi (con il solo margine laterale); dentro una colonna vale come 100%.
 */
export const campoLarghezza = ({ schermo = false }: { schermo?: boolean } = {}): Field => ({
  name: 'larghezza',
  type: 'select',
  defaultValue: '100',
  options: [
    ...(schermo ? [{ label: 'Tutto lo schermo', value: 'schermo' }] : []),
    ...['100', '90', '80', '70', '60', '50', '40', '30'].map((v) => ({
      label: `Larghezza ${v}%`,
      value: v,
    })),
  ],
})
