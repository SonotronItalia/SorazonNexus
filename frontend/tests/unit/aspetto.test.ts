import { describe, expect, it } from 'vitest'

import { posizioneTitolo } from '@/heros/comune/posizione'
import { formatDateTime } from '@/utilities/formatDateTime'
import { codiceColore, scuro, sfondo } from '@/utilities/sfondo'

describe('sfondo (colori della tavolozza)', () => {
  it('sceglie il tema del testo in base al colore, per la leggibilità', () => {
    expect(scuro('#000000')).toBe(true)
    expect(scuro('#36353A')).toBe(true)
    expect(scuro('#FFFFFF')).toBe(false)
    expect(sfondo('colore', { id: 1, nome: 'Grigio', codice: '#36353A' } as never)).toMatchObject({
      style: { backgroundColor: '#36353A' },
      'data-theme': 'dark',
    })
  })

  it('ignora codici non validi (niente CSS arbitrario da un colore)', () => {
    expect(
      codiceColore({ id: 1, nome: 'x', codice: 'red;background:url(x)' } as never),
    ).toBeUndefined()
    expect(sfondo('colore', { id: 1, nome: 'x', codice: '#12' } as never)).toEqual({
      className: '',
    })
    expect(sfondo('colore', 5)).toEqual({ className: '' })
  })

  it('le varianti fisse usano classi scritte per intero', () => {
    expect(sfondo('tenue', null).className).toBe('bg-muted')
    expect(sfondo('scuro', null)['data-theme']).toBe('dark')
    expect(sfondo(undefined, null).className).toBe('')
  })
})

describe('posizioneTitolo (9 posizioni negli hero)', () => {
  it('usa la predefinita se il valore manca', () => {
    expect(posizioneTitolo(null, 'centro-centro')).toEqual(
      posizioneTitolo('centro-centro', 'alto-sinistra'),
    )
  })
})

describe('formatDateTime', () => {
  it('scrive le date in italiano con il fuso di Roma', () => {
    expect(formatDateTime('2014-07-01T00:00:00.000Z')).toBe('1 luglio 2014')
    expect(formatDateTime('2016-12-31T23:30:00.000Z')).toBe('1 gennaio 2017')
  })
})
