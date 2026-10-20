import type { Impostazioni } from '@/payload-types'

// Formati accettati (gli stessi del CMS): un ID sbagliato non finisce nella pagina
const FORMATI = {
  gtm: /^GTM-[A-Z0-9]{4,10}$/,
  ga: /^G-[A-Z0-9]{4,12}$/,
  ads: /^AW-\d{6,12}$/,
} as const

const valido = (valore: string | null | undefined, formato: RegExp) => {
  const v = valore?.trim().toUpperCase()
  // Il segnaposto di .env.example (G-XXXXXXXXXX) non attiva nulla
  return v && formato.test(v) && !v.includes('XXXX') ? v : undefined
}

export type ConfigGoogle = {
  gtmId?: string
  gaId?: string
  adsId?: string
  modalita: 'base' | 'avanzata'
}

/**
 * ID di Google e modalità del Consent Mode: prima le Impostazioni del sito (admin), poi le
 * variabili d'ambiente del server (GA_MEASUREMENT_ID, GOOGLE_ADS_ID) come riserva.
 */
export function configGoogle(impostazioni: Impostazioni | null): ConfigGoogle {
  const a = impostazioni?.analisi
  return {
    gtmId: valido(a?.googleTagManagerId, FORMATI.gtm),
    gaId: valido(a?.googleAnalyticsId, FORMATI.ga) ?? valido(process.env.GA_MEASUREMENT_ID, FORMATI.ga),
    adsId: valido(a?.googleAdsId, FORMATI.ads) ?? valido(process.env.GOOGLE_ADS_ID, FORMATI.ads),
    modalita: a?.modalitaConsenso === 'avanzata' ? 'avanzata' : 'base',
  }
}

// Con Tag Manager le categorie dipendono da cosa c'è dentro: si chiedono entrambe
export const categorieGoogle = ({ gtmId, gaId, adsId }: ConfigGoogle) => ({
  statistiche: Boolean(gtmId || gaId),
  marketing: Boolean(gtmId || adsId),
})
