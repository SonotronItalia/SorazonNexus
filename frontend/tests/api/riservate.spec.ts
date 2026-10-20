import { expect, test } from '@playwright/test'

import { ALTRO_SITO } from './comune'

// Tutto quello che modifica dati o legge dati personali: senza login va rifiutato
test.describe('API riservate (senza login)', () => {
  test('utenti, invii dei moduli e preferenze non si leggono', async ({ request }) => {
    for (const percorso of [
      '/api/users',
      '/api/users/1',
      '/api/form-submissions',
      '/api/payload-preferences',
    ]) {
      const r = await request.get(percorso)
      // 429: dietro nginx /api/form-submissions ha un limite di frequenza
      expect([401, 403, 429], percorso).toContain(r.status())
    }
  })

  test('/api/users/me senza login non restituisce nessun utente', async ({ request }) => {
    const r = await request.get('/api/users/me')
    expect(r.status()).toBe(200)
    expect(((await r.json()) as { user: unknown }).user).toBeNull()
  })

  test('niente creazioni, modifiche o cancellazioni', async ({ request }) => {
    const prove: [string, string, object?][] = [
      ['post', '/api/pages', { title: 'Intrusa', slug: 'intrusa' }],
      ['post', '/api/posts', { title: 'Intrusa', slug: 'intrusa' }],
      ['post', '/api/centri', { citta: 'X', regione: 'Y' }],
      ['post', '/api/users', { email: 'intruso@esempio.invalid', password: 'Password123!' }],
      ['patch', '/api/centri/1', { citta: 'Modificata' }],
      ['delete', '/api/centri/1'],
      ['delete', '/api/pages/1'],
      ['post', '/api/globals/header', { navItems: [] }],
      ['post', '/api/globals/torna-su', { attivo: false }],
    ]
    for (const [metodo, percorso, dati] of prove) {
      const r = await request.fetch(percorso, { method: metodo.toUpperCase(), data: dati })
      expect([401, 403, 405], `${metodo} ${percorso}`).toContain(r.status())
    }
  })

  test('i file non si caricano senza login', async ({ request }) => {
    const r = await request.post('/api/media', {
      multipart: {
        _payload: JSON.stringify({ alt: 'intruso' }),
        file: { name: 'x.png', mimeType: 'image/png', buffer: Buffer.from('89504e47', 'hex') },
      },
    })
    expect([401, 403]).toContain(r.status())
  })

  test('un altro sito non è autorizzato dal CORS', async ({ request }) => {
    const r = await request.get('/api/pages?limit=1', { headers: { Origin: ALTRO_SITO } })
    expect(r.headers()['access-control-allow-origin']).not.toBe(ALTRO_SITO)
    expect(r.headers()['access-control-allow-origin']).not.toBe('*')
  })

  test('GraphQL è spento', async ({ request }) => {
    const r = await request.post('/api/graphql', {
      data: { query: '{ __schema { types { name } } }' },
    })
    expect(r.status()).toBeGreaterThanOrEqual(400)
    expect(await r.text()).not.toContain('__schema')
  })

  test("le bozze per l'anteprima richiedono il segreto interno", async ({ request }) => {
    for (const headers of [
      {},
      { 'x-internal-secret': 'sbagliato' },
      { 'x-internal-secret': '' },
    ] as Record<string, string>[]) {
      const r = await request.get('/api/pages/anteprima/home', { headers })
      // 401 dal CMS, 404 se nginx blocca la rotta prima
      expect([401, 404], JSON.stringify(headers)).toContain(r.status())
    }
  })

  test("con il segreto giusto l'anteprima restituisce la bozza", async ({ request }) => {
    test.skip(
      !process.env.REVALIDATE_SECRET,
      'serve REVALIDATE_SECRET (solo sulla rete interna o in locale)',
    )
    const r = await request.get('/api/pages/anteprima/home', {
      headers: { 'x-internal-secret': process.env.REVALIDATE_SECRET! },
    })
    expect(r.status()).toBe(200)
    expect(((await r.json()) as { slug: string }).slug).toBe('home')
  })
})
