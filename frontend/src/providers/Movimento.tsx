'use client'

import { MotionConfig } from 'motion/react'
import React from 'react'

import { useEffects } from './Effects'

/**
 * Animazioni di Motion (comparse, scorrimento, numeri): seguono le stesse regole degli effetti.
 * Con il fulmine spento o "riduci movimento" nel sistema, niente spostamenti né ingrandimenti
 * (restano solo le dissolvenze brevi, che non danno fastidio).
 */
export const MovimentoProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { enabled } = useEffects()
  return <MotionConfig reducedMotion={enabled ? 'user' : 'always'}>{children}</MotionConfig>
}
