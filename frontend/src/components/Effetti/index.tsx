'use client'

import React from 'react'

import type { Effetti as Effetto } from '@/payload-types'
import { TeslaDischarge } from '@/components/TeslaDischarge'
import { useEffects } from '@/providers/Effects'
import { useRiduciMovimento } from '@/utilities/riduciMovimento'
import { codiceColore } from '@/utilities/sfondo'
import { cn } from '@/utilities/ui'

import { Particelle } from './Particelle'

type Riga = { effetto?: number | Effetto | null; attivo?: boolean | null; id?: string | null }

// Parametri comuni dei tipi di effetto
const INTENSITA = { bassa: 0.5, media: 1, alta: 1.4 } as const
const RITMO = { lenta: 1.6, normale: 1, veloce: 0.65 } as const
const PUNTO = { sinistra: 0.28, centro: 0.5, destra: 0.72 } as const

// Colore tipico di ogni effetto quando non se ne sceglie uno dalla tavolozza
const COLORE_TIPICO = {
  pulsazione: '#06b6d4',
  scarica: '#a855f7',
  particelle: '#a5f3fc',
  onde: '#22d3ee',
  bagliore: '#ffffff',
} as const

const UnEffetto: React.FC<{ e: Effetto }> = ({ e }) => {
  const scelto = codiceColore(e.colore)
  const colore = scelto ?? COLORE_TIPICO[e.tipo]
  const intensita = INTENSITA[e.intensita ?? 'media']
  const ritmo = RITMO[e.velocita ?? 'normale']
  const x = PUNTO[e.posizione ?? 'destra']

  switch (e.tipo) {
    case 'pulsazione':
      // Senza colore e al centro: identico all'alone storico dell'hero Sorazon (ciano verso blu)
      if (!scelto && (e.posizione ?? 'centro') === 'centro') {
        return (
          <div
            aria-hidden
            className="pointer-events-none absolute inset-0 bg-radial from-cyan-500 via-blue-900 to-transparent motion-safe:animate-pulse"
            style={{ opacity: 0.3 * intensita, animationDuration: `${2 * ritmo}s` }}
          />
        )
      }
      return (
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 motion-safe:animate-pulse"
          style={{
            background: `radial-gradient(circle at ${x * 100}% 50%, ${colore}, transparent 70%)`,
            opacity: 0.3 * intensita,
            animationDuration: `${2 * ritmo}s`,
          }}
        />
      )
    case 'scarica':
      return <TeslaDischarge origin={{ x, y: 0.5 }} colore={colore} ritmo={ritmo} intensita={intensita} />
    case 'particelle':
      return (
        <Particelle
          colore={colore}
          quante={Math.round(40 * intensita)}
          velocita={1 / ritmo}
          alfa={Math.min(1, 0.7 * intensita)}
        />
      )
    case 'onde':
      // Tre anelli che si allargano dal punto scelto e svaniscono, sfalsati nel tempo
      return (
        <div aria-hidden className="pointer-events-none absolute inset-0 overflow-hidden">
          {[0, 1, 2].map((i) => (
            <span
              key={i}
              className="effetto-onda absolute rounded-full border-2"
              style={{
                left: `${x * 100}%`,
                top: '50%',
                borderColor: colore,
                opacity: 0,
                animationDuration: `${6 * ritmo}s`,
                animationDelay: `${i * 2 * ritmo}s`,
                ['--onda-alfa' as string]: String(Math.min(0.8, 0.45 * intensita)),
              }}
            />
          ))}
        </div>
      )
    case 'bagliore':
      // Una fascia di luce morbida che attraversa lentamente l'area
      return (
        <div aria-hidden className="pointer-events-none absolute inset-0 overflow-hidden">
          <span
            className="effetto-bagliore absolute inset-y-0 w-1/3"
            style={{
              background: `linear-gradient(100deg, transparent, ${colore}, transparent)`,
              opacity: Math.min(0.5, 0.18 * intensita),
              animationDuration: `${9 * ritmo}s`,
            }}
          />
        </div>
      )
    default:
      return null
  }
}

/**
 * Effetti animati di uno spazio (hero, contenitore). Si vede un effetto solo se è attivo nella
 * sezione "Effetti" dell'admin, attivo in questo punto ("Attivo qui"), il visitatore non li ha
 * spenti (fulmine nell'header) e il sistema non chiede di ridurre il movimento.
 * Il contenitore deve essere "relative" (e di solito "overflow-hidden").
 */
export const Effetti: React.FC<{ effetti?: Riga[] | null; className?: string }> = ({ effetti, className }) => {
  const { enabled } = useEffects()
  const riduciMovimento = useRiduciMovimento()
  if (!enabled || riduciMovimento) return null

  const visibili = (effetti ?? []).filter(
    (r): r is Riga & { effetto: Effetto } =>
      r.attivo !== false &&
      typeof r.effetto === 'object' &&
      r.effetto !== null &&
      r.effetto.attivo !== false,
  )
  if (visibili.length === 0) return null

  return (
    <div aria-hidden className={cn('pointer-events-none absolute inset-0', className)}>
      {visibili.map((r, i) => (
        <UnEffetto key={r.id ?? i} e={r.effetto} />
      ))}
    </div>
  )
}
