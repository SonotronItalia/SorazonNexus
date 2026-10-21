import fs from 'node:fs'
import path from 'node:path'
import { describe, expect, it } from 'vitest'

import { ancora, markdownInHtml } from '@/components/admin/Guida/markdown'

describe('Guida del pannello', () => {
  it('titolo a parte, indice dei capitoli e ancore', () => {
    const { titolo, html, indice } = markdownInHtml(
      '# Guida\n\n## Le pagine del sito\n\nTesto.\n\n### Dettaglio\n\n![Una schermata](/guida/x.jpg)',
    )
    expect(titolo).toBe('Guida')
    expect(html).not.toContain('<h1')
    expect(indice).toEqual([{ id: 'le-pagine-del-sito', testo: 'Le pagine del sito' }])
    expect(html).toContain('<h3 id="dettaglio">')
    expect(html).toContain('<figcaption>Una schermata</figcaption>')
    expect(ancora("L'aspetto del sito")).toBe('l-aspetto-del-sito')
  })

  it('ogni immagine citata nei manuali esiste in public/guida', () => {
    for (const file of ['redattori.md', 'amministratori.md']) {
      const testo = fs.readFileSync(path.join(process.cwd(), 'src/guida', file), 'utf8')
      for (const [, img] of testo.matchAll(/\]\(\/guida\/([^)]+)\)/g)) {
        expect(fs.existsSync(path.join(process.cwd(), 'public/guida', img)), `${file}: ${img}`).toBe(true)
      }
    }
  })
})
