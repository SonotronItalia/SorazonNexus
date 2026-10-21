'use client'

import { Zap, ZapOff } from 'lucide-react'
import { useLingua } from '@/providers/Lingua'
import React from 'react'
import { useEffects } from '@/providers/Effects'

export const EffectsToggle: React.FC = () => {
  const { enabled, toggle } = useEffects()
  const { t } = useLingua()
  const label = enabled ? t.disattivaEffetti : t.attivaEffetti

  return (
    <button
      type="button"
      onClick={toggle}
      aria-pressed={enabled}
      aria-label={label}
      title={label}
      className="inline-flex h-9 w-9 items-center justify-center rounded-md hover:bg-muted"
    >
      {enabled ? <Zap className="h-5 w-5" /> : <ZapOff className="h-5 w-5" />}
    </button>
  )
}