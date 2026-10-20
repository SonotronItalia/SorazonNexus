import { expect, test } from '@playwright/test'

import type { Elenco } from './comune'

// Invii diretti all'API dei moduli, come farebbe un programma di spam (nessuno va a buon fine)
test.describe('API dei moduli', () => {
  let form: number | string | undefined
  test.beforeAll(async ({ request }) => {
    const { docs } = (await (await request.get('/api/forms?limit=1')).json()) as Elenco
    form = docs[0]?.id as number | undefined
  })

  const invia = (
    request: import('@playwright/test').APIRequestContext,
    submissionData: object[],
    f = form,
  ) => request.post('/api/form-submissions', { data: { form: f, submissionData } })

  test('rifiuta il campo trappola compilato', async ({ request }) => {
    test.skip(!form, 'nessun modulo nel CMS')
    const r = await invia(request, [
      { field: 'nome', value: 'Bot' },
      { field: 'email', value: 'bot@esempio.it' },
      { field: '_sito', value: 'http://spam.example' },
    ])
    expect([400, 429]).toContain(r.status())
  })

  test('rifiuta campi obbligatori mancanti ed email non valide', async ({ request }) => {
    test.skip(!form, 'nessun modulo nel CMS')
    expect([400, 429]).toContain(
      (await invia(request, [{ field: 'nome', value: 'Solo nome' }])).status(),
    )
    const r = await invia(request, [
      { field: 'nome', value: 'X' },
      { field: 'email', value: 'x@y.it\r\nBcc: vittime@esempio.it' },
      { field: 'messaggio', value: 'x' },
      { field: 'privacy', value: true },
    ])
    expect([400, 429]).toContain(r.status())
  })

  test('rifiuta moduli inesistenti e dati malformati', async ({ request }) => {
    expect([400, 404, 429]).toContain((await invia(request, [], 999999)).status())
    const rotto = await request.fetch('/api/form-submissions', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      data: Buffer.from('{"form": 1, "submissionData": '),
    })
    // 429: dietro nginx scatta il limite di frequenza dei moduli, anch'esso un rifiuto
    expect([400, 429]).toContain(rotto.status())
    // Un valore JSON al posto di un oggetto: Payload risponde 500 prima dei nostri controlli
    // (limite noto, senza conseguenze): conta che non riveli dettagli interni e non accetti nulla
    for (const corpo of ['"ciao"', '123', 'null']) {
      const r = await request.fetch('/api/form-submissions', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        data: Buffer.from(corpo),
      })
      expect(r.status(), corpo).toBeGreaterThanOrEqual(400)
      expect(await r.text(), corpo).not.toMatch(/stack|node_modules|at .*\.js|postgres|drizzle/i)
    }
  })
})
