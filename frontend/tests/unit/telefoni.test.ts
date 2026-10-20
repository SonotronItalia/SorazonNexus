import { describe, expect, it } from 'vitest'

import { telefoni } from '@/utilities/telefoni'

describe('telefoni dei centri', () => {
  it('divide più numeri e aggiunge il prefisso italiano', () => {
    expect(telefoni('089 303004 - 347 1722920')).toEqual([
      { testo: '089 303004', href: 'tel:+39089303004' },
      { testo: '347 1722920', href: 'tel:+393471722920' },
    ])
  })

  it('lascia i numeri già internazionali', () => {
    expect(telefoni('+39 388 1507748 - +39 339 8408665').map((t) => t.href)).toEqual([
      'tel:+393881507748',
      'tel:+393398408665',
    ])
  })

  it('ignora campi vuoti o senza un numero vero', () => {
    expect(telefoni(null)).toEqual([])
    expect(telefoni('chiedere in segreteria')).toEqual([])
  })
})
