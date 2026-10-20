import type { Plugin } from 'payload'

// Ordine dei gruppi nella barra laterale dell'admin. Payload li mostra nell'ordine in cui trova
// collezioni e globali, e i plugin aggiungono le loro in fondo: questo passaggio, per ultimo,
// le riordina. Le voci senza gruppo restano in testa.
const ORDINE = ['Contenuti', 'Contatti', 'Aspetto del sito', 'Impostazioni', 'Avanzate']

const posizione = (admin: { group?: unknown } | undefined) => {
  const g = typeof admin?.group === 'string' ? admin.group : ''
  const i = ORDINE.indexOf(g)
  return i < 0 ? -1 : i
}

export const ordineMenu: Plugin = (config) => ({
  ...config,
  collections: [...(config.collections ?? [])].sort((a, b) => posizione(a.admin) - posizione(b.admin)),
  globals: [...(config.globals ?? [])].sort((a, b) => posizione(a.admin) - posizione(b.admin)),
})
