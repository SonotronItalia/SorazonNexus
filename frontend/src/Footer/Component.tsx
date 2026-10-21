import type { Footer as FooterType } from '@/payload-types'
import { getFooter, getImpostazioni } from '@/lib/content'
import Link from 'next/link'
import React from 'react'

import { ThemeSelector } from '@/providers/Theme/ThemeSelector'
import { CMSLink } from '@/components/Link'
import { Logo } from '@/components/Logo/Logo'
import { PreferenzeCookie } from '@/components/Consenso/CookieBanner'
import { Social } from '@/components/Social'
import { loghi } from '@/utilities/marchio'

export async function Footer({ lingua }: { lingua: string }) {
  // Se il backend non risponde il sito resta in piedi, con la navigazione vuota
  const footerData = await getFooter(lingua).catch((e): FooterType => {
    console.error('Footer non disponibile:', e)
    return { id: 0, navItems: [] }
  })

  // Profili social: Impostazioni del sito > Social
  const impostazioni = await getImpostazioni(lingua)

  const logoPiede = loghi(impostazioni).piede
  const navItems = footerData?.navItems || []
  const legali = footerData?.datiLegali

  // Riga dei dati legali (obbligatori per un'azienda): solo le voci compilate nell'admin
  const datiLegali = [
    legali?.ragioneSociale,
    legali?.indirizzo,
    legali?.partitaIva &&
      (legali.codiceFiscale === legali.partitaIva
        ? `P.IVA e C.F. ${legali.partitaIva}`
        : `P.IVA ${legali.partitaIva}`),
    legali?.codiceFiscale &&
      legali.codiceFiscale !== legali.partitaIva &&
      `C.F. ${legali.codiceFiscale}`,
    legali?.rea && `REA ${legali.rea}`,
    legali?.pec && `PEC ${legali.pec}`,
  ].filter(Boolean)

  return (
    <footer className="mt-auto border-t border-border bg-black dark:bg-card text-white">
      <div className="container py-8 gap-8 flex flex-col md:flex-row md:justify-between">
        <div className="flex flex-col gap-6">
          <Link className="flex items-center" href="/">
            {/* Piè di pagina nero: logo del piè di pagina o, se manca, quello per sfondo scuro */}
            <Logo logo={{ chiaro: logoPiede, scuro: logoPiede }} />
          </Link>
          <Social profili={impostazioni?.social} />
        </div>

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
      {datiLegali.length > 0 && (
        <div className="border-t border-white/15">
          <p className="container py-4 text-xs text-white/70">
            © {new Date().getFullYear()} {datiLegali.join(' · ')}
          </p>
        </div>
      )}
    </footer>
  )
}
