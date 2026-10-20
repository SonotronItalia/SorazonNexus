'use client'

import { animate, useInView, useReducedMotionConfig } from 'motion/react'
import React, { useEffect, useRef } from 'react'

const formato = new Intl.NumberFormat('it-IT')

/**
 * Numero che sale da zero quando entra nello schermo (una volta). Nell'HTML c'è già il valore
 * finale (motori di ricerca, assistenti AI, chi ha "riduci movimento"): l'animazione parte da
 * zero solo nel browser.
 */
export const Contatore: React.FC<{ valore: number; conta: boolean }> = ({ valore, conta }) => {
  const ref = useRef<HTMLSpanElement>(null)
  const visibile = useInView(ref, { once: true, margin: '0px 0px -15% 0px' })
  const ridotto = useReducedMotionConfig()

  useEffect(() => {
    const el = ref.current
    if (!el || !visibile || !conta || ridotto) return
    const controlli = animate(0, valore, {
      duration: Math.min(2.2, 0.8 + Math.log10(Math.max(valore, 1)) * 0.5),
      ease: [0.16, 1, 0.3, 1],
      onUpdate: (v) => {
        el.textContent = formato.format(Math.round(v))
      },
    })
    return () => controlli.stop()
  }, [visibile, conta, ridotto, valore])

  return <span ref={ref}>{conta ? formato.format(valore) : String(valore)}</span>
}
