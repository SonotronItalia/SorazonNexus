import { expect, test } from '@playwright/test'

import { ALTRO_SITO, CON_UTENTE, EMAIL_INESISTENTE, UTENTE } from './comune'

test.describe("login dell'admin", () => {
  test('credenziali sbagliate: 401 e stesso messaggio per email esistenti e inesistenti', async ({
    request,
  }) => {
    const r = await request.post('/api/users/login', {
      data: { email: EMAIL_INESISTENTE, password: 'sbagliata' },
    })
    expect([401, 429]).toContain(r.status())
    if (r.status() === 401) {
      // Non deve dire se l'email esiste (niente elenco degli utenti indovinando)
      expect(await r.text()).not.toMatch(/not found|non esiste|unknown user/i)
    }
  })

  test('dietro nginx: troppi tentativi di fila vengono fermati (429)', async ({
    request,
    baseURL,
  }) => {
    test.skip(
      !baseURL?.startsWith('https'),
      'limite di nginx: solo in HTTPS (make stack-proxy o produzione)',
    )
    const stati: number[] = []
    for (let i = 0; i < 12; i++) {
      const r = await request.post('/api/users/login', {
        data: { email: EMAIL_INESISTENTE, password: 'x' },
      })
      stati.push(r.status())
    }
    expect(stati, stati.join(' ')).toContain(429)
  })

  // In sequenza: usano lo stesso utente e l'ultimo lo blocca
  test.describe('con un utente di prova', () => {
    test.describe.configure({ mode: 'serial' })
    test.skip(!CON_UTENTE, 'servono E2E_EMAIL ed E2E_PASSWORD di un utente di prova')

    test('cookie di sessione protetto e accesso alle API riservate', async ({
      playwright,
      baseURL,
    }) => {
      const ctx = await playwright.request.newContext({ baseURL, ignoreHTTPSErrors: true })
      const r = await ctx.post('/api/users/login', { data: UTENTE })
      expect(r.status()).toBe(200)
      const cookie = r.headers()['set-cookie'] ?? ''
      expect(cookie).toMatch(/HttpOnly/i)
      expect(cookie).toMatch(/SameSite=Lax/i)
      if (baseURL?.startsWith('https')) expect(cookie).toMatch(/Secure/i)
      // Protezione CSRF: il cookie vale solo se la richiesta dichiara di venire dal sito o dal CMS
      const origine = { Origin: new URL(baseURL!).origin }
      expect((await ctx.get('/api/users', { headers: origine })).status()).toBe(200)
      expect((await ctx.get('/api/users')).status(), 'cookie senza Origin').toBe(403)
      await ctx.post('/api/users/logout', { headers: origine })
      expect((await ctx.get('/api/users', { headers: origine })).status()).toBe(403)
      await ctx.dispose()
    })

    test('CSRF: con il cookie ma da un altro sito non si è autenticati', async ({
      playwright,
      baseURL,
    }) => {
      const ctx = await playwright.request.newContext({ baseURL, ignoreHTTPSErrors: true })
      expect((await ctx.post('/api/users/login', { data: UTENTE })).status()).toBe(200)
      const r = await ctx.get('/api/users/me', { headers: { Origin: ALTRO_SITO } })
      expect(((await r.json()) as { user: unknown }).user).toBeNull()
      await ctx.dispose()
    })

    test("dopo 5 password sbagliate l'account si blocca", async ({ playwright, baseURL }) => {
      test.skip(
        !process.env.E2E_BLOCCO,
        "blocca l'utente di prova per 15 minuti: solo con E2E_BLOCCO=1",
      )
      const ctx = await playwright.request.newContext({ baseURL, ignoreHTTPSErrors: true })
      for (let i = 0; i < 5; i++) {
        await ctx.post('/api/users/login', { data: { email: UTENTE.email, password: 'sbagliata' } })
      }
      // Ora anche la password giusta viene rifiutata
      const r = await ctx.post('/api/users/login', { data: UTENTE })
      expect([401, 423, 429]).toContain(r.status())
      await ctx.dispose()
    })
  })
})
