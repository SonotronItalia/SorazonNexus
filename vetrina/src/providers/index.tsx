import React from 'react'

import { EffectsProvider } from './Effects'
import { HeaderThemeProvider } from './HeaderTheme'
import { ThemeProvider } from './Theme'

export const Providers: React.FC<{
  children: React.ReactNode
}> = ({ children }) => {
  return (
    <ThemeProvider>
      <HeaderThemeProvider>
        <EffectsProvider>{children}</EffectsProvider>
      </HeaderThemeProvider>
    </ThemeProvider>
  )
}

