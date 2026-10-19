// Larghezza di un blocco (30-100% dello spazio disponibile), centrata; negli spazi stretti 100%.
// Container query: serve un antenato con la classe @container (il .container del blocco).
// Le classi stanno scritte per intero: Tailwind non vede quelle costruite al volo.
export const LARGHEZZE = {
  '100': '',
  '90': '@2xl:w-[90%]',
  '80': '@2xl:w-[80%]',
  '70': '@2xl:w-[70%]',
  '60': '@2xl:w-[60%]',
  '50': '@2xl:w-[50%]',
  '40': '@2xl:w-[40%]',
  '30': '@2xl:w-[30%]',
} as const

export const classeLarghezza = (larghezza: keyof typeof LARGHEZZE | null | undefined) =>
  `mx-auto w-full ${LARGHEZZE[larghezza ?? '100']}`
