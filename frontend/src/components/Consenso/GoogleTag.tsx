'use client'

import Script from 'next/script'
import { useEffect } from 'react'

import { useConsenso } from '@/providers/Consenso'

type Gtag = (...args: unknown[]) => void

// Cookie di Google Analytics: al ritiro del consenso si cancellano
const cancellaCookieAnalytics = () => {
  for (const voce of document.cookie.split(';')) {
    const nome = voce.split('=')[0].trim()
    if (/^_ga(_|$)|^_gid$/.test(nome)) {
      const dominio = location.hostname.replace(/^www\./, '')
      for (const d of ['', `; domain=${dominio}`, `; domain=.${dominio}`]) {
        document.cookie = `${nome}=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/${d}`
      }
    }
  }
}

/**
 * Carica gtag.js solo con il consenso (statistiche per Google Analytics, marketing per Google
 * Ads) e aggiorna il Consent Mode quando il visitatore cambia idea. Gli ID arrivano dal server
 * (variabili GA_MEASUREMENT_ID e GOOGLE_ADS_ID, lette a runtime); senza ID non fa nulla.
 */
export const GoogleTag: React.FC<{ gaId?: string; adsId?: string }> = ({ gaId, adsId }) => {
  const { stato, scelte } = useConsenso()
  const statistiche = Boolean(gaId) && scelte.statistiche
  const marketing = Boolean(adsId) && scelte.marketing

  useEffect(() => {
    const gtag = (window as unknown as { gtag?: Gtag }).gtag
    if (stato === 'sconosciuto' || !gtag) return
    const m = marketing ? 'granted' : 'denied'
    gtag('consent', 'update', {
      analytics_storage: statistiche ? 'granted' : 'denied',
      ad_storage: m,
      ad_user_data: m,
      ad_personalization: m,
    })
    if (!statistiche) cancellaCookieAnalytics()
  }, [stato, statistiche, marketing])

  if (!statistiche && !marketing) return null

  const idPrincipale = (statistiche ? gaId : adsId) as string
  return (
    <>
      <Script
        id="gtag-js"
        src={`https://www.googletagmanager.com/gtag/js?id=${encodeURIComponent(idPrincipale)}`}
        strategy="afterInteractive"
      />
      <Script id="gtag-config" strategy="afterInteractive">
        {`gtag('js', new Date());${statistiche ? `gtag('config', ${JSON.stringify(gaId)});` : ''}${
          marketing ? `gtag('config', ${JSON.stringify(adsId)});` : ''
        }`}
      </Script>
    </>
  )
}
