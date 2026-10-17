'use client'
import { useHeaderTheme } from '@/providers/HeaderTheme'
import { Menu, X } from 'lucide-react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import React, { useEffect, useState } from 'react'

import type { Header } from '@/payload-types'

import { EffectsToggle } from '@/components/EffectsToggle'
import { Logo } from '@/components/Logo/Logo'
import { ThemeSelector } from '@/providers/Theme/ThemeSelector'
import { HeaderNav } from './Nav'

interface HeaderClientProps {
  data: Header
}

export const HeaderClient: React.FC<HeaderClientProps> = ({ data }) => {
  /* Storing the value in a useState to avoid hydration errors */
  const [theme, setTheme] = useState<string | null>(null)
  const [menuAperto, setMenuAperto] = useState(false)
  const { headerTheme, setHeaderTheme } = useHeaderTheme()
  const pathname = usePathname()

  useEffect(() => {
    setHeaderTheme(null)
    setMenuAperto(false) // chiude il menu quando si cambia pagina
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathname])

  useEffect(() => {
    if (headerTheme && headerTheme !== theme) setTheme(headerTheme)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [headerTheme])

  return (
    <header className="container relative z-20" {...(theme ? { 'data-theme': theme } : {})}>
      <div className="flex items-center justify-between py-6 md:py-8">
        <Link href="/">
          <Logo loading="eager" priority="high" className="invert dark:invert-0" />
        </Link>

        {/* Schermi larghi */}
        <div className="hidden items-center gap-4 text-foreground md:flex">
          <HeaderNav data={data} />
          <EffectsToggle />
          <ThemeSelector />
        </div>

        {/* Telefono */}
        <div className="flex items-center gap-2 text-foreground md:hidden">
          <EffectsToggle />
          <button
            type="button"
            onClick={() => setMenuAperto((v) => !v)}
            aria-expanded={menuAperto}
            aria-controls="menu-mobile"
            aria-label={menuAperto ? 'Chiudi il menu' : 'Apri il menu'}
            className="inline-flex h-9 w-9 items-center justify-center rounded-md hover:bg-muted"
          >
            {menuAperto ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {menuAperto && (
        <div
          id="menu-mobile"
          className="absolute inset-x-0 top-full rounded-b-lg border bg-background p-6 text-foreground shadow-lg md:hidden"
        >
          <div className="flex flex-col items-start gap-6 [&_nav]:flex-col [&_nav]:items-start [&_nav]:gap-4">
            <HeaderNav data={data} />
            <ThemeSelector />
          </div>
        </div>
      )}
    </header>
  )
}