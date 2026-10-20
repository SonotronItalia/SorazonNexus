import { expect, test } from '@playwright/test'

import type { Elenco } from './comune'

// Quello che il sito legge senza login: deve rispondere, e solo con contenuti pubblicati
test.describe('API pubbliche', () => {
  for (const globale of ['header', 'footer', 'torna-su']) {
    test(`globale ${globale}: leggibile senza login`, async ({ request }) => {
      const r = await request.get(`/api/globals/${globale}`)
      expect(r.status()).toBe(200)
      expect(r.headers()['content-type']).toContain('application/json')
    })
  }

  for (const collezione of ['centri', 'colori', 'effetti', 'categories', 'media', 'redirects']) {
    test(`collezione ${collezione}: leggibile senza login`, async ({ request }) => {
      const r = await request.get(`/api/${collezione}?limit=1`)
      expect(r.status()).toBe(200)
      expect(((await r.json()) as Elenco).docs).toBeDefined()
    })
  }

  test('i centri hanno i dati che servono al sito', async ({ request }) => {
    const { docs, totalDocs } = (await (
      await request.get('/api/centri?pagination=false')
    ).json()) as Elenco
    expect(totalDocs).toBeGreaterThan(0)
    for (const c of docs) {
      expect(c.citta, JSON.stringify(c)).toBeTruthy()
      expect(c.regione, JSON.stringify(c)).toBeTruthy()
    }
  })

  for (const collezione of ['pages', 'posts']) {
    test(`${collezione}: un anonimo vede solo i pubblicati, anche chiedendo le bozze`, async ({
      request,
    }) => {
      for (const q of [
        '?limit=100',
        '?limit=100&draft=true',
        '?limit=100&where[_status][equals]=draft',
      ]) {
        const r = await request.get(`/api/${collezione}${q}`)
        expect(r.status(), q).toBe(200)
        const { docs } = (await r.json()) as Elenco
        for (const d of docs) expect(d._status, `${q} -> ${d.slug}`).toBe('published')
      }
    })
  }

  test('le versioni (cronologia delle modifiche) non sono pubbliche', async ({ request }) => {
    for (const collezione of ['pages', 'posts']) {
      const r = await request.get(`/api/${collezione}/versions?limit=1`)
      expect([401, 403], collezione).toContain(r.status())
    }
  })

  test('i moduli non espongono i destinatari delle email', async ({ request }) => {
    const { docs } = (await (await request.get('/api/forms?limit=50')).json()) as Elenco
    for (const f of docs) {
      const email = JSON.stringify(f.emails ?? [])
      expect(email, String(f.title)).not.toMatch(/@/)
    }
  })

  test('un documento inesistente: 404 senza dettagli interni', async ({ request }) => {
    const r = await request.get('/api/pages/999999999')
    expect(r.status()).toBe(404)
    const testo = await r.text()
    expect(testo).not.toMatch(/stack|node_modules|at .*\.js|postgres|drizzle/i)
  })
})
