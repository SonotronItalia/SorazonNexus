import { APIError, type CollectionBeforeDeleteHook } from 'payload'

import { haAccessoCompleto } from '@/access/ruoli'

/**
 * Cestino (collezioni con `trash: true`): "Elimina" del pannello sposta nel cestino (è una
 * modifica con deletedAt, permesso "Elimina" della voce); dal cestino si ripristina ("Modifica")
 * o si elimina definitivamente. Quest'ultima operazione, la vera cancellazione, è solo per chi ha
 * l'accesso completo: così l'errore di un redattore si recupera sempre.
 * Non si può decidere nei permessi (access.delete), perché Payload li usa anche per mostrare i
 * pulsanti e per le eliminazioni multiple, senza distinguere cestino e cancellazione.
 * Le operazioni di sistema (seed, script, test: nessun utente nella richiesta) passano.
 */
export const soloAdminEliminaDefinitivo: CollectionBeforeDeleteHook = ({ req }) => {
  if (req.user && !haAccessoCompleto(req.user)) {
    throw new APIError(
      'Solo un amministratore può eliminare definitivamente. Il documento è nel cestino: puoi ripristinarlo quando vuoi.',
      403,
      null,
      true,
    )
  }
}
