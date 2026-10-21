// Unico punto in cui il frontend parla con il backend (Payload), via REST sulla rete interna.
// Le richieste normali sono anonime: vedono solo i contenuti pubblicati.
const INTERNAL = process.env.PAYLOAD_INTERNAL_URL ?? 'http://localhost:3001'

type Opts = { tags?: string[]; revalidate?: number | false }

// Rete di sicurezza: se un avviso di revalidazione va perso, i dati si rinnovano comunque entro un'ora
const REVALIDATE_FALLBACK = 3600

export async function api<T>(path: string, { tags, revalidate = REVALIDATE_FALLBACK }: Opts = {}): Promise<T> {
  const res = await fetch(`${INTERNAL}/api${path}`, {
    // force-cache esplicito: anche nelle pagine dinamiche i dati restano in cache fino al tag
    cache: 'force-cache',
    next: { tags, revalidate },
  })
  if (!res.ok) throw new Error(`Backend ${res.status} su ${path}`)
  return res.json() as Promise<T>
}

// File binario del backend (es. l'icona del sito da ridimensionare), in cache come i dati
export async function apiFile(path: string, { tags }: Opts = {}): Promise<Buffer> {
  const res = await fetch(`${INTERNAL}/api${path}`, {
    cache: 'force-cache',
    next: { tags, revalidate: REVALIDATE_FALLBACK },
  })
  if (!res.ok) throw new Error(`Backend ${res.status} su ${path}`)
  return Buffer.from(await res.arrayBuffer())
}

// Bozza per l'anteprima (endpoint "anteprima" del backend): mai in cache, null se non esiste.
// L'autorizzazione è il segreto interno tra i due server, non un utente del CMS.
export async function apiDraft<T>(path: string): Promise<T | null> {
  const res = await fetch(`${INTERNAL}/api${path}`, {
    cache: 'no-store',
    headers: { 'x-internal-secret': process.env.REVALIDATE_SECRET ?? '' },
  })
  if (res.status === 404) return null
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
