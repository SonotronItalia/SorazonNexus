import type { Footer as FooterType } from '@/payload-types'
import { getFooter } from '@/lib/content'
import Link from 'next/link'
import React from 'react'

import { ThemeSelector } from '@/providers/Theme/ThemeSelector'
import { CMSLink } from '@/components/Link'
import { Logo } from '@/components/Logo/Logo'
import { PreferenzeCookie } from '@/components/Consenso/CookieBanner'

export async function Footer() {
  // Se il backend non risponde il sito resta in piedi, con la navigazione vuota
  const footerData = await getFooter().catch((e): FooterType => {
    console.error('Footer non disponibile:', e)
    return { id: 0, navItems: [] }
  })

  const navItems = footerData?.navItems || []

  return (
    <footer className="mt-auto border-t border-border bg-black dark:bg-card text-white">
      <div className="container py-8 gap-8 flex flex-col md:flex-row md:justify-between">
        <Link className="flex items-center" href="/">
          <Logo />
        </Link>

        <div className="flex flex-col-reverse items-start md:flex-row gap-4 md:items-center">
          <ThemeSelector />
          <nav className="flex flex-col md:flex-row gap-4">
            {navItems.map(({ link }, i) => {
              return <CMSLink className="text-white" key={i} {...link} />
            })}
            {/* Sempre presenti: richiesti dalle norme sulla privacy */}
            <Link className="text-white" href="/privacy-policy">
              Privacy
            </Link>
            <Link className="text-white" href="/cookie-policy">
              Cookie policy
            </Link>
            <PreferenzeCookie className="text-left text-white hover:underline" />
          </nav>
        </div>
      </div>
    </footer>
  )
}
