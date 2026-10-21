'use client'

import { m } from 'motion/react'
import React from 'react'

// Curva morbida in uscita, come nelle pagine prodotto: parte decisa e si posa lentamente
export const CURVA = [0.16, 1, 0.3, 1] as const

/**
 * Comparsa morbida: il contenuto sale di poco e si dissolve quando entra nello schermo, una volta
 * sola. Il testo è già nell'HTML (motori di ricerca e assistenti AI lo leggono comunque).
 */
export const Rivela: React.FC<{
  children: React.ReactNode
  className?: string
  ritardo?: number
}> = ({ children, className, ritardo = 0 }) => (
  <m.div
    className={className}
    initial={{ opacity: 0, y: 48 }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true, margin: '0px 0px -12% 0px' }}
    transition={{ duration: 1, ease: CURVA, delay: ritardo }}
  >
    {children}
  </m.div>
)
