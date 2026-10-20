import { describe, expect, it } from 'vitest'

import { mediaSrc } from '@/lib/api'
import { stileTesto } from '@/utilities/stileTesto'
import { idYouTube } from '@/utilities/youtube'

describe('stileTesto (stili del testo arrivati dal CMS)', () => {
  it('accetta solo colori della tavolozza, dimensioni previste e il sottotitolo', () => {
    expect(
      stileTesto(
        'color: var(--colore-3, #0095AC); font-size: var(--testo-grande, 1.25rem); font-weight: 500',
      ),
    ).toEqual({
      color: 'var(--colore-3, #0095AC)',
      fontSize: 'var(--testo-grande, 1.25rem)',
      fontWeight: '500',
    })
  })

  it('scarta tutto il resto, anche i tentativi di iniezione CSS', () => {
    for (const cattivo of [
      'color: red',
      'background: url(https://spia.example/x.png)',
      'color: var(--colore-1, #000000); position: fixed',
      'color: var(--colore-1, #000000) ; } body { display:none',
      'font-size: 999px',
      'font-size: var(--testo-grande, 1rem); width: expression(alert(1))',
      'font-weight: 900',
    ]) {
      const risultato = stileTesto(cattivo) ?? {}
      expect(
        Object.keys(risultato).every((k) => ['color', 'fontSize'].includes(k)),
        cattivo,
      ).toBe(true)
      expect(JSON.stringify(risultato)).not.toMatch(/url|fixed|display|999|expression|900|red/)
    }
    expect(stileTesto('')).toBeUndefined()
    expect(stileTesto(null)).toBeUndefined()
  })
})

describe('idYouTube (video negli hero)', () => {
  it('riconosce i formati di link di YouTube', () => {
    for (const link of [
      'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
      'https://youtube.com/watch?t=10&v=dQw4w9WgXcQ',
      'https://youtu.be/dQw4w9WgXcQ',
      'https://www.youtube-nocookie.com/embed/dQw4w9WgXcQ',
      'https://www.youtube.com/shorts/dQw4w9WgXcQ',
      ' dQw4w9WgXcQ ',
    ]) {
      expect(idYouTube(link), link).toBe('dQw4w9WgXcQ')
    }
  })

  it('rifiuta link di altri siti e testi che non sono un ID', () => {
    for (const link of ['https://vimeo.com/123456', 'javascript:alert(1)', 'abc', '"><script>']) {
      expect(idYouTube(link), link).toBeNull()
    }
  })
})

describe('mediaSrc (immagini servite dal sito)', () => {
  it('porta gli URL dei media del CMS sotto /media del sito', () => {
    expect(mediaSrc('/api/media/file/foto.webp?2026')).toBe('/media/foto.webp?2026')
    expect(mediaSrc('https://cms.sorazon.it/api/media/file/doc.pdf')).toBe('/media/doc.pdf')
    expect(mediaSrc(null)).toBe('')
  })

  it('non produce mai un indirizzo di un altro sito', () => {
    expect(mediaSrc('https://spia.example/api/media/file/x.png')).toBe('/media/x.png')
    expect(mediaSrc('//spia.example/x.png').startsWith('/')).toBe(true)
    expect(mediaSrc('//spia.example/x.png').startsWith('//')).toBe(false)
  })
})
