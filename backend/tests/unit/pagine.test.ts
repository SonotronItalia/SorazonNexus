import { describe, expect, it } from 'vitest'

import { leggiPagina, risolvi } from '@/seed/pagine'

const risolutori = {
  markdown: (t: string) => ({ md: t }),
  media: (f: string) => `id-media:${f}`,
  pagina: (s: string) => `id-pagina:${s}`,
  colore: (n: string) => `id-colore:${n}`,
  effetto: (n: string) => `id-effetto:${n}`,
  modulo: (t: string) => `id-modulo:${t}`,
}

describe('leggiPagina (pagine del seed in Markdown con intestazione YAML)', () => {
  it('senza layout il testo diventa un blocco di contenuto a tutta larghezza', () => {
    const p = leggiPagina('x.md', '---\ntitle: Prova\nslug: prova\n---\nCiao **mondo**')
    expect(p.slug).toBe('prova')
    expect(p.bozza).toBe(false)
    expect(p.dati.layout).toEqual([
      { blockType: 'content', columns: [{ size: 'full', richText: 'Ciao **mondo**' }] },
    ])
  })

  it('divide in colonne e in blocchi con i commenti del formato', () => {
    const p = leggiPagina(
      'x.md',
      '---\ntitle: T\nslug: t\n---\nA\n<!-- colonna -->\nB\n<!-- blocco -->\nC',
    )
    const layout = p.dati.layout as { columns: { size: string; richText: string }[] }[]
    expect(layout).toHaveLength(2)
    expect(layout[0].columns.map((c) => [c.size, c.richText])).toEqual([
      ['half', 'A'],
      ['half', 'B'],
    ])
  })

  it('assegna i blocchi di testo ai "content" vuoti del layout, nell\'ordine', () => {
    const p = leggiPagina(
      'x.md',
      '---\ntitle: T\nslug: t\nlayout:\n  - blockType: content\n  - blockType: cta\n---\nTesto',
    )
    const layout = p.dati.layout as { blockType: string; columns?: unknown[] }[]
    expect(layout[0].columns).toHaveLength(1)
    expect(layout[1].blockType).toBe('cta')
  })

  it('legge "bozza: true" e raccoglie i collegamenti ad altre pagine', () => {
    const p = leggiPagina('x.md', '---\ntitle: T\nslug: t\nbozza: true\nlink: pagina:centri\n---\n')
    expect(p.bozza).toBe(true)
    expect(p.collegamenti).toEqual(['centri'])
    expect(p.dati).not.toHaveProperty('bozza')
  })

  it('rifiuta file senza intestazione, senza slug o con blocchi di troppo', () => {
    expect(() => leggiPagina('x.md', 'solo testo')).toThrow(/intestazione/)
    expect(() => leggiPagina('x.md', '---\ntitle: T\n---\n')).toThrow(/slug/)
    expect(() =>
      leggiPagina('x.md', '---\ntitle: T\nslug: t\nlayout:\n  - blockType: cta\n---\nTesto'),
    ).toThrow(/senza un "- blockType: content"/)
    expect(() =>
      leggiPagina('x.md', '---\ntitle: T\nslug: t\n---\n' + 'A\n<!-- colonna -->\n'.repeat(4)),
    ).toThrow(/più di 3 colonne/)
  })
})

describe('risolvi (convenzioni media:, pagina:, colore:, effetto:, modulo:)', () => {
  it('sostituisce i riferimenti con gli id e converte i campi di testo formattato', () => {
    const dati = risolvi(
      {
        immagine: 'media:foto.jpg',
        link: 'pagina:centri',
        colore: 'colore:Celeste',
        effetti: [{ effetto: 'effetto:Onde' }],
        form: 'modulo:Contatti',
        richText: '# Titolo',
        introContent: 'Testo',
        titolo: 'resta così',
      },
      risolutori,
    )
    expect(dati).toEqual({
      immagine: 'id-media:foto.jpg',
      link: { relationTo: 'pages', value: 'id-pagina:centri' },
      colore: 'id-colore:Celeste',
      effetti: [{ effetto: 'id-effetto:Onde' }],
      form: 'id-modulo:Contatti',
      richText: { md: '# Titolo' },
      introContent: { md: 'Testo' },
      titolo: 'resta così',
    })
  })
})
