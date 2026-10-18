import { timingSafeEqual } from 'node:crypto'
import { draftMode } from 'next/headers'
import { redirect } from 'next/navigation'

const same = (a: string, b: string) =>
  a.length === b.length && timingSafeEqual(Buffer.from(a), Buffer.from(b))

// Solo percorsi interni al sito: niente "//altro-sito" o URL assoluti
const isSafePath = (path: string) => path.startsWith('/') && !path.startsWith('//') && !path.includes('\\')

/**
 * Attiva l'anteprima delle bozze. L'indirizzo lo costruisce il backend (generatePreviewPath)
 * con il segreto PREVIEW_SECRET: il pulsante "Anteprima" e il live preview del pannello lo aprono.
 * Le bozze vere le legge poi il server del frontend con il segreto interno (lib/api.ts).
 */
export async function GET(req: Request): Promise<Response> {
  const { searchParams } = new URL(req.url)
  const path = searchParams.get('path') ?? ''
  const given = searchParams.get('previewSecret') ?? ''
  const expected = process.env.PREVIEW_SECRET ?? ''

  if (!expected || !same(given, expected)) {
    return new Response('Anteprima non autorizzata', { status: 403 })
  }
  if (!isSafePath(path)) {
    return new Response('Percorso di anteprima non valido', { status: 400 })
  }

  ;(await draftMode()).enable()
  redirect(path)
}
