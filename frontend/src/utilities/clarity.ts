/**
 * Microsoft Clarity (heatmap e registrazioni) si aggiunge in Google Tag Manager, con la condizione
 * di consenso "analytics_storage". Il sito fa la parte che Tag Manager non sa fare bene: passa a
 * Clarity la scelta del visitatore (consentv2, obbligatorio per i visitatori europei) a ogni
 * cambio e, al rifiuto delle statistiche, ne cancella i cookie insieme a quelli di Analytics.
 */

// Cookie delle statistiche sul dominio del sito: Google Analytics e Clarity
export const COOKIE_STATISTICHE = /^_ga(_|$)|^_gid$|^_clck$|^_clsk$/

type Stato = 'granted' | 'denied'

// Nomi dei campi come nella documentazione di Clarity (ad_Storage, analytics_Storage)
export const consensoClarity = (
  statistiche: boolean,
  marketing: boolean,
): { ad_Storage: Stato; analytics_Storage: Stato } => ({
  ad_Storage: marketing ? 'granted' : 'denied',
  analytics_Storage: statistiche ? 'granted' : 'denied',
})

type Clarity = ((...args: unknown[]) => void) & { q?: unknown[] }

export const inviaConsensoClarity = (statistiche: boolean, marketing: boolean) => {
  const w = window as unknown as { clarity?: Clarity }
  // Coda identica a quella del codice di Clarity: se Clarity arriva dopo (da Tag Manager) legge
  // la scelta in coda; se non c'è, la coda resta lì senza effetti
  w.clarity =
    w.clarity ||
    function () {
      // eslint-disable-next-line prefer-rest-params
      ;(w.clarity!.q = w.clarity!.q || []).push(arguments)
    }
  w.clarity('consentv2', consensoClarity(statistiche, marketing))
}

export const cancellaCookieStatistiche = () => {
  for (const voce of document.cookie.split(';')) {
    const nome = voce.split('=')[0].trim()
    if (COOKIE_STATISTICHE.test(nome)) {
      const dominio = location.hostname.replace(/^www\./, '')
      for (const d of ['', `; domain=${dominio}`, `; domain=.${dominio}`]) {
        document.cookie = `${nome}=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/${d}`
      }
    }
  }
}
