'use client'

import { domAnimation, LazyMotion, MotionConfig } from 'motion/react'
import React from 'react'

import { useEffects } from './Effects'

/**
 * Animazioni di Motion (comparse, scorrimento, numeri): seguono le stesse regole degli effetti.
 * Con il fulmine spento o "riduci movimento" nel sistema, niente spostamenti né ingrandimenti
 * (restano solo le dissolvenze brevi, che non danno fastidio).
 * LazyMotion con le sole funzioni usate dal sito (animazioni, comparsa allo scorrimento): i
 * componenti usano m.div invece di motion.div e il JavaScript di Motion pesa circa la metà.
 * "strict" segnala in sviluppo un motion.div rimasto, che riporterebbe tutto il pacchetto.
 */
export const MovimentoProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { enabled } = useEffects()
  return (
    <LazyMotion features={domAnimation} strict>
      <MotionConfig reducedMotion={enabled ? 'user' : 'always'}>{children}</MotionConfig>
    </LazyMotion>
  )
}
