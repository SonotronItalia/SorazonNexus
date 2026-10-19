declare global {
  namespace NodeJS {
    interface ProcessEnv {
      // Indirizzo interno del backend (in Docker http://backend:3000)
      PAYLOAD_INTERNAL_URL?: string
      // Indirizzo pubblico del sito, letto a runtime
      SITE_URL?: string
      // Segreto interno condiviso con il backend: /api/revalidate e lettura delle bozze
      REVALIDATE_SECRET?: string
      // Segreto nell'URL di anteprima delle bozze (/next/preview)
      PREVIEW_SECRET?: string
      // Indirizzo pubblico del pannello: il live preview accetta messaggi solo da qui
      BACKEND_PUBLIC_URL?: string
      // Google Analytics 4 (G-XXXXXXX) e Google Ads (AW-XXXXXXX): vuoti = nessun tag Google
      GA_MEASUREMENT_ID?: string
      GOOGLE_ADS_ID?: string
    }
  }
}

// If this file has no import/export statements (i.e. is a script)
// convert it into a module by adding an empty export statement.
export {}
