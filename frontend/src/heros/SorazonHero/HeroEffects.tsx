'use client'

import React from 'react'
import { TeslaDischarge } from '@/components/TeslaDischarge'
import { useEffects } from '@/providers/Effects'

type Props = {
  pulsazione?: boolean | null
  scarica?: boolean | null
}

export const HeroEffects: React.FC<Props> = ({ pulsazione, scarica }) => {
  const { enabled } = useEffects()
  if (!enabled) return null

  return (
    <>
      {pulsazione && (
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 bg-radial from-cyan-500 via-blue-900 to-transparent opacity-30 motion-safe:animate-pulse"
        />
      )}
      {scarica && <TeslaDischarge />}
    </>
  )
}