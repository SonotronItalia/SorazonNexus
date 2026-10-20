import { describe, expect, it } from 'vitest'

import { leggiCsv } from '@/seed/csv'

describe('leggiCsv (tabelle del seed, formato Excel italiano)', () => {
  it('usa la prima riga come intestazione e il punto e virgola come separatore', () => {
    expect(leggiCsv('nome;citta\nCentro A;Fano\nCentro B;Pesaro')).toEqual([
      { nome: 'Centro A', citta: 'Fano' },
      { nome: 'Centro B', citta: 'Pesaro' },
    ])
  })

  it('toglie il BOM che Excel mette in testa ai file UTF-8', () => {
    expect(leggiCsv('﻿nome;citta\nA;Fano')[0]).toEqual({ nome: 'A', citta: 'Fano' })
  })

  it('accetta virgolette, punto e virgola e a capo dentro un campo', () => {
    const [riga] = leggiCsv('nome;note\n"Studio ""Salute""";"riga 1\nriga 2; ancora"')
    expect(riga.nome).toBe('Studio "Salute"')
    expect(riga.note).toBe('riga 1\nriga 2; ancora')
  })

  it('omette le celle vuote, ignora le righe vuote e gestisce i fine riga Windows', () => {
    expect(leggiCsv('a;b\r\n1;\r\n\r\n;2\r\n')).toEqual([{ a: '1' }, { b: '2' }])
  })

  it('restituisce un elenco vuoto per un file vuoto', () => {
    expect(leggiCsv('')).toEqual([])
  })
})
