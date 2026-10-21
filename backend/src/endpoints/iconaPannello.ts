import type { Endpoint } from 'payload'

/**
 * Favicon del pannello (scheda del browser), GET /api/icona-pannello indicato in admin.meta.icons:
 * rimanda al file dell'icona di Impostazioni del sito > Marchio, o alla Z predefinita
 * (backend/public/favicon.svg). Solo il percorso, non l'URL completo: vale da qualsiasi indirizzo.
 * Cache di 5 minuti: un'icona cambiata compare presto.
 */
export const iconaPannello: Endpoint = {
  path: '/icona-pannello',
  method: 'get',
  handler: async (req) => {
    let destinazione = '/favicon.svg'
    try {
      const { marchio } = await req.payload.findGlobal({ slug: 'impostazioni', depth: 1 })
      const icona = marchio?.icona
      if (icona && typeof icona === 'object' && icona.url) {
        destinazione = `${new URL(icona.url, 'http://x').pathname}?v=${encodeURIComponent(icona.updatedAt)}`
      }
    } catch {
      // Impostazioni non leggibili: icona predefinita
    }
    return new Response(null, {
      status: 302,
      headers: { Location: destinazione, 'Cache-Control': 'public, max-age=300' },
    })
  },
}
