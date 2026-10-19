import type { Payload, PayloadRequest } from 'payload'

/**
 * Avvisa il frontend che dei contenuti sono cambiati, così svuota la cache dei tag indicati.
 * Sostituisce gli hook con revalidatePath/revalidateTag, che funzionavano solo
 * quando backend e frontend erano lo stesso processo Next.js.
 *
 * Uso (collezioni E globali):
 *   hooks: { afterChange: [notifyFrontend('centri')], afterDelete: [notifyFrontend('centri')] }
 */
// Invio diretto, usabile anche fuori dagli hook (es. alla fine del seed)
export async function revalidateFrontend(tags: string[], payload: Payload): Promise<void> {
  const base = process.env.FRONTEND_INTERNAL_URL
  const secret = process.env.REVALIDATE_SECRET

  if (!base || !secret) {
    payload.logger.warn('FRONTEND_INTERNAL_URL o REVALIDATE_SECRET mancanti: cache del frontend non aggiornata')
    return
  }

  try {
    const res = await fetch(`${base}/api/revalidate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'x-revalidate-secret': secret },
      body: JSON.stringify({ tags }),
    })
    if (!res.ok) {
      payload.logger.error(`Il frontend ha risposto ${res.status} alla revalidazione di: ${tags.join(', ')}`)
    }
  } catch (e) {
    payload.logger.error(`Frontend non raggiungibile per la revalidazione di ${tags.join(', ')}: ${String(e)}`)
  }
}

export const notifyFrontend =
  (...tags: string[]) =>
  async <T>({ doc, req }: { doc: T; req: PayloadRequest }): Promise<T> => {
    // Gli script di importazione passano context: { disableRevalidate: true }
    if (!req.context?.disableRevalidate) void revalidateFrontend(tags, req.payload)
    return doc
  }
