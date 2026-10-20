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
import { DESCRIZIONE_SITO, mergeOpenGraph, SITE_NAME } from '@/utilities/mergeOpenGraph'

import './globals.css'
import { getServerSideURL } from '@/utilities/getURL'
import { getColori, getFooter, getImpostazioni, getTornaSu } from '@/lib/content'
import { AvvisoSito } from '@/components/AvvisoSito'
import { configGoogle } from '@/utilities/google'
import { DatiStrutturati } from '@/components/DatiStrutturati'
import { datiAziendaESito } from '@/utilities/datiStrutturati'
import { TornaSu } from '@/components/TornaSu'

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  // Colori della tavolozza come variabili CSS: il testo colorato nell'editor le usa, così un
  // codice cambiato nell'admin vale subito ovunque. Solo codici validi; se il backend non
  // risponde restano i valori di riserva salvati nel testo.
  const [colori, tornaSu, footer, impostazioni] = await Promise.all([
    getColori().catch(() => []),
    getTornaSu().catch(() => null),
    getFooter().catch(() => null),
    getImpostazioni(),
  ])
  // ID di Google e modalità del consenso: Impostazioni del sito, con le variabili d'ambiente come
  // riserva (utilities/google.ts). Senza ID nessun tag e nessuna categoria nel banner.
  const google = configGoogle(impostazioni)
  const conGoogle = Boolean(google.gtmId || google.gaId || google.adsId)
  // Ora della richiesta, passata all'avviso: il primo disegno nel browser usa la stessa ora del
  // server (niente differenze all'idratazione), poi l'avviso ricontrolla le date da solo.
  // Componente server eseguito una volta per richiesta: qui l'ora "impura" è proprio quella voluta.
  // eslint-disable-next-line react-hooks/purity
  const oraServer = Date.now()
  const variabiliColori = colori
    .filter((c) => /^#[0-9a-fA-F]{6}$/.test(c.codice))
    .map((c) => `--colore-${c.id}:${c.codice};`)
    .join('')

  return (
    <html className={cn(GeistSans.variable, GeistMono.variable)} lang="it" suppressHydrationWarning>
      <head>
        <InitTheme />
        {conGoogle && <ConsentModeScript />}
        {variabiliColori && <style>{`:root{${variabiliColori}}`}</style>}
        <link href="/favicon.ico" rel="icon" sizes="32x32" />
        <link href="/favicon.svg" rel="icon" type="image/svg+xml" />
        <DatiStrutturati dati={datiAziendaESito(footer, impostazioni)} />
      </head>
      <body>
        <Providers>
          <PreviewBar />
          {impostazioni?.avviso && <AvvisoSito avviso={impostazioni.avviso} oraServer={oraServer} />}
          <Header />
          {children}
          <Footer />
          {tornaSu && <TornaSu impostazioni={tornaSu} />}
          <CookieBanner google={google} />
          {conGoogle && <GoogleTag google={google} />}
        </Providers>
      </body>
    </html>
  )
}

// Funzione e non oggetto: SITE_URL si legge a runtime
export async function generateMetadata(): Promise<Metadata> {
  const impostazioni = await getImpostazioni()
  const nomeSito = impostazioni?.nomeSito?.trim() || SITE_NAME
  return {
    metadataBase: new URL(getServerSideURL()),
    title: nomeSito,
    description: impostazioni?.descrizioneSito?.trim() || DESCRIZIONE_SITO,
    applicationName: nomeSito,
    publisher: 'SONOTRON ITALIA S.R.L.S.',
    openGraph: mergeOpenGraph(),
    twitter: {
      card: 'summary_large_image',
    },
  }
}
