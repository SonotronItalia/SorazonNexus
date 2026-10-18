// Unico punto in cui il frontend parla con il backend (Payload), via REST sulla rete interna.
const INTERNAL = process.env.PAYLOAD_INTERNAL_URL ?? 'http://localhost:3001'
const KEY = process.env.PAYLOAD_API_KEY

type Opts = { tags?: string[]; revalidate?: number | false }

// Rete di sicurezza: se un avviso di revalidazione va perso, i dati si rinnovano comunque entro un'ora
const REVALIDATE_FALLBACK = 3600

export async function api<T>(path: string, { tags, revalidate = REVALIDATE_FALLBACK }: Opts = {}): Promise<T> {
  const res = await fetch(`${INTERNAL}/api${path}`, {
    headers: KEY ? { Authorization: `users API-Key ${KEY}` } : {},
    // force-cache esplicito: anche nelle pagine dinamiche i dati restano in cache fino al tag
    cache: 'force-cache',
    next: { tags, revalidate },
  })
  if (!res.ok) throw new Error(`Backend ${res.status} su ${path}`)
  return res.json() as Promise<T>
}

// Le immagini passano dal rewrite del frontend: /api/media/file/x.webp -> /media/x.webp
// Gestisce sia URL relativi sia assoluti (con serverURL del backend).
export const mediaSrc = (url?: string | null): string => {
  if (!url) return ''
  const { pathname, search } = new URL(url, 'http://x')
  return pathname.replace(/^\/api\/media\/file\//, '/media/') + search
}
