import { describe, expect, it } from 'vitest'

import type { Lingue } from '@/payload-types'
import { conPrefisso, percorsoDoc, urlNellaLingua } from '@/utilities/lingue'
import { lingueAttive } from '@/utilities/lingueAttive'
import { vociSitemap } from '@/utilities/sitemap'
import { testi } from '@/utilities/testi'

describe('lingue del sito', () => {
  it('italiano senza prefisso, le altre con /codice', () => {
    expect(conPrefisso('it', '/terapia')).toBe('/terapia')
    expect(conPrefisso('en', '/')).toBe('/en')
    expect(percorsoDoc('en', 'therapy')).toBe('/en/therapy')
    expect(percorsoDoc('en', 'home')).toBe('/en')
    expect(percorsoDoc('it', 'home')).toBe('/')
    expect(percorsoDoc('en', 'notizia', 'posts')).toBe('/en/posts/notizia')
  })

  it('selettore: italiano sempre primo, poi solo le attive con la bandiera scelta', () => {
    const lingue = {
      id: 1,
      stile: 'bandiera-nome',
      elenco: [
        { codice: 'de', attiva: false },
        { codice: 'en', attiva: true, bandiera: 'us' },
      ],
    } as Lingue
    expect(lingueAttive(lingue)).toEqual([
      { codice: 'it', nome: 'Italiano', bandiera: 'it' },
      { codice: 'en', nome: 'English', bandiera: 'us' },
    ])
    expect(lingueAttive(null).map((l) => l.codice)).toEqual(['it'])
  })

  it('sitemap: le traduzioni solo se esistono, non nascoste e in una lingua attiva', () => {
    const voci = vociSitemap(
      [
        { slug: { it: 'terapia', en: 'therapy', de: 'therapie' }, nascosta: { en: false } },
        { slug: { it: 'centri', en: 'centres' }, nascosta: { en: true } },
        { slug: { it: 'contatti' } },
      ],
      'pages',
      ['it', 'en'],
      null,
      'https://www.sorazon.it',
      '2026-10-21',
    ).map((v) => v.loc)
    expect(voci).toEqual([
      'https://www.sorazon.it/terapia',
      'https://www.sorazon.it/en/therapy',
      'https://www.sorazon.it/centri',
      'https://www.sorazon.it/contatti',
    ])
  })

  it("scritte fisse: le lingue senza dizionario usano l'inglese", () => {
    expect(testi('it').cookieRifiuta).toBe('Rifiuta')
    expect(testi('en').cookieRifiuta).toBe('Refuse')
    expect(testi('de').cookieRifiuta).toBe('Refuse')
  })
})

describe('urlNellaLingua (indirizzi scritti a mano nei testi, menu e pulsanti)', () => {
  it('aggiunge la lingua agli indirizzi del sito', () => {
    expect(urlNellaLingua('en', '/privacy-policy')).toBe('/en/privacy-policy')
    expect(urlNellaLingua('en', '/')).toBe('/en')
  })
  it("lascia com'è l'italiano, i file, le API, gli indirizzi esterni e quelli con già una lingua", () => {
    expect(urlNellaLingua('it', '/privacy-policy')).toBe('/privacy-policy')
    for (const url of [
      '/media/rivista.pdf',
      '/api/form-submissions',
      '//esempio.it/x',
      'https://esempio.it',
      'mailto:a@b.it',
      '/en/therapy',
    ])
      expect(urlNellaLingua('en', url), url).toBe(url)
  })
})
