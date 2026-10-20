'use client'

import { motion, useReducedMotionConfig, useScroll, useTransform } from 'motion/react'
import React, { useRef } from 'react'

/**
 * Parallasse leggera: mentre si scorre oltre la sezione, il contenuto sale più lentamente e si
 * sfuma (il prodotto "resta indietro"). Spenta con "riduci movimento" o con gli effetti spenti.
 */
export const Parallasse: React.FC<{ children: React.ReactNode; className?: string }> = ({
  children,
  className,
}) => {
  const ref = useRef<HTMLDivElement>(null)
  const ridotto = useReducedMotionConfig()
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start start', 'end start'] })
  const y = useTransform(scrollYProgress, [0, 1], [0, 140])
  const scala = useTransform(scrollYProgress, [0, 1], [1, 0.94])
  const opacita = useTransform(scrollYProgress, [0, 0.9], [1, 0.25])
  return (
    <motion.div
      ref={ref}
      className={className}
      style={ridotto ? undefined : { y, scale: scala, opacity: opacita }}
    >
      {children}
    </motion.div>
  )
}
