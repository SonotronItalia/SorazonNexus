import { describe, expect, it, vi } from 'vitest'

// Niente CMS nei test unitari: le Impostazioni del sito mancano (valori di riserva del codice)
vi.mock('@/lib/content', () => ({ getImpostazioni: async () => null }))

import { generateMeta } from '@/utilities/generateMeta'
import { DESCRIZIONE_SITO } from '@/utilities/mergeOpenGraph'

describe('generateMeta (titolo, descrizione, canonico, condivisione)', () => {
  it('pagina con titolo e descrizione SEO', async () => {
    const m = await generateMeta({
      doc: {
        title: 'Terapia',
        slug: 'terapia',
        meta: { title: 'Terapia Sorazon', description: 'Come funziona' },
      },
      percorso: '/terapia',
    })
    expect(m.title).toBe('Terapia Sorazon')
    expect(m.description).toBe('Come funziona')
    expect(m.alternates?.canonical).toBe('/terapia')
    expect((m.openGraph as { url?: string }).url).toBe('/terapia')
  })

  it("senza dati SEO usa il titolo della pagina, la descrizione del sito e l'immagine generata", async () => {
    const m = await generateMeta({
      doc: { title: 'Contatti', slug: 'contatti' },
      percorso: '/contatti',
    })
    expect(m.title).toBe('Contatti | Sorazon')
    expect(m.description).toBe(DESCRIZIONE_SITO)
    const img = (m.openGraph as { images: { url: string }[] }).images[0].url
    expect(img).toBe('https://www.sorazon.it/og?titolo=Contatti')
  })

  it('in home solo il nome del sito; immagini piccole sostituite da quella generata', async () => {
    const home = await generateMeta({ doc: { title: 'Home', slug: 'home' }, percorso: '/' })
    expect(home.title).toBe('Sorazon')
    const notizia = await generateMeta({
      doc: {
        title: 'Il gomito',
        slug: 'il-gomito',
        meta: { image: { id: 1, url: '/api/media/file/c.jpg', width: 200 } as never },
      },
      percorso: '/posts/il-gomito',
      tipo: 'article',
    })
    const img = (notizia.openGraph as { images: { url: string }[] }).images[0].url
    expect(img).toContain('/og?titolo=')
    expect((notizia.openGraph as { type?: string }).type).toBe('article')
  })
})
