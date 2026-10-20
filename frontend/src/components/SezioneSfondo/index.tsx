import React from 'react'

import { type SfondoSezione, sezione } from '@/utilities/sezione'
import { cn } from '@/utilities/ui'

/**
 * Fascia a tutta larghezza con lo sfondo scelto nel blocco (Modulo, Mappa). Con "nessuno" il
 * blocco resta com'era. Due blocchi vicini con lo stesso sfondo formano una sola fascia.
 */
export const SezioneSfondo: React.FC<{
  sfondo?: SfondoSezione | 'nessuno' | null
  children: React.ReactNode
}> = ({ sfondo, children }) => {
  if (!sfondo || sfondo === 'nessuno') return <>{children}</>
  const s = sezione(sfondo)
  return (
    <section className={cn('py-16 md:py-20', s.className)} data-theme={s['data-theme']}>
      {children}
    </section>
  )
}

// Il blocco ha uno sfondo proprio: niente margini attorno (RenderBlocks)
export const conSfondo = (blocco: unknown) => {
  const sfondo = (blocco as { sfondo?: unknown })?.sfondo
  return typeof sfondo === 'string' && sfondo !== 'nessuno'
}
