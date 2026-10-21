'use client'

import { cubicBezier, useInView, useReducedMotionConfig } from 'motion/react'
import React, { useEffect, useRef } from 'react'

const formato = new Intl.NumberFormat('it-IT')
// Stessa curva delle comparse (parte decisa, si posa lentamente)
const curva = cubicBezier(0.16, 1, 0.3, 1)

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
    // Ciclo di fotogrammi semplice invece di animate() di Motion (che porta con sé tutto il
    // motore di animazione per contare un numero)
    const durata = Math.min(2.2, 0.8 + Math.log10(Math.max(valore, 1)) * 0.5) * 1000
    const inizio = performance.now()
    let raf = 0
    const passo = (t: number) => {
      const avanzamento = Math.min(1, (t - inizio) / durata)
      el.textContent = formato.format(Math.round(valore * curva(avanzamento)))
      if (avanzamento < 1) raf = requestAnimationFrame(passo)
    }
    raf = requestAnimationFrame(passo)
    return () => cancelAnimationFrame(raf)
  }, [visibile, conta, ridotto, valore])

  return <span ref={ref}>{conta ? formato.format(valore) : String(valore)}</span>
}
