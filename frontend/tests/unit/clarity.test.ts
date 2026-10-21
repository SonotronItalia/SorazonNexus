import { afterEach, describe, expect, it, vi } from 'vitest'

import { COOKIE_STATISTICHE, consensoClarity, inviaConsensoClarity } from '@/utilities/clarity'

afterEach(() => vi.unstubAllGlobals())

describe('Microsoft Clarity e consenso', () => {
  it('traduce la scelta del visitatore nel formato di consentv2', () => {
    expect(consensoClarity(true, false)).toEqual({
      ad_Storage: 'denied',
      analytics_Storage: 'granted',
    })
    expect(consensoClarity(false, true)).toEqual({
      ad_Storage: 'granted',
      analytics_Storage: 'denied',
    })
  })

  it('riconosce i cookie di Analytics e Clarity, non gli altri', () => {
    for (const c of ['_ga', '_ga_ABC123', '_gid', '_clck', '_clsk'])
      expect(COOKIE_STATISTICHE.test(c)).toBe(true)
    for (const c of ['payload-token', 'sorazon-effetti', '_gallo', '_clckx'])
      expect(COOKIE_STATISTICHE.test(c)).toBe(false)
  })

  it('senza Clarity mette la scelta in coda, come il codice ufficiale', () => {
    const finestra: { clarity?: ((...a: unknown[]) => void) & { q?: ArrayLike<unknown>[] } } = {}
    vi.stubGlobal('window', finestra)
    inviaConsensoClarity(false, false)
    const [chiamata] = finestra.clarity?.q ?? []
    expect(Array.from(chiamata)).toEqual([
      'consentv2',
      { ad_Storage: 'denied', analytics_Storage: 'denied' },
    ])
  })

  it('con Clarity già caricato lo chiama direttamente', () => {
    const clarity = vi.fn()
    vi.stubGlobal('window', { clarity })
    inviaConsensoClarity(true, true)
    expect(clarity).toHaveBeenCalledWith('consentv2', {
      ad_Storage: 'granted',
      analytics_Storage: 'granted',
    })
  })
})
