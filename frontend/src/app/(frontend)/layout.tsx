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

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  // ID di Google letti a runtime (una sola immagine per ogni ambiente); vuoti = niente tag
  const gaId = process.env.GA_MEASUREMENT_ID || undefined
  const adsId = process.env.GOOGLE_ADS_ID || undefined

  return (
    <html className={cn(GeistSans.variable, GeistMono.variable)} lang="it" suppressHydrationWarning>
      <head>
        <InitTheme />
        {(gaId || adsId) && <ConsentModeScript />}
        <link href="/favicon.ico" rel="icon" sizes="32x32" />
        <link href="/favicon.svg" rel="icon" type="image/svg+xml" />
      </head>
      <body>
        <Providers>
          <PreviewBar />
          <Header />
          {children}
          <Footer />
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
