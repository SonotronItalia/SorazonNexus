import type { CSSProperties } from 'react'

import type { Colori } from '@/payload-types'

export type VarianteSfondo = 'nessuno' | 'tenue' | 'scuro' | 'colore'

// Le classi stanno scritte per intero: Tailwind non vede quelle costruite al volo
const CLASSI: Record<VarianteSfondo, string> = {
  nessuno: '',
  tenue: 'bg-muted',
  scuro: 'bg-background text-foreground',
  colore: 'text-foreground',
}

// Colore della tavolozza solo se arrivato per intero e con un codice valido
export const codiceColore = (colore: number | Colori | null | undefined): string | undefined =>
  colore && typeof colore === 'object' && /^#[0-9a-fA-F]{6}$/.test(colore.codice)
    ? colore.codice
    : undefined

// Luminanza relativa (WCAG): sotto 0,179 il testo bianco contrasta più di quello scuro
export const scuro = (codice: string) => {
  const [r, g, b] = [1, 3, 5].map((i) => {
    const c = parseInt(codice.slice(i, i + 2), 16) / 255
    return c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4
  })
  return 0.2126 * r + 0.7152 * g + 0.0722 * b < 0.179
}

/**
 * Classi, stile e tema di una sezione con sfondo. Con un colore della tavolozza la sezione
 * prende il tema chiaro o scuro del sito in base al colore: titoli, testi secondari e
 * pulsanti restano leggibili senza altre scelte. Un colore mancante (es. eliminato dalla
 * tavolozza) vale come "nessuno".
 */
export function sfondo(
  variante: VarianteSfondo | null | undefined,
  colore: number | Colori | null | undefined,
): { className: string; style?: CSSProperties; 'data-theme'?: 'dark' | 'light' } {
  const v = variante ?? 'nessuno'
  if (v === 'colore') {
    const codice = codiceColore(colore)
    if (!codice) return { className: '' }
    return {
      className: CLASSI.colore,
      style: { backgroundColor: codice },
      'data-theme': scuro(codice) ? 'dark' : 'light',
    }
  }
  // "Scuro" usa il tema scuro del sito solo per questa sezione
  return { className: CLASSI[v], ...(v === 'scuro' ? { 'data-theme': 'dark' as const } : {}) }
}
