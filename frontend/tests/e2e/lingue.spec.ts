import { expect, test } from '@playwright/test'

import { cookieRifiutati, raccogliErrori } from './comune'

// Pagine inglesi pubblicate (indirizzi del vecchio sito, per non perdere il posizionamento)
const PAGINE_EN = ['/en/therapy', '/en/indications', '/en/results', '/en/contact-us']

test.beforeEach(async ({ page }) => cookieRifiutati(page))

for (const percorso of PAGINE_EN) {
  test(`${percorso}: in inglese, con hreflang verso l'italiano`, async ({ page }) => {
    const errori = raccogliErrori(page)
    const risposta = await page.goto(percorso)
    expect(risposta?.status()).toBe(200)
    await expect(page.locator('html')).toHaveAttribute('lang', 'en')
    await expect(page.locator('h1:visible').first()).toBeVisible()
    expect(await page.locator('link[rel="canonical"]').getAttribute('href')).toContain(percorso)
    expect(await page.locator('link[rel="alternate"][hreflang="it"]').count()).toBe(1)
    await page.waitForLoadState('networkidle')
    expect(errori, errori.join('\n')).toEqual([])
  })
}

test('il selettore di lingua porta alla stessa pagina in italiano', async ({ page, isMobile }) => {
  await page.goto('/en/therapy')
  if (isMobile) {
    await page.getByRole('button', { name: /Open the menu/ }).click()
  } else {
    await page.getByRole('button', { name: /Choose the language/ }).click()
  }
  await page.getByRole('link', { name: 'Italiano' }).first().click()
  await expect(page).toHaveURL(/\/terapia$/)
  await expect(page.locator('html')).toHaveAttribute('lang', 'it')
})

test("una pagina non tradotta porta alla versione italiana", async ({ request }) => {
  const r = await request.get('/en/terapia', { maxRedirects: 0 })
  expect([307, 308]).toContain(r.status())
  expect(r.headers()['location']).toMatch(/\/terapia$/)
})

test('la sitemap contiene anche gli indirizzi inglesi', async ({ request }) => {
  const xml = await (await request.get('/pages-sitemap.xml')).text()
  expect(xml).toContain('/en/therapy')
})
