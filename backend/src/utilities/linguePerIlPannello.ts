import type { Locale, PayloadRequest } from 'payload'

import { haAccessoCompleto, puòTradurre } from '@/access/ruoli'
import { LINGUA_PRINCIPALE } from '@/lingue'

/**
 * Lingue del selettore in alto nel pannello: l'italiano più quelle presenti in "Lingue e
 * selettore" (attive o in preparazione). Chi non ha l'accesso completo vede solo quelle che può
 * tradurre.
 */
export async function linguePerIlPannello({ locales, req }: { locales: Locale[]; req: PayloadRequest }) {
  const lingue = await req.payload
    .findGlobal({ slug: 'lingue', depth: 0, req, overrideAccess: true })
    .catch(() => null)
  const presenti = new Set<string>((lingue?.elenco ?? []).map((l) => l.codice))
  return locales.filter(
    (l) =>
      l.code === LINGUA_PRINCIPALE ||
      (presenti.has(l.code) && (haAccessoCompleto(req.user) || puòTradurre(req.user, l.code))),
  )
}
