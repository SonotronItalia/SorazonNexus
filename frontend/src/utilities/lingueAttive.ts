import type { Lingue } from '@/payload-types'

import { LINGUA_PRINCIPALE, LINGUE, type LinguaAttiva } from './lingue'

/**
 * Lingue del selettore: l'italiano e quelle attive in "Lingue e selettore", nell'ordine scelto,
 * con la bandiera scelta (o quella tipica della lingua).
 */
export const lingueAttive = (impostazioni: Lingue | null | undefined): LinguaAttiva[] => {
  const tutte = new Map(LINGUE.map((l) => [l.codice, l]))
  const it = tutte.get(LINGUA_PRINCIPALE)!
  const altre = (impostazioni?.elenco ?? [])
    .filter((l) => l.attiva && tutte.has(l.codice))
    .map((l) => {
      const base = tutte.get(l.codice)!
      return { codice: base.codice, nome: base.nome, bandiera: l.bandiera || base.bandiera }
    })
  return [{ codice: it.codice, nome: it.nome, bandiera: it.bandiera }, ...altre]
}
