import type { Access, FieldAccess } from 'payload'

/**
 * Ruoli del CMS:
 * - amministratore: tutto, comprese le voci "Avanzate" (utenti, reindirizzamenti, ricerca,
 *   categorie, tipi di effetto) e la scheda "Analisi e pubblicità" delle Impostazioni;
 * - redattore: contenuti, contatti, aspetto e impostazioni generali.
 * Chi non ha ancora un ruolo (utenti creati prima dei ruoli) vale come redattore.
 */
export type Ruolo = 'amministratore' | 'redattore'

type ConUtente = { req: { user?: { ruolo?: Ruolo | null; id?: number | string } | null } }

export const eAmministratore = ({ req: { user } }: ConUtente): boolean =>
  user?.ruolo === 'amministratore'

export const soloAmministratori: Access = (args) => eAmministratore(args)
export const campoSoloAmministratori: FieldAccess = (args) => eAmministratore(args)

// Voci nascoste nella barra laterale a chi non è amministratore (i permessi veri sono in access)
export const nascostoAiRedattori = ({ user }: { user: unknown }) =>
  (user as { ruolo?: Ruolo | null } | null)?.ruolo !== 'amministratore'
