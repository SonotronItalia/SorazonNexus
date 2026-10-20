import { afterEach, describe, expect, it, vi } from 'vitest'

import { dentroLeDate } from '@/components/AvvisoSito'
import type { Impostazioni } from '@/payload-types'
import { categorieGoogle, configGoogle } from '@/utilities/google'

const imp = (analisi: Record<string, unknown>) =>
  ({ id: 1, nomeSito: 'Sorazon', analisi }) as unknown as Impostazioni

afterEach(() => vi.unstubAllEnvs())

describe('configGoogle (ID di Google e Consent Mode)', () => {
  it('usa gli ID delle Impostazioni del sito', () => {
    expect(
      configGoogle(
        imp({
          googleTagManagerId: 'GTM-ABC1234',
          googleAnalyticsId: 'g-abc123xyz9',
          modalitaConsenso: 'avanzata',
        }),
      ),
    ).toEqual({
      gtmId: 'GTM-ABC1234',
      gaId: 'G-ABC123XYZ9',
      adsId: undefined,
      modalita: 'avanzata',
    })
  })

  it('senza ID nel CMS usa le variabili del server; il segnaposto di .env.example non vale', () => {
    vi.stubEnv('GA_MEASUREMENT_ID', 'G-SERVER1234')
    vi.stubEnv('GOOGLE_ADS_ID', 'AW-123456789')
    expect(configGoogle(null)).toMatchObject({
      gaId: 'G-SERVER1234',
      adsId: 'AW-123456789',
      modalita: 'base',
    })
    vi.stubEnv('GA_MEASUREMENT_ID', 'G-XXXXXXXXXX')
    expect(configGoogle(null).gaId).toBeUndefined()
  })

  it('il CMS ha la precedenza sul server', () => {
    vi.stubEnv('GA_MEASUREMENT_ID', 'G-SERVER1234')
    expect(configGoogle(imp({ googleAnalyticsId: 'G-DALCMS1234' })).gaId).toBe('G-DALCMS1234')
  })

  it('ID nel formato sbagliato non arrivano mai nella pagina', () => {
    const c = configGoogle(
      imp({
        googleTagManagerId: "GTM-1');alert(1)//",
        googleAnalyticsId: 'UA-1234-1',
        googleAdsId: 'AW-<b>',
      }),
    )
    expect(c).toMatchObject({ gtmId: undefined, gaId: undefined, adsId: undefined })
  })

  it('modalità base se non indicata o sconosciuta', () => {
    expect(configGoogle(imp({})).modalita).toBe('base')
    expect(configGoogle(imp({ modalitaConsenso: 'qualcosa' })).modalita).toBe('base')
  })

  it('con Tag Manager il banner chiede sia statistiche sia marketing', () => {
    expect(categorieGoogle({ gtmId: 'GTM-ABC1234', modalita: 'base' })).toEqual({
      statistiche: true,
      marketing: true,
    })
    expect(categorieGoogle({ gaId: 'G-ABC123XYZ9', modalita: 'base' })).toEqual({
      statistiche: true,
      marketing: false,
    })
    expect(categorieGoogle({ modalita: 'base' })).toEqual({ statistiche: false, marketing: false })
  })
})

describe('avviso in cima al sito: date', () => {
  const ora = Date.parse('2026-08-15T12:00:00Z')
  it('senza date è sempre dentro', () => {
    expect(dentroLeDate({}, ora)).toBe(true)
  })
  it('rispetta inizio e fine', () => {
    expect(
      dentroLeDate({ inizio: '2026-08-10T00:00:00Z', fine: '2026-08-20T00:00:00Z' }, ora),
    ).toBe(true)
    expect(dentroLeDate({ inizio: '2026-08-16T00:00:00Z' }, ora)).toBe(false)
    expect(dentroLeDate({ fine: '2026-08-15T11:59:00Z' }, ora)).toBe(false)
  })
})
