import React from 'react'

import { ConsensoProvider } from './Consenso'
import { EffectsProvider } from './Effects'
import { HeaderThemeProvider } from './HeaderTheme'
import { MovimentoProvider } from './Movimento'
import { ThemeProvider } from './Theme'

export const Providers: React.FC<{
  children: React.ReactNode
}> = ({ children }) => {
  return (
    <ThemeProvider>
      <HeaderThemeProvider>
        <EffectsProvider>
          <MovimentoProvider>
            <ConsensoProvider>{children}</ConsensoProvider>
          </MovimentoProvider>
        </EffectsProvider>
      </HeaderThemeProvider>
    </ThemeProvider>
  )
}
