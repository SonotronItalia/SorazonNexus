import type { Impostazioni, Marchio } from '@/payload-types'

/**
 * Loghi e icona del sito da Impostazioni del sito > Marchio (raccolta "marchio" del backend).
 * Un campo vuoto usa i file Sorazon in frontend/public, così il sito ha sempre un marchio.
 */
export type FileLogo = { url: string; larghezza: number; altezza: number }
export type CoppiaLoghi = { chiaro: FileLogo; scuro: FileLogo }
export type Loghi = { barra: CoppiaLoghi; compatto?: CoppiaLoghi; piede: FileLogo }
export type FileIcona = { url: string; svg: boolean; versione: string }

// Proporzioni del logo Sorazon (viewBox dei file in frontend/public)
const SORAZON = { larghezza: 842.25, altezza: 254.25 }
export const LOGO_PREDEFINITO: CoppiaLoghi = {
  chiaro: { url: '/logo_sorazon.svg', ...SORAZON },
  scuro: { url: '/logo_sorazon_neg.svg', ...SORAZON },
}

// Indirizzo pubblico di un file del marchio: passa dal sito (rewrite /marchio/* verso il backend)
export const marchioSrc = (url?: string | null): string => {
  if (!url) return ''
  const { pathname, search } = new URL(url, 'http://x')
  return pathname.replace(/^\/api\/marchio\/file\//, '/marchio/') + search
}

type Valore = number | Marchio | null | undefined

// Con la data di modifica nell'indirizzo: un file sostituito non resta nella cache del browser
const conVersione = (m: Marchio) =>
  `${marchioSrc(m.url)}${m.updatedAt ? `?v=${encodeURIComponent(m.updatedAt)}` : ''}`

// Un file nel cestino conta come non scelto: si usa quello predefinito
const usabile = (v: Valore): v is Marchio => Boolean(v && typeof v === 'object' && v.url && !v.deletedAt)

const logo = (v: Valore): FileLogo | undefined =>
  usabile(v)
    ? {
        url: conVersione(v),
        larghezza: v.width || SORAZON.larghezza,
        altezza: v.height || SORAZON.altezza,
      }
    : undefined

export const loghi = (impostazioni: Impostazioni | null | undefined): Loghi => {
  const m = impostazioni?.marchio
  const positivo = logo(m?.positivo)
  const chiaro = positivo ?? LOGO_PREDEFINITO.chiaro
  // Senza la versione per sfondo scuro: il logo caricato (non il negativo Sorazon predefinito)
  const scuro = logo(m?.negativo) ?? positivo ?? LOGO_PREDEFINITO.scuro
  const compatto = logo(m?.compatto)
  const compattoScuro = logo(m?.compattoNegativo)
  return {
    barra: { chiaro, scuro },
    compatto:
      compatto || compattoScuro
        ? { chiaro: compatto ?? chiaro, scuro: compattoScuro ?? compatto ?? scuro }
        : undefined,
    piede: logo(m?.piede) ?? scuro,
  }
}

const icona = (v: Valore): FileIcona | undefined =>
  usabile(v)
    ? {
        url: marchioSrc(v.url),
        svg: v.mimeType === 'image/svg+xml',
        versione: v.updatedAt ?? '',
      }
    : undefined

export const icone = (impostazioni: Impostazioni | null | undefined) => ({
  icona: icona(impostazioni?.marchio?.icona),
  scura: icona(impostazioni?.marchio?.iconaScura),
})

// Misure ricavate dall'icona (route /icone/[file]): scheda del browser, iPhone, Android
export const MISURE_ICONA = { '32': 32, '180': 180, '192': 192, '512': 512 } as const
