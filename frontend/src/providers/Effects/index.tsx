'use client'

import React, { createContext, useCallback, useContext, useSyncExternalStore } from 'react'

const STORAGE_KEY = 'sorazon-effetti'
const CHANGE_EVENT = 'sorazon-effetti-cambiati'

type EffectsContextType = { enabled: boolean; toggle: () => void }

const EffectsContext = createContext<EffectsContextType>({ enabled: false, toggle: () => {} })

export const useEffects = () => useContext(EffectsContext)

// Copia in memoria della scelta, per quando localStorage non è disponibile
let sceltaInMemoria: string | null = null

const leggiScelta = (): string | null => {
  try {
    return localStorage.getItem(STORAGE_KEY) ?? sceltaInMemoria
  } catch {
    return sceltaInMemoria
  }
}

// Senza una scelta salvata, gli effetti seguono "riduci movimento" del sistema
const getSnapshot = () => {
  const saved = leggiScelta()
  return saved ? saved === 'on' : !window.matchMedia('(prefers-reduced-motion: reduce)').matches
}

// Sul server (e durante l'idratazione) gli effetti partono spenti
const getServerSnapshot = () => false

const subscribe = (callback: () => void) => {
  window.addEventListener(CHANGE_EVENT, callback)
  return () => window.removeEventListener(CHANGE_EVENT, callback)
}

export const EffectsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const enabled = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot)

  const toggle = useCallback(() => {
    const next = getSnapshot() ? 'off' : 'on'
    sceltaInMemoria = next
    try {
      localStorage.setItem(STORAGE_KEY, next)
    } catch {}
    window.dispatchEvent(new Event(CHANGE_EVENT))
  }, [])

  return <EffectsContext.Provider value={{ enabled, toggle }}>{children}</EffectsContext.Provider>
}
