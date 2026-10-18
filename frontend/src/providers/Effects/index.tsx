
'use client'

import React, { createContext, useCallback, useContext, useEffect, useState } from 'react'

const STORAGE_KEY = 'sorazon-effetti'

type EffectsContextType = { enabled: boolean; toggle: () => void }

const EffectsContext = createContext<EffectsContextType>({ enabled: false, toggle: () => {} })

export const useEffects = () => useContext(EffectsContext)

export const EffectsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Parte spento: lo stato reale si legge solo nel browser, dopo l'idratazione
  const [enabled, setEnabled] = useState(false)

  useEffect(() => {
    let saved: string | null = null
    try {
      saved = localStorage.getItem(STORAGE_KEY)
    } catch {}
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    setEnabled(saved ? saved === 'on' : !reduced)
  }, [])

  const toggle = useCallback(() => {
    setEnabled((prev) => {
      const next = !prev
      try {
        localStorage.setItem(STORAGE_KEY, next ? 'on' : 'off')
      } catch {}
      return next
    })
  }, [])

  return <EffectsContext.Provider value={{ enabled, toggle }}>{children}</EffectsContext.Provider>
}