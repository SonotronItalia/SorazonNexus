'use client'

import { Check, ChevronDown } from 'lucide-react'
import React, { useEffect, useRef, useState } from 'react'

import { useLingua } from '@/providers/Lingua'
import { conPrefisso, percorsoDoc, type LinguaAttiva } from '@/utilities/lingue'
import { cn } from '@/utilities/ui'

// Bandiera disegnata (SVG da flag-icons, licenza MIT, in public/bandiere): uguale ovunque
export const Bandiera: React.FC<{ paese: string; className?: string }> = ({ paese, className }) => (
  // eslint-disable-next-line @next/next/no-img-element
  <img
    src={`/bandiere/${paese}.svg`}
    alt=""
    aria-hidden
    width={20}
    height={15}
    className={cn('inline-block h-[15px] w-5 shrink-0 rounded-[2px] object-cover shadow-[0_0_0_1px_rgb(0_0_0/0.1)]', className)}
  />
)

const Etichetta: React.FC<{ l: LinguaAttiva; stile: string }> = ({ l, stile }) => (
  <>
    <Bandiera paese={l.bandiera} />
    {stile === 'bandiera-nome' && <span>{l.nome}</span>}
    {stile === 'bandiera-sigla' && <span className="uppercase">{l.codice}</span>}
  </>
)

/**
 * Selettore di lingua con le bandiere ("Lingue e selettore" nel pannello). Porta alla stessa pagina
 * nella lingua scelta se è tradotta, altrimenti alla home di quella lingua. Nascosto se c'è solo
 * l'italiano.
 */
export const SelettoreLingua: React.FC<{ className?: string; inLinea?: boolean }> = ({
  className,
  inLinea = false,
}) => {
  const { lingua, lingue, stile, alternative, t } = useLingua()
  const [aperto, setAperto] = useState(false)
  const contenitore = useRef<HTMLDivElement>(null)

  // Chiude cliccando fuori o con Esc
  useEffect(() => {
    if (!aperto) return
    const fuori = (e: MouseEvent) => {
      if (!contenitore.current?.contains(e.target as Node)) setAperto(false)
    }
    const esc = (e: KeyboardEvent) => e.key === 'Escape' && setAperto(false)
    document.addEventListener('mousedown', fuori)
    document.addEventListener('keydown', esc)
    return () => {
      document.removeEventListener('mousedown', fuori)
      document.removeEventListener('keydown', esc)
    }
  }, [aperto])

  if (lingue.length < 2) return null
  const corrente = lingue.find((l) => l.codice === lingua) ?? lingue[0]
  const destinazione = (codice: string) => {
    const slug = alternative?.slug[codice]
    return slug ? percorsoDoc(codice, slug, alternative!.raccolta) : conPrefisso(codice, '/')
  }

  const voci = lingue.map((l) => (
    <li key={l.codice}>
      {/* Collegamento normale (non next/link): cambiando lingua si ricarica tutta la pagina,
          header e menu compresi */}
      <a
        href={destinazione(l.codice)}
        hrefLang={l.codice}
        lang={l.codice}
        aria-current={l.codice === lingua ? 'true' : undefined}
        onClick={() => setAperto(false)}
        className={cn(
          'flex items-center gap-2 rounded-md px-3 py-2 text-sm hover:bg-muted',
          l.codice === lingua && 'font-semibold',
        )}
      >
        <Bandiera paese={l.bandiera} />
        <span>{l.nome}</span>
        {l.codice === lingua && <Check className="ml-auto h-4 w-4" aria-hidden />}
      </a>
    </li>
  ))

  // Nel menu del telefono: tutte le lingue in fila, senza tendina
  if (inLinea)
    return (
      <nav aria-label={t.sceltaLingua} className={className}>
        <ul className="flex flex-wrap gap-1">{voci}</ul>
      </nav>
    )

  return (
    <div ref={contenitore} className={cn('relative', className)}>
      <button
        type="button"
        onClick={() => setAperto((v) => !v)}
        aria-expanded={aperto}
        aria-haspopup="true"
        aria-label={`${t.lingua}: ${corrente.nome}. ${t.sceltaLingua}`}
        className="flex items-center gap-2 rounded-md px-2 py-1.5 text-sm hover:bg-muted"
      >
        <Etichetta l={corrente} stile={stile} />
        <ChevronDown className={cn('h-4 w-4 transition-transform', aperto && 'rotate-180')} aria-hidden />
      </button>
      {aperto && (
        <ul className="absolute right-0 z-50 mt-2 min-w-44 rounded-xl border bg-background p-1 shadow-xl">
          {voci}
        </ul>
      )}
    </div>
  )
}
