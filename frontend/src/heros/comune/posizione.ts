import { cn } from '@/utilities/ui'

// Le classi stanno scritte per intero: Tailwind non vede quelle costruite al volo
const RIGA = { alto: 'items-start', centro: 'items-center', basso: 'items-end' } as const
const COLONNA = { sinistra: 'justify-start', centro: 'justify-center', destra: 'justify-end' } as const
const TESTO = {
  sinistra: 'text-left [&_ul]:justify-start',
  centro: 'text-center [&_ul]:justify-center',
  destra: 'text-right [&_ul]:justify-end',
} as const

// Sfumatura dietro il titolo quando non c'è una sovrapposizione: dal lato del titolo
export const SFUMATURA = {
  alto: 'bg-gradient-to-b from-black/60 via-black/25 to-transparent',
  centro: 'bg-black/25',
  basso: 'bg-gradient-to-t from-black/60 via-black/25 to-transparent',
} as const

export type Posizione = `${keyof typeof RIGA}-${keyof typeof COLONNA}`

/**
 * Classi per la posizione del titolo nell'hero: "riga-colonna" (es. "alto-centro").
 * Il contenitore è un flex a tutta area: la riga allinea in verticale, la colonna in orizzontale.
 */
export const posizioneTitolo = (valore: string | null | undefined, predefinita: Posizione) => {
  const [riga, colonna] = ((valore || predefinita) as Posizione).split('-') as [
    keyof typeof RIGA,
    keyof typeof COLONNA,
  ]
  return {
    riga,
    verticale: RIGA[riga] ?? RIGA.centro,
    orizzontale: COLONNA[colonna] ?? COLONNA.centro,
    testo: cn(TESTO[colonna] ?? TESTO.centro),
  }
}
