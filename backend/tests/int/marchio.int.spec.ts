import { getPayload, type Payload } from 'payload'
import { afterAll, beforeAll, describe, expect, it } from 'vitest'

import config from '@/payload.config'

// File del marchio (loghi e icona): l'unica raccolta che accetta SVG, solo se innocui.
// Database di PROVA (vitest.setup.ts); i file caricati qui vengono cancellati alla fine.
let payload: Payload
const caricati: number[] = []
const suffisso = Date.now()

const svg = (corpo: string) =>
  Buffer.from(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 10 10">${corpo}</svg>`)

const carica = (dati: Buffer, name: string, mimetype: string, extra: object = {}) =>
  payload.create({
    collection: 'marchio',
    data: { alt: 'prova' },
    file: { data: dati, mimetype, name, size: dati.length },
    ...extra,
  })

beforeAll(async () => {
  payload = await getPayload({ config: await config })
})

afterAll(async () => {
  for (const id of caricati) await payload.delete({ collection: 'marchio', id }).catch(() => {})
})

describe('file del marchio', () => {
  it('accetta un SVG pulito e ne legge le proporzioni', async () => {
    const doc = await carica(
      svg('<rect width="10" height="5" fill="#00a3b7"/>'),
      `logo-${suffisso}.svg`,
      'image/svg+xml',
    )
    caricati.push(doc.id)
    expect(doc.mimeType).toBe('image/svg+xml')
    expect(doc.width).toBeGreaterThan(0)
  })

  it('accetta un SVG con immagini incorporate (data:)', async () => {
    const doc = await carica(
      svg('<image href="data:image/png;base64,iVBORw0KGgo=" width="10" height="10"/>'),
      `incorporata-${suffisso}.svg`,
      'image/svg+xml',
    )
    caricati.push(doc.id)
  })

  it('rifiuta SVG con script, gestori di eventi o collegamenti esterni', async () => {
    for (const [nome, corpo] of [
      ['script', '<script>alert(1)</script>'],
      ['evento', '<rect width="1" height="1" onclick="alert(1)"/>'],
      ['javascript', '<a href="javascript:alert(1)"><rect width="1" height="1"/></a>'],
      ['esterno', '<image href="https://esempio.invalid/traccia.png" width="1" height="1"/>'],
      ['stile-esterno', '<rect width="1" height="1" style="fill:url(https://esempio.invalid/x)"/>'],
    ]) {
      await expect(
        carica(svg(corpo), `${nome}-${suffisso}.svg`, 'image/svg+xml'),
        nome,
      ).rejects.toThrow()
    }
  })

  it('rifiuta HTML e altri formati', async () => {
    await expect(
      carica(
        Buffer.from('<html><script>alert(1)</script></html>'),
        `x-${suffisso}.html`,
        'text/html',
      ),
    ).rejects.toThrow()
  })

  it('un visitatore anonimo non carica file del marchio', async () => {
    await expect(
      carica(svg('<rect width="1" height="1"/>'), `anonimo-${suffisso}.svg`, 'image/svg+xml', {
        overrideAccess: false,
      }),
    ).rejects.toThrow()
  })

  it('i file sono leggibili da tutti (il sito li mostra senza login)', async () => {
    const { docs } = await payload.find({ collection: 'marchio', limit: 1, overrideAccess: false })
    expect(Array.isArray(docs)).toBe(true)
  })
})
