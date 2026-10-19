'use client'

import { useSyncExternalStore } from 'react'

// "Riduci movimento" del sistema operativo (sul server e durante l'idratazione: falso)
const query = '(prefers-reduced-motion: reduce)'

const iscrivi = (cb: () => void) => {
  const m = window.matchMedia(query)
  m.addEventListener('change', cb)
  return () => m.removeEventListener('change', cb)
}

export const useRiduciMovimento = () =>
  useSyncExternalStore(
    iscrivi,
    () => window.matchMedia(query).matches,
    () => false,
  )
