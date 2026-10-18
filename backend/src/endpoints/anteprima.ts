import type { Endpoint } from 'payload'
import { timingSafeEqual } from 'node:crypto'

const same = (a: string, b: string) =>
  a.length === b.length && timingSafeEqual(Buffer.from(a), Buffer.from(b))

/**
 * Bozza di una pagina o notizia per l'anteprima del frontend: GET /api/<collezione>/anteprima/<slug>
 *
 * Non serve un utente del CMS: la richiesta arriva dal server del frontend con il segreto interno
 * condiviso (REVALIDATE_SECRET, header x-internal-secret), che non compare mai in un URL.
 * Questo segreto permette solo di leggere bozze, non di modificare nulla.
 */
export const anteprimaEndpoint = (collection: 'pages' | 'posts'): Endpoint => ({
  path: '/anteprima/:slug',
  method: 'get',
  handler: async (req) => {
    const expected = process.env.REVALIDATE_SECRET ?? ''
    const given = req.headers.get('x-internal-secret') ?? ''
    if (!expected || !same(given, expected)) {
      return Response.json({ error: 'Non autorizzato' }, { status: 401 })
    }

    const slug = String(req.routeParams?.slug ?? '')
    const { docs } = await req.payload.find({
      collection,
      where: { slug: { equals: slug } },
      draft: true,
      depth: 2,
      limit: 1,
      overrideAccess: true,
    })

    return docs[0]
      ? Response.json(docs[0])
      : Response.json({ error: 'Non trovato' }, { status: 404 })
  },
})
