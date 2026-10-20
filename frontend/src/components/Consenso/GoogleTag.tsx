'use client'

import Script from 'next/script'
import { useEffect } from 'react'

import { useConsenso } from '@/providers/Consenso'
import type { ConfigGoogle } from '@/utilities/google'

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
 * Tag di Google con il Consent Mode v2 (ID e modalità dalle Impostazioni del sito, vedi
 * utilities/google.ts). Lo stato del consenso parte "negato" nell'<head> (ConsentModeScript) e
 * si aggiorna qui quando il visitatore sceglie.
 * - Modalità base: Tag Manager o gtag.js si caricano solo dopo il consenso.
 * - Modalità avanzata: si caricano subito; finché il consenso è negato Google riceve solo
 *   segnali anonimi senza cookie.
 * Con Tag Manager, Analytics e Ads si configurano dentro Tag Manager: gtag.js non si carica
 * (altrimenti ogni visita verrebbe contata due volte).
 */
export const GoogleTag: React.FC<{ google: ConfigGoogle }> = ({ google }) => {
  const { gtmId, gaId, adsId, modalita } = google
  const { stato, scelte } = useConsenso()
  const statistiche = Boolean(gtmId || gaId) && scelte.statistiche
  const marketing = Boolean(gtmId || adsId) && scelte.marketing

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

  const avanzata = modalita === 'avanzata'

  if (gtmId) {
    if (!avanzata && !statistiche && !marketing) return null
    return (
      <Script id="gtm-js" strategy="afterInteractive">
        {`(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src='https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);})(window,document,'script','dataLayer',${JSON.stringify(gtmId)});`}
      </Script>
    )
  }

  // Senza Tag Manager: gtag.js diretto per Analytics e/o Ads
  const conGa = Boolean(gaId) && (avanzata || statistiche)
  const conAds = Boolean(adsId) && (avanzata || marketing)
  if (!conGa && !conAds) return null

  const idPrincipale = (conGa ? gaId : adsId) as string
  return (
    <>
      <Script
        id="gtag-js"
        src={`https://www.googletagmanager.com/gtag/js?id=${encodeURIComponent(idPrincipale)}`}
        strategy="afterInteractive"
      />
      <Script id="gtag-config" strategy="afterInteractive">
        {`gtag('js', new Date());${conGa ? `gtag('config', ${JSON.stringify(gaId)});` : ''}${
          conAds ? `gtag('config', ${JSON.stringify(adsId)});` : ''
        }`}
      </Script>
    </>
  )
}
