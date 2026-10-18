declare global {
  namespace NodeJS {
    interface ProcessEnv {
      // Indirizzo interno del backend (in Docker http://backend:3000)
      PAYLOAD_INTERNAL_URL?: string
      // Indirizzo pubblico del sito, letto a runtime
      SITE_URL?: string
      // Segreto condiviso con il backend per /api/revalidate
      REVALIDATE_SECRET?: string
      // Chiave dell'utente di servizio (bozze, fase 6)
      PAYLOAD_API_KEY?: string
    }
  }
}

// If this file has no import/export statements (i.e. is a script)
// convert it into a module by adding an empty export statement.
export {}
