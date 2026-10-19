'use client'

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import React, { useSyncExternalStore } from 'react'

import type { Theme } from './types'

import { useTheme } from '..'
import { getThemePreference, subscribeTheme } from '../shared'

// Sul server la scelta non si conosce: il selettore resta vuoto fino all'idratazione
const getServerPreference = () => ''

export const ThemeSelector: React.FC = () => {
  const { setTheme } = useTheme()
  // Letto da localStorage; setTheme avvisa del cambio e il valore si aggiorna da solo
  const value = useSyncExternalStore(subscribeTheme, getThemePreference, getServerPreference)

  const onThemeChange = (themeToSet: Theme & 'auto') => {
    setTheme(themeToSet === 'auto' ? null : themeToSet)
  }

  return (
    <Select onValueChange={onThemeChange} value={value}>
      <SelectTrigger
        aria-label="Select a theme"
        className="w-auto bg-transparent gap-2 pl-0 md:pl-3 border-none"
      >
        <SelectValue placeholder="Theme" />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="auto">Auto</SelectItem>
        <SelectItem value="light">Light</SelectItem>
        <SelectItem value="dark">Dark</SelectItem>
      </SelectContent>
    </Select>
  )
}
