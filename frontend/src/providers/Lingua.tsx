'use client'

import { usePathname } from 'next/navigation'
import React, { createContext, useContext, useEffect, useMemo, useState } from 'react'

import { LINGUA_PRINCIPALE, SECONDARIE, type LinguaAttiva } from '@/utilities/lingue'
import { testi, type Testi } from '@/utilities/testi'

type Alternative = { raccolta: 'pages' | 'posts'; slug: Record<string, string> } | null

type Valore = {
  /** Lingua della pagina */
  lingua: string
  /** Lingue del selettore (italiano + attive) */
  lingue: LinguaAttiva[]
  /** Aspetto del selettore */
  stile: 'bandiera-nome' | 'bandiera-sigla' | 'bandiera'
  /** Scritte fisse nella lingua della pagina */
  t: Testi
  /** Slug della pagina corrente nelle lingue in cui è tradotta (per il selettore) */
  alternative: Alternative
  impostaAlternative: (a: Alternative) => void
}

const Contesto = createContext<Valore>({
  lingua: LINGUA_PRINCIPALE,
  lingue: [],
  stile: 'bandiera-nome',
  t: testi(LINGUA_PRINCIPALE),
  alternative: null,
  impostaAlternative: () => {},
})

export const LinguaProvider: React.FC<{
  lingua: string
  lingue: LinguaAttiva[]
  stile?: Valore['stile'] | null
  children: React.ReactNode
}> = ({ lingua, lingue, stile, children }) => {
  const [alternative, impostaAlternative] = useState<Alternative>(null)
  // Header, menu, piè di pagina e <html lang> stanno nel layout, che Next non ridisegna nella
  // navigazione interna: se un collegamento o un reindirizzamento cambia lingua, pagina intera
  const percorso = usePathname()
  useEffect(() => {
    const primo = percorso?.split('/')[1] ?? ''
    const linguaIndirizzo = SECONDARIE.has(primo) ? primo : LINGUA_PRINCIPALE
    if (linguaIndirizzo !== lingua) window.location.replace(window.location.href)
  }, [percorso, lingua])
  const valore = useMemo(
    () => ({
      lingua,
      lingue,
      stile: stile ?? 'bandiera-nome',
      t: testi(lingua),
      alternative,
      impostaAlternative,
    }),
    [lingua, lingue, stile, alternative],
  )
  return <Contesto.Provider value={valore}>{children}</Contesto.Provider>
}

export const useLingua = () => useContext(Contesto)

/**
 * Messo in una pagina o notizia: comunica al selettore lo slug nelle altre lingue, così il cambio
 * di lingua porta alla stessa pagina tradotta (o alla home della lingua se manca).
 */
export const AlternativeLingua: React.FC<{ raccolta: 'pages' | 'posts'; slug: Record<string, string> }> = ({
  raccolta,
  slug,
}) => {
  const { impostaAlternative } = useLingua()
  const chiave = JSON.stringify(slug)
  useEffect(() => {
    impostaAlternative({ raccolta, slug: JSON.parse(chiave) })
    return () => impostaAlternative(null)
  }, [raccolta, chiave, impostaAlternative])
  return null
}
