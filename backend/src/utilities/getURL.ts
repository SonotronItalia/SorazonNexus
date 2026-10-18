// Nel backend "il sito" è il frontend: gli indirizzi per SEO, anteprime e CORS
// puntano a lui. Si legge a RUNTIME (niente NEXT_PUBLIC_, che verrebbe fissato in build).
export const getServerSideURL = (): string =>
  process.env.FRONTEND_PUBLIC_URL || 'http://localhost:3000'

export const getClientSideURL = (): string => getServerSideURL()
