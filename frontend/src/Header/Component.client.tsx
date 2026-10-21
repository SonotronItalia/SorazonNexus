'use client'
import { useHeaderTheme } from '@/providers/HeaderTheme'
import { Menu, X } from 'lucide-react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import React, { useState, useSyncExternalStore } from 'react'

import type { Header } from '@/payload-types'

import { EffectsToggle } from '@/components/EffectsToggle'
import { Logo } from '@/components/Logo/Logo'
import { ThemeSelector } from '@/providers/Theme/ThemeSelector'
import { HeaderNav } from './Nav'
import { SelettoreLingua } from '@/components/SelettoreLingua'
import { useLingua } from '@/providers/Lingua'
import { conPrefisso } from '@/utilities/lingue'
import { cn } from '@/utilities/ui'

// Vero quando la pagina è scorsa di poco: header compatto e in vetro (false sul server)
const useScorso = () =>
  useSyncExternalStore(
    (avvisa) => {
      window.addEventListener('scroll', avvisa, { passive: true })
      return () => window.removeEventListener('scroll', avvisa)
    },
    () => window.scrollY > 24,
    () => false,
  )

interface HeaderClientProps {
  data: Header
}

export const HeaderClient: React.FC<HeaderClientProps> = ({ data }) => {
  const [menuAperto, setMenuAperto] = useState(false)
  const { lingua, t } = useLingua()
  // Tema imposto da un hero che sta sotto l'header; null = segue il tema del sito
  const { headerTheme } = useHeaderTheme()
  const pathname = usePathname()
  const scorso = useScorso()

  // Chiude il menu quando si cambia pagina (aggiornamento durante il render, senza effetto)
  const [paginaPrecedente, setPaginaPrecedente] = useState(pathname)
  if (pathname !== paginaPrecedente) {
    setPaginaPrecedente(pathname)
    setMenuAperto(false)
  }

  return (
    // Barra fissa in alto: trasparente in cima alla pagina, in vetro sfocato appena si scorre
    <div
      className={cn(
        'sticky top-0 z-40 w-full transition-[background-color,box-shadow] duration-300',
        scorso
          ? 'bg-background/70 shadow-[0_1px_0_0_var(--color-border)] backdrop-blur-xl backdrop-saturate-150'
          : 'bg-transparent',
      )}
      {...(headerTheme ? { 'data-theme': headerTheme } : {})}
    >
      <header className="container relative">
        <div
          className={cn(
            'flex items-center justify-between transition-[padding] duration-300',
            scorso ? 'py-2 md:py-3' : 'py-6 md:py-8',
          )}
        >
          <Link href={conPrefisso(lingua, '/')} aria-label={t.vaiAllaHome}>
            <Logo loading="eager" priority="high" altezza={scorso ? 'h-[44px]' : 'h-[76px]'} />
          </Link>

          {/* Schermi larghi */}
          <div className="hidden items-center gap-4 text-foreground md:flex">
            <HeaderNav data={data} />
            <SelettoreLingua />
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
              aria-label={menuAperto ? t.chiudiMenu : t.apriMenu}
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
              <SelettoreLingua inLinea />
              <ThemeSelector />
            </div>
          </div>
        )}
      </header>
    </div>
  )
}
