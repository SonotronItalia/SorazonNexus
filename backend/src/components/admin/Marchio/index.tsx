import type { Payload } from 'payload'
import React from 'react'

import type { Impostazioni, Marchio } from '@/payload-types'

import { TemaPannello } from '../TemaPannello'

/**
 * Marchio nel pannello al posto di quello di Payload: grande nella pagina di accesso (Logo),
 * piccolo in alto nel menu (Icona). File da Impostazioni del sito > Marchio; vuoti: i file
 * Sorazon in backend/public. Logo come sfondo (custom.scss), con la versione per sfondo scuro
 * quando il pannello è in tema scuro.
 */
type Props = { payload?: Payload }

const leggiMarchio = async (payload?: Payload): Promise<Impostazioni['marchio'] | null> => {
  if (!payload) return null
  try {
    return (await payload.findGlobal({ slug: 'impostazioni', depth: 1 })).marchio ?? null
  } catch {
    return null
  }
}

// Solo il percorso (/api/marchio/file/...): l'URL di Payload contiene l'indirizzo pubblico del
// backend (serverURL), che non vale se il pannello si apre da un altro indirizzo (tunnel, rete)
const percorso = (url: string) => new URL(url, 'http://x').pathname

const file = (v: number | Marchio | null | undefined) =>
  v && typeof v === 'object' && v.url
    ? { url: `${percorso(v.url)}?v=${encodeURIComponent(v.updatedAt)}`, w: v.width, h: v.height }
    : undefined

export const Logo = async ({ payload }: Props) => {
  const marchio = await leggiMarchio(payload)
  const chiaro = file(marchio?.positivo)
  // Senza la versione per sfondo scuro: il logo caricato, non il negativo Sorazon predefinito
  const scuro = file(marchio?.negativo) ?? chiaro
  const stile: Record<string, string> = {}
  if (chiaro) stile['--marchio-chiaro'] = `url("${chiaro.url}")`
  if (scuro) stile['--marchio-scuro'] = `url("${scuro.url}")`
  if (chiaro?.w && chiaro.h) stile.aspectRatio = `${chiaro.w} / ${chiaro.h}`
  return (
    <>
      {/* La pagina di accesso non ha l'intestazione del pannello: il tema arriva con il logo */}
      <TemaPannello payload={payload} />
      <span role="img" aria-label="Sorazon" className="marchio-sorazon" style={stile} />
    </>
  )
}

export const Icona = async ({ payload }: Props) => {
  const marchio = await leggiMarchio(payload)
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={file(marchio?.icona)?.url ?? '/favicon.svg'}
      alt="Sorazon"
      style={{ width: 24, height: 24, objectFit: 'contain' }}
    />
  )
}

/**
 * Logo piccolo in cima al menu laterale, sopra "Sfoglia per cartella" (admin.components.
 * beforeNavLinks). Il menu con l'aspetto Sorazon è blu notte: logo per sfondo scuro (compatto se
 * c'è); con l'aspetto standard il menu è chiaro: logo per sfondo chiaro. Porta alla home del pannello.
 */
export const LogoMenu = async ({ payload }: Props) => {
  const marchio = await leggiMarchio(payload)
  const scuro = marchio?.pannelloSorazon !== false
  const logo = scuro
    ? (file(marchio?.compattoNegativo) ??
      file(marchio?.compatto) ??
      file(marchio?.negativo) ?? { url: '/logo_sorazon_neg.svg', w: 842.25, h: 254.25 })
    : (file(marchio?.compatto) ??
      file(marchio?.positivo) ?? { url: '/logo_sorazon.svg', w: 842.25, h: 254.25 })
  const admin = payload?.config.routes.admin ?? '/admin'
  return (
    <a href={admin} aria-label="Sorazon: home del pannello" className="logo-menu-sorazon">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={logo.url}
        alt=""
        style={{
          height: 36,
          width: 'auto',
          maxWidth: '100%',
          aspectRatio: logo.w && logo.h ? `${logo.w} / ${logo.h}` : undefined,
        }}
      />
    </a>
  )
}
