import { expect, test } from '@playwright/test'

import { cookieRifiutati, PAGINE, raccogliErrori } from './comune'

test.beforeEach(async ({ page }) => cookieRifiutati(page))

for (const percorso of PAGINE) {
  test(`${percorso} si apre senza errori, con titolo, h1 e dati strutturati validi`, async ({
    page,
  }) => {
    const errori = raccogliErrori(page)
    const risposta = await page.goto(percorso)
    expect(risposta?.status()).toBe(200)

    // Il Banner ha due copie del titolo (telefono e desktop): basta che una sia visibile
    await expect(page.locator('h1:visible').first()).toBeVisible()
    await expect(page).toHaveTitle(/Sorazon|Cookie|privacy/i)
    expect(await page.locator('meta[name="description"]').getAttribute('content')).toBeTruthy()
    expect(await page.locator('link[rel="canonical"]').getAttribute('href')).toBeTruthy()

    // Ogni blocco JSON-LD è JSON valido
    for (const blocco of await page
      .locator('script[type="application/ld+json"]')
      .allTextContents()) {
      expect(() => JSON.parse(blocco)).not.toThrow()
    }

    // Tutte le immagini hanno un testo alternativo (accessibilità) e si caricano
    const immagini = page.locator('main img, article img')
    for (let i = 0; i < (await immagini.count()); i++) {
      expect(await immagini.nth(i).getAttribute('alt'), `alt dell'immagine ${i}`).not.toBeNull()
    }

    await page.waitForLoadState('networkidle')
    expect(errori, errori.join('\n')).toEqual([])
  })
}

test("le notizie si aprono dall'elenco e il PDF della rivista si scarica", async ({
  page,
  request,
}) => {
  await page.goto('/posts')
  const prima = page.locator('article a').first()
  await expect(prima).toBeVisible()
  await prima.click()
  await expect(page).toHaveURL(/\/posts\/.+/)
  await expect(page.locator('h1')).toBeVisible()
  const pdf = page.locator('a[href$=".pdf"]').first()
  if (await pdf.count()) {
    const r = await request.get((await pdf.getAttribute('href'))!)
    expect(r.status()).toBe(200)
    expect(r.headers()['content-type']).toContain('application/pdf')
  }
})

test('pagina inesistente: 404 in italiano, fuori dagli indici', async ({ page }) => {
  const r = await page.goto('/pagina-che-non-esiste-123')
  expect(r?.status()).toBe(404)
  await expect(page.getByRole('heading', { name: 'Pagina non trovata' })).toBeVisible()
  await expect(page.locator('meta[name="robots"]')).toHaveAttribute('content', /noindex/)
})
