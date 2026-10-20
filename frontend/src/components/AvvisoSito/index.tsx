'use client'

import { X } from 'lucide-react'
import React, { useSyncExternalStore } from 'react'

import { CMSLink } from '@/components/Link'
import type { Impostazioni } from '@/payload-types'
import { cn } from '@/utilities/ui'

type Avviso = NonNullable<Impostazioni['avviso']>

// Le classi stanno scritte per intero: Tailwind non vede quelle costruite al volo
const STILE = {
  informazione: 'bg-muted text-foreground',
  importante: 'bg-amber-100 text-amber-950 dark:bg-amber-900 dark:text-amber-50',
  promozione: 'bg-cyan-700 text-white',
} as const

const CHIAVE = 'sorazon-avviso-chiuso'
const EVENTO = 'sorazon-avviso-chiuso'

// Firma dell'avviso: cambiando testo o date l'avviso ricompare anche a chi l'aveva chiuso
const firma = (a: Avviso) => [a.testo, a.inizio, a.fine].join('|')

export const dentroLeDate = (a: Avviso, ora: number) =>
  (!a.inizio || Date.parse(a.inizio) <= ora) && (!a.fine || Date.parse(a.fine) > ora)

// Minuto corrente: le date si ricontrollano nel browser (la pagina può essere in cache)
const useMinuto = (iniziale: number) =>
  useSyncExternalStore(
    (avvisa) => {
      const t = setInterval(avvisa, 60_000)
      return () => clearInterval(t)
    },
    () => Math.floor(Date.now() / 60_000),
    () => Math.floor(iniziale / 60_000),
  )

const useChiuso = (f: string) =>
  useSyncExternalStore(
    (avvisa) => {
      window.addEventListener(EVENTO, avvisa)
      window.addEventListener('storage', avvisa)
      return () => {
        window.removeEventListener(EVENTO, avvisa)
        window.removeEventListener('storage', avvisa)
      }
    },
    () => {
      try {
        return localStorage.getItem(CHIAVE) === f
      } catch {
        return false
      }
    },
    () => false,
  )

/**
 * Striscia di avviso sopra il menu (Impostazioni del sito > Avviso in cima al sito): testo,
 * collegamento facoltativo, tre stili, date di inizio e fine, chiusura ricordata nel browser.
 */
export const AvvisoSito: React.FC<{ avviso: Avviso; oraServer: number }> = ({ avviso, oraServer }) => {
  const minuto = useMinuto(oraServer)
  const f = firma(avviso)
  const chiuso = useChiuso(f)

  if (!avviso.attivo || !avviso.testo?.trim()) return null
  if (!dentroLeDate(avviso, minuto * 60_000) || (avviso.chiudibile !== false && chiuso)) return null

  const chiudi = () => {
    try {
      localStorage.setItem(CHIAVE, f)
    } catch {
      // Senza localStorage l'avviso si chiude solo per questa pagina
    }
    window.dispatchEvent(new Event(EVENTO))
  }

  return (
    <div
      role="region"
      aria-label="Avviso"
      className={cn('relative z-30 text-sm', STILE[avviso.stile ?? 'informazione'])}
    >
      <div className="container flex items-center justify-center gap-x-3 gap-y-1 py-2 pr-10 text-center max-sm:flex-col">
        <p className="font-medium">{avviso.testo}</p>
        {avviso.conLink && avviso.link && (
          <CMSLink {...avviso.link} appearance="inline" className="font-semibold underline underline-offset-2" />
        )}
      </div>
      {avviso.chiudibile !== false && (
        <button
          type="button"
          onClick={chiudi}
          aria-label="Chiudi l'avviso"
          className="absolute top-1/2 right-2 inline-flex size-8 -translate-y-1/2 items-center justify-center rounded-md hover:bg-black/10"
        >
          <X aria-hidden className="size-4" />
        </button>
      )}
    </div>
  )
}
