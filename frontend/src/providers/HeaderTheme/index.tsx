'use client'

import type { Theme } from '@/providers/Theme/types'

import React, { createContext, useCallback, use, useEffect, useState } from 'react'

// Tema imposto all'header da un hero che gli passa sotto (immagine scura dietro il menu).
// null = l'header segue il tema del sito (chiaro o scuro, scelto dal visitatore).
export interface ContextType {
  headerTheme?: Theme | null
  setHeaderTheme: (theme: Theme | null) => void
}

const initialContext: ContextType = {
  headerTheme: null,
  setHeaderTheme: () => null,
}

const HeaderThemeContext = createContext(initialContext)

export const HeaderThemeProvider = ({ children }: { children: React.ReactNode }) => {
  const [headerTheme, setThemeState] = useState<Theme | null>(null)

  const setHeaderTheme = useCallback((themeToSet: Theme | null) => {
    setThemeState(themeToSet)
  }, [])

  return <HeaderThemeContext value={{ headerTheme, setHeaderTheme }}>{children}</HeaderThemeContext>
}

export const useHeaderTheme = (): ContextType => use(HeaderThemeContext)

// Per gli hero che stanno sotto l'header: lo rende scuro finché l'hero è in pagina
export const useHeaderScuro = () => {
  const { setHeaderTheme } = useHeaderTheme()
  useEffect(() => {
    setHeaderTheme('dark')
    return () => setHeaderTheme(null)
  }, [setHeaderTheme])
}
