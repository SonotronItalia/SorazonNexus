import { describe, expect, it } from 'vitest'

import type { Seo } from '@/payload-types'
import { crawlerAI, nonIndicizzare, titoloPagina } from '@/utilities/seo'

const seo = (dati: Partial<Seo>) => ({ id: 1, nomeSito: 'Sorazon', ...dati }) as Seo

describe('SEO e motori AI', () => {
  it('titolo dal modello, Home con il solo nome del sito', () => {
    expect(titoloPagina('Terapia', seo({}))).toBe('Terapia | Sorazon')
    expect(titoloPagina('Terapia', seo({ modelloTitolo: '{sito} – {pagina}' }))).toBe(
      'Sorazon – Terapia',
    )
    expect(titoloPagina(undefined, seo({}))).toBe('Sorazon')
    expect(titoloPagina('Sorazon: la terapia', seo({}))).toBe('Sorazon: la terapia')
    // Modello senza {pagina}: si usa quello predefinito
    expect(titoloPagina('Terapia', seo({ modelloTitolo: 'Sorazon' }))).toBe('Terapia | Sorazon')
    // CMS irraggiungibile: valori di riserva
    expect(titoloPagina('Terapia', null)).toBe('Terapia | Sorazon')
  })

  it('pagine escluse e sito nascosto', () => {
    const s = seo({ ricerca: { escluse: [{ percorso: '/promo/' }] } })
    expect(nonIndicizzare('/promo', s)).toBe(true)
    expect(nonIndicizzare('/promo/estate', s)).toBe(true)
    expect(nonIndicizzare('/promozioni', s)).toBe(false)
    expect(nonIndicizzare('/terapia', s)).toBe(false)
    expect(nonIndicizzare('/terapia', seo({ ricerca: { nascondiSito: true } }))).toBe(true)
  })

  it('assistenti AI: bloccati solo quelli spenti', () => {
    const { ammessi, bloccati } = crawlerAI(seo({ ai: { ammessi: { chatgpt: false } } }))
    expect(bloccati).toEqual(['GPTBot', 'OAI-SearchBot', 'ChatGPT-User'])
    expect(ammessi).toContain('ClaudeBot')
    expect(crawlerAI(null).bloccati).toEqual([])
  })
})
