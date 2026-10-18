// Unico punto in cui il frontend parla con il backend (Payload), via REST sulla rete interna.
const INTERNAL = process.env.PAYLOAD_INTERNAL_URL ?? 'http://localhost:3001'
const KEY = process.env.PAYLOAD_API_KEY

type Opts = { tags?: string[]; revalidate?: number | false }

export async function api<T>(path: string, { tags, revalidate }: Opts = {}): Promise<T> {
  const res = await fetch(`${INTERNAL}/api${path}`, {
    headers: KEY ? { Authorization: `users API-Key ${KEY}` } : {},
    next: { tags, ...(revalidate !== undefined ? { revalidate } : {}) },
  })
  if (!res.ok) throw new Error(`Backend ${res.status} su ${path}`)
  return res.json() as Promise<T>
}

// Le immagini passano dal rewrite del frontend: /api/media/file/x.webp -> /media/x.webp
export const mediaSrc = (url?: string | null): string => {
  if (!url) return ''
  const { pathname, search } = new URL(url, 'http://x')
  return pathname.replace(/^\/api\/media\/file\//, '/media/') + search
}
