import canUseDOM from './canUseDOM'

// Indirizzo pubblico del sito, letto a RUNTIME (niente NEXT_PUBLIC_, che verrebbe fissato in build)
export const getServerSideURL = (): string => process.env.SITE_URL || 'http://localhost:3000'

// Nel browser vale l'origine della pagina; sul server l'indirizzo pubblico
export const getClientSideURL = (): string =>
  canUseDOM ? window.location.origin : getServerSideURL()
