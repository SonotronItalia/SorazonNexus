// Sfondi delle sezioni in stile pagina prodotto (campo "sfondo" dei blocchi nuovi).
// Classi scritte per intero; data-theme fa seguire al contenuto i colori giusti.
export type SfondoSezione = 'scuro' | 'chiaro' | 'tenue'

const CLASSI: Record<SfondoSezione, string> = {
  scuro: 'bg-black text-white',
  chiaro: 'bg-white text-neutral-900',
  tenue: 'bg-[#f5f5f7] text-neutral-900',
}

export const sezione = (sfondo: SfondoSezione | null | undefined) => {
  const s = sfondo ?? 'scuro'
  return {
    className: CLASSI[s],
    'data-theme': s === 'scuro' ? ('dark' as const) : ('light' as const),
  }
}
