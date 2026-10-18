import { draftMode } from 'next/headers'
import { redirect } from 'next/navigation'

// Esce dall'anteprima e torna alla pagina indicata (solo percorsi interni), o alla home
export async function GET(req: Request): Promise<Response> {
  const path = new URL(req.url).searchParams.get('path') ?? '/'
  ;(await draftMode()).disable()
  redirect(path.startsWith('/') && !path.startsWith('//') ? path : '/')
}
