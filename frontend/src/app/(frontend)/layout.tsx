import type { Metadata } from 'next'

import { cn } from '@/utilities/ui'
import { GeistMono } from 'geist/font/mono'
import { GeistSans } from 'geist/font/sans'
import React from 'react'

import { Footer } from '@/Footer/Component'
import { Header } from '@/Header/Component'
import { ConsentModeScript } from '@/components/Consenso/ConsentModeScript'
import { CookieBanner } from '@/components/Consenso/CookieBanner'
import { GoogleTag } from '@/components/Consenso/GoogleTag'
import { PreviewBar } from '@/components/PreviewBar'
import { Providers } from '@/providers'
import { InitTheme } from '@/providers/Theme/InitTheme'
import { mergeOpenGraph } from '@/utilities/mergeOpenGraph'

import './globals.css'
import { getServerSideURL } from '@/utilities/getURL'
import { getColori, getTornaSu } from '@/lib/content'
import { TornaSu } from '@/components/TornaSu'

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  // ID di Google letti a runtime (una sola immagine per ogni ambiente); vuoti = niente tag
  // Solo ID validi: il segnaposto G-XXXXXXXXXX di .env.example non attiva nulla
  const idValido = (valore: string | undefined, prefisso: 'G' | 'AW') =>
    valore && new RegExp(`^${prefisso}-[A-Z0-9]{4,}$`).test(valore) && !valore.includes('XXXX')
      ? valore
      : undefined
  const gaId = idValido(process.env.GA_MEASUREMENT_ID, 'G')
  const adsId = idValido(process.env.GOOGLE_ADS_ID, 'AW')

  // Colori della tavolozza come variabili CSS: il testo colorato nell'editor le usa, così un
  // codice cambiato nell'admin vale subito ovunque. Solo codici validi; se il backend non
  // risponde restano i valori di riserva salvati nel testo.
  const [colori, tornaSu] = await Promise.all([
    getColori().catch(() => []),
    getTornaSu().catch(() => null),
  ])
  const variabiliColori = colori
    .filter((c) => /^#[0-9a-fA-F]{6}$/.test(c.codice))
    .map((c) => `--colore-${c.id}:${c.codice};`)
    .join('')

  return (
    <html className={cn(GeistSans.variable, GeistMono.variable)} lang="it" suppressHydrationWarning>
      <head>
        <InitTheme />
        {(gaId || adsId) && <ConsentModeScript />}
        {variabiliColori && <style>{`:root{${variabiliColori}}`}</style>}
        <link href="/favicon.ico" rel="icon" sizes="32x32" />
        <link href="/favicon.svg" rel="icon" type="image/svg+xml" />
      </head>
      <body>
        <Providers>
          <PreviewBar />
          <Header />
          {children}
          <Footer />
          {tornaSu && <TornaSu impostazioni={tornaSu} />}
          <CookieBanner gaId={gaId} adsId={adsId} />
          <GoogleTag gaId={gaId} adsId={adsId} />
        </Providers>
      </body>
    </html>
  )
}

// Funzione e non oggetto: SITE_URL si legge a runtime
export function generateMetadata(): Metadata {
  return {
    metadataBase: new URL(getServerSideURL()),
    openGraph: mergeOpenGraph(),
    twitter: {
      card: 'summary_large_image',
    },
  }
}
