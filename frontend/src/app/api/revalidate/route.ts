import { revalidateTag } from 'next/cache'
import { timingSafeEqual } from 'node:crypto'

const same = (a: string, b: string) =>
  a.length === b.length && timingSafeEqual(Buffer.from(a), Buffer.from(b))

// Chiamata dal backend (rete interna) quando dei contenuti cambiano.
export async function POST(req: Request) {
  const given = req.headers.get('x-revalidate-secret') ?? ''
  const expected = process.env.REVALIDATE_SECRET ?? ''
  if (!expected || !same(given, expected)) {
    return Response.json({ ok: false }, { status: 401 })
  }

  const { tags } = (await req.json()) as { tags?: unknown }
  if (!Array.isArray(tags) || tags.length === 0 || !tags.every((t) => typeof t === 'string')) {
    return Response.json({ ok: false, error: 'tags mancanti' }, { status: 400 })
  }

  for (const tag of tags as string[]) revalidateTag(tag, { expire: 0 })
  return Response.json({ ok: true, tags })
}
