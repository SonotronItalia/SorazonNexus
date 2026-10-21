import type { Metadata } from 'next'

import { cn } from '@/utilities/ui'
import { GeistMono } from 'geist/font/mono'
import { Inter_Tight } from 'next/font/google'
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
import { getColori, getFooter, getImpostazioni, getLingue, getSeo, getTornaSu } from '@/lib/content'
import { LinguaProvider } from '@/providers/Lingua'
import { LINGUE } from '@/utilities/lingue'
import { lingueAttive } from '@/utilities/lingueAttive'
import { linguaRichiesta } from '@/utilities/linguaRichiesta'
import { AvvisoSito } from '@/components/AvvisoSito'
import { configGoogle } from '@/utilities/google'
import { DatiStrutturati } from '@/components/DatiStrutturati'
import { datiAziendaESito } from '@/utilities/datiStrutturati'
import { descrizioneSito, nomeSito } from '@/utilities/seo'
import { TornaSu } from '@/components/TornaSu'

// Carattere dei titoli e dei testi: Inter Tight, scaricato in build e servito dal nostro server
// (nessuna richiesta a Google dal browser, quindi niente consenso)
const interTight = Inter_Tight({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-inter-tight',
})

// Tutte le pagine si disegnano a ogni richiesta: la lingua arriva dall'intestazione x-lingua
// (proxy.ts). I dati del CMS restano in cache con i tag, quindi resta veloce
export const dynamic = 'force-dynamic'

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  // Colori della tavolozza come variabili CSS: il testo colorato nell'editor le usa, così un
  // codice cambiato nell'admin vale subito ovunque. Solo codici validi; se il backend non
  // risponde restano i valori di riserva salvati nel testo.
  // Lingua dall'indirizzo (/en/…): testi tradotti di avviso, SEO, menu e piè di pagina
  const lingua = await linguaRichiesta()
  const [colori, tornaSu, footer, impostazioni, seo, lingue] = await Promise.all([
    getColori().catch(() => []),
    getTornaSu().catch(() => null),
    getFooter(lingua).catch(() => null),
    getImpostazioni(lingua),
    getSeo(lingua),
    getLingue(),
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
    <html
      className={cn(interTight.variable, GeistMono.variable)}
      lang={lingua}
      suppressHydrationWarning
    >
      <head>
        <InitTheme />
        {conGoogle && <ConsentModeScript />}
        {variabiliColori && <style>{`:root{${variabiliColori}}`}</style>}
        <link href="/favicon.ico" rel="icon" sizes="32x32" />
        <link href="/favicon.svg" rel="icon" type="image/svg+xml" />
        <DatiStrutturati dati={datiAziendaESito(footer, impostazioni, seo)} />
      </head>
      <body>
        <Providers>
          <LinguaProvider lingua={lingua} lingue={lingueAttive(lingue)} stile={lingue?.stile}>
          <PreviewBar />
          {impostazioni?.avviso && (
            <AvvisoSito avviso={impostazioni.avviso} oraServer={oraServer} />
          )}
          <Header lingua={lingua} />
          {children}
          <Footer lingua={lingua} />
          {tornaSu && <TornaSu impostazioni={tornaSu} />}
          <CookieBanner google={google} />
          {conGoogle && <GoogleTag google={google} />}
          </LinguaProvider>
        </Providers>
      </body>
    </html>
  )
}

// Funzione e non oggetto: SITE_URL si legge a runtime
export async function generateMetadata(): Promise<Metadata> {
  // Nome, descrizione, verifiche e "sito nascosto": Avanzate > SEO e motori AI
  const lingua = await linguaRichiesta()
  const seo = await getSeo(lingua)
  const nome = nomeSito(seo)
  const verificaGoogle = seo?.ricerca?.verificaGoogle?.trim()
  const verificaBing = seo?.ricerca?.verificaBing?.trim()
  return {
    metadataBase: new URL(getServerSideURL()),
    title: nome,
    description: descrizioneSito(seo),
    applicationName: nome,
    publisher: seo?.azienda?.ragioneSociale?.trim() || 'SONOTRON ITALIA S.R.L.S.',
    openGraph: mergeOpenGraph({ locale: LINGUE.find((l) => l.codice === lingua)?.locale }),
    twitter: {
      card: 'summary_large_image',
    },
    ...(seo?.ricerca?.nascondiSito ? { robots: { index: false, follow: false } } : {}),
    ...(verificaGoogle || verificaBing
      ? {
          verification: {
            ...(verificaGoogle ? { google: verificaGoogle } : {}),
            ...(verificaBing ? { other: { 'msvalidate.01': verificaBing } } : {}),
          },
        }
      : {}),
  }
}
