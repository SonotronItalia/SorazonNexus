import type { MetadataRoute } from 'next'

import { getImpostazioni, getSeo } from '@/lib/content'
import { icone } from '@/utilities/marchio'
import { SITE_NAME } from '@/utilities/mergeOpenGraph'

// Manifest per Android ("Aggiungi a schermata Home"): nome del sito e icone ricavate dall'icona
// di Impostazioni del sito > Marchio (route /icone)
export default async function manifest(): Promise<MetadataRoute.Manifest> {
  const [impostazioni, seo] = await Promise.all([getImpostazioni(), getSeo()])
  const v = icone(impostazioni).icona?.versione
  const q = v ? `?v=${encodeURIComponent(v)}` : ''
  const nome = seo?.nomeSito || SITE_NAME
  return {
    name: nome,
    short_name: nome,
    start_url: '/',
    display: 'browser',
    background_color: '#ffffff',
    theme_color: '#00a3b7',
    icons: [
      { src: `/icone/192.png${q}`, sizes: '192x192', type: 'image/png' },
      { src: `/icone/512.png${q}`, sizes: '512x512', type: 'image/png' },
    ],
  }
}
