import { NextResponse, type NextRequest } from 'next/server'

import type { Redirect } from '@/payload-types'
import { SECONDARIE } from '@/utilities/lingue'

/**
 * Redirect del CMS (vecchi indirizzi del sito Joomla e quelli aggiunti nell'admin) risolti prima
 * della pagina: una sola risposta 308, veloce. Farli durante il disegno della pagina (componente
 * PayloadRedirects, che resta come riserva) dava due intestazioni Location alla prima richiesta.
 * L'elenco si rilegge dal backend al massimo ogni 60 secondi; se il backend non risponde la
 * richiesta prosegue normalmente.
 */
const INTERNAL = process.env.PAYLOAD_INTERNAL_URL ?? 'http://localhost:3001'
const DURATA_MS = 60_000

let elenco: { mappa: Map<string, string>; scade: number } | null = null
let inCorso: Promise<Map<string, string>> | null = null

const destinazione = (r: Redirect): string | null => {
  if (r.to?.type !== 'reference' && r.to?.url) return r.to.url
  const ref = r.to?.reference
  if (ref && typeof ref.value === 'object' && ref.value?.slug) {
    return `${ref.relationTo === 'pages' ? '' : `/${ref.relationTo}`}/${ref.value.slug}`
  }
  return r.to?.url ?? null
}

async function redirects(): Promise<Map<string, string>> {
  if (elenco && elenco.scade > Date.now()) return elenco.mappa
  inCorso ??= fetch(`${INTERNAL}/api/redirects?pagination=false&depth=1`, { cache: 'no-store' })
    .then((r) => (r.ok ? r.json() : Promise.reject(new Error(`backend ${r.status}`))))
    .then(({ docs }: { docs: Redirect[] }) => {
      const mappa = new Map<string, string>()
      for (const r of docs) {
        const a = destinazione(r)
        if (r.from && a && a !== r.from) mappa.set(r.from, a)
      }
      elenco = { mappa, scade: Date.now() + DURATA_MS }
      return mappa
    })
    .catch(() => elenco?.mappa ?? new Map<string, string>())
    .finally(() => {
      inCorso = null
    })
  return inCorso
}

// Lingua dal prefisso dell'indirizzo: /en/therapy -> pagina "therapy" in inglese. Il prefisso si
// toglie (rewrite, l'indirizzo nel browser resta /en/therapy) e la lingua passa alle pagine
// nell'intestazione x-lingua. Senza prefisso è italiano (intestazione tolta: non si può forzare)
const conLingua = (request: NextRequest) => {
  const intestazioni = new Headers(request.headers)
  intestazioni.delete('x-lingua')
  const m = request.nextUrl.pathname.match(/^\/([a-z]{2})(\/.*)?$/)
  if (!m || !SECONDARIE.has(m[1])) return NextResponse.next({ request: { headers: intestazioni } })
  intestazioni.set('x-lingua', m[1])
  const url = request.nextUrl.clone()
  url.pathname = m[2] && m[2] !== '/' ? m[2].replace(/\/+$/, '') : '/'
  return NextResponse.rewrite(url, { request: { headers: intestazioni } })
}

export async function proxy(request: NextRequest) {
  const a = (await redirects()).get(request.nextUrl.pathname)
  if (!a) return conLingua(request)
  // Solo destinazioni interne o assolute in http(s): niente "javascript:" o simili
  const url = /^https?:\/\//.test(a) ? new URL(a) : a.startsWith('/') ? new URL(a, request.url) : null
  return url ? NextResponse.redirect(url, 308) : conLingua(request)
}

export const config = {
  // Non serve su risorse tecniche, API, media e immagine di condivisione
  matcher: ['/((?!_next/|api/|media/|og$|favicon|robots\\.txt|llms\\.txt|.*-sitemap\\.xml).*)'],
}
