import type { Access, FieldAccess } from 'payload'

import { LINGUA_PRINCIPALE } from '@/lingue'

import { type Azione, risorsa, TRADUCIBILI } from './risorse'

/**
 * Permessi dai ruoli personalizzati (collezione "ruoli", nell'admin "Ruoli e permessi").
 * Ogni utente ha un ruolo (campo "profilo"); il ruolo ha "Accesso completo" oppure, voce per
 * voce, le caselle Vede / Crea / Modifica / Elimina. L'utente arriva nella richiesta con il
 * ruolo già caricato (auth.depth = 1 in Users), quindi i controlli non rileggono il database.
 */
type Permessi = Record<string, Partial<Record<Azione, boolean | null>> | null | undefined>
type Profilo = {
  completo?: boolean | null
  permessi?: Permessi | null
  traduzioni?: Record<string, boolean | null | undefined> | null
}
type Utente = { id?: number | string; profilo?: Profilo | number | string | null } | null | undefined

const profiloDi = (user: unknown): Profilo | null => {
  const p = (user as Utente)?.profilo
  return p && typeof p === 'object' ? p : null
}

// Il ruolo dell'utente ha "Accesso completo"
export const haAccessoCompleto = (user: unknown): boolean => Boolean(profiloDi(user)?.completo)

// L'utente può fare "azione" sulla voce "slug" (es. può(user, 'pages', 'crea'))
export const può = (user: unknown, slug: string, azione: Azione): boolean => {
  const p = profiloDi(user)
  if (!p) return false
  if (p.completo) return true
  return Boolean(p.permessi?.[risorsa(slug).chiave]?.[azione])
}

// L'utente può tradurre nella lingua indicata ("Traduce in …" del ruolo)
export const puòTradurre = (user: unknown, lingua: string): boolean => {
  const p = profiloDi(user)
  if (!p) return false
  return Boolean(p.completo || p.traduzioni?.[lingua])
}

type ConRichiesta = { req: { user?: unknown } }

// Lingua della richiesta (nel pannello quella scelta in alto)
const linguaDi = (req: unknown) => {
  const l = (req as { locale?: string | null })?.locale
  return l && l !== 'all' ? l : LINGUA_PRINCIPALE
}

/**
 * Modifica in una lingua diversa dall'italiano di una voce traducibile: serve "Traduce in …"
 * (permesso a sé, così un traduttore non tocca l'italiano e un redattore non tocca le traduzioni).
 */
const puòFare = (req: { user?: unknown }, slug: string, azione: Azione) => {
  const lingua = linguaDi(req)
  if (azione === 'modifica' && lingua !== LINGUA_PRINCIPALE && TRADUCIBILI.has(slug))
    return puòTradurre(req.user, lingua)
  return può(req.user, slug, azione)
}

export const eAmministratore = ({ req: { user } }: ConRichiesta): boolean => haAccessoCompleto(user)

// Controllo d'accesso per una collezione o globale
export const permesso =
  (slug: string, azione: Azione): Access =>
  ({ req }) =>
    puòFare(req, slug, azione)

// Stesso controllo per un singolo campo (es. gli ID di Google nelle Impostazioni)
export const campoConPermesso =
  (slug: string, azione: Azione): FieldAccess =>
  ({ req }) =>
    puòFare(req, slug, azione)

// Voce nascosta nel menu dell'admin a chi non ha "Vede" (i permessi veri restano negli access)
export const nascostaSenzaPermesso =
  (slug: string) =>
  ({ user }: { user: unknown }) =>
    !può(user, slug, 'vede')

// Accesso standard di una collezione con lettura pubblica (il sito la legge senza login)
export const accessoPubblico = (slug: string) => ({
  read: () => true,
  create: permesso(slug, 'crea'),
  update: permesso(slug, 'modifica'),
  delete: permesso(slug, 'elimina'),
})
