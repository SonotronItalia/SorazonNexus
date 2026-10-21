'use client'

import { useRowLabel } from '@payloadcms/ui'
import React from 'react'

import { LINGUE } from '@/lingue'

// Titolo di ogni riga dell'elenco lingue: "Inglese · attiva"
export const EtichettaLingua: React.FC = () => {
  const { data, rowNumber } = useRowLabel<{ codice?: string; attiva?: boolean }>()
  const lingua = LINGUE.find((l) => l.codice === data?.codice)
  if (!lingua) return <span>Lingua {String((rowNumber ?? 0) + 1)}</span>
  return (
    <span>
      {lingua.etichetta} · {data?.attiva ? 'attiva' : 'spenta'}
    </span>
  )
}
