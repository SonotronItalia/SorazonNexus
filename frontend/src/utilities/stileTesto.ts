import type { CSSProperties } from 'react'

/**
 * Stile del testo scritto dall'editor ("Stile testo" nell'admin): si accettano solo queste
 * proprietà e solo nei formati che l'editor produce, il resto si ignora.
 * - color: var(--colore-ID, #RRGGBB)   (colore della tavolozza; la variabile la scrive il layout)
 * - font-size: var(--testo-CHIAVE, valore) (dimensioni responsive in globals.css)
 * - font-weight: 500                     (sottotitolo)
 */
const DIMENSIONI = ['piccolo', 'grande', 'molto-grande', 'enorme', 'sottotitolo']

const AMMESSI: Record<string, { regola: RegExp; prop: keyof CSSProperties }> = {
  color: { regola: /^var\(--colore-\d+, ?#[0-9a-fA-F]{6}\)$/, prop: 'color' },
  'font-size': {
    regola: new RegExp(`^var\\(--testo-(${DIMENSIONI.join('|')}), ?[0-9.]+rem\\)$`),
    prop: 'fontSize',
  },
  'font-weight': { regola: /^500$/, prop: 'fontWeight' },
}

export function stileTesto(stile: string | undefined | null): CSSProperties | undefined {
  if (!stile) return undefined
  const risultato: Record<string, string> = {}
  for (const dichiarazione of stile.split(';')) {
    const i = dichiarazione.indexOf(':')
    if (i < 0) continue
    const nome = dichiarazione.slice(0, i).trim().toLowerCase()
    const valore = dichiarazione.slice(i + 1).trim()
    const ammesso = AMMESSI[nome]
    if (ammesso && ammesso.regola.test(valore)) risultato[ammesso.prop] = valore
  }
  return Object.keys(risultato).length ? (risultato as CSSProperties) : undefined
}
