// Costanti del consenso, condivise tra il provider (client) e lo script del Consent Mode (server)
export const CONSENSO = {
  CHIAVE: 'sorazon-consenso',
  EVENTO: 'sorazon-consenso-cambiato',
  // Cambiandola (es. nuove categorie) si chiede di nuovo il consenso a tutti
  VERSIONE: 1,
  // 6 mesi, come indicano le linee guida del Garante
  DURATA_MS: 180 * 24 * 60 * 60 * 1000,
} as const
