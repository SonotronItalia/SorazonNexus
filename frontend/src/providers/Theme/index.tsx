'use client'

import React, { createContext, useCallback, use, useSyncExternalStore } from 'react'

import type { Theme, ThemeContextType } from './types'

import { getImplicitPreference, notifyThemeChange, subscribeTheme, themeLocalStorageKey } from './shared'
import { themeIsValid } from './types'

const initialContext: ThemeContextType = {
  setTheme: () => null,
  theme: undefined,
}

const ThemeContext = createContext(initialContext)

// Il tema iniziale lo applica InitTheme prima del primo disegno: qui lo si legge dal DOM
const getThemeSnapshot = (): Theme | undefined => {
  const attribute = document.documentElement.getAttribute('data-theme')
  return themeIsValid(attribute) ? attribute : undefined
}

// Sul server il tema non si conosce
const getServerThemeSnapshot = () => undefined

export const ThemeProvider = ({ children }: { children: React.ReactNode }) => {
  const theme = useSyncExternalStore(subscribeTheme, getThemeSnapshot, getServerThemeSnapshot)

  const setTheme = useCallback((themeToSet: Theme | null) => {
    if (themeToSet === null) {
      window.localStorage.removeItem(themeLocalStorageKey)
      const implicitPreference = getImplicitPreference()
      document.documentElement.setAttribute('data-theme', implicitPreference || '')
    } else {
      window.localStorage.setItem(themeLocalStorageKey, themeToSet)
      document.documentElement.setAttribute('data-theme', themeToSet)
    }
    notifyThemeChange()
  }, [])

  return <ThemeContext value={{ setTheme, theme }}>{children}</ThemeContext>
}

export const useTheme = (): ThemeContextType => use(ThemeContext)
