import type { Payload } from 'payload'
import React from 'react'

import type { Impostazioni, Marchio } from '@/payload-types'

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

const file = (v: number | Marchio | null | undefined) =>
  v && typeof v === 'object' && v.url
    ? { url: `${v.url}?v=${encodeURIComponent(v.updatedAt)}`, w: v.width, h: v.height }
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
  return <span role="img" aria-label="Sorazon" className="marchio-sorazon" style={stile} />
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
