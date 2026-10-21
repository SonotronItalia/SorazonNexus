import { expect, test } from '@playwright/test'

// Marchio (Impostazioni del sito > Marchio): icone ricavate, manifest, loghi serviti in sicurezza
test('il logo si vede in alto e nel piè di pagina', async ({ page }) => {
  await page.goto('/')
  // Su Safari un logo con aspect-ratio e max-width finiva largo 0 (invisibile)
  for (const logo of [
    page.locator('header [role="img"]:visible').first(),
    page.locator('footer [role="img"]'),
  ]) {
    const box = await logo.boundingBox()
    expect(box?.width ?? 0).toBeGreaterThan(40)
    expect(box?.height ?? 0).toBeGreaterThan(20)
  }
})

test('icone del sito, icona Apple, favicon.ico e manifest', async ({ page, request }) => {
  await page.goto('/')
  const png = await page.locator('link[rel="icon"][type="image/png"]').first().getAttribute('href')
  const apple = await page.locator('link[rel="apple-touch-icon"]').getAttribute('href')
  for (const indirizzo of [png, apple, '/icone/512.png', '/favicon.ico']) {
    const r = await request.get(indirizzo!)
    expect(r.status(), indirizzo!).toBe(200)
    expect(r.headers()['content-type']).toContain('image/png')
  }
  const manifest = await (await request.get('/manifest.webmanifest')).json()
  expect(manifest.icons.map((i: { sizes: string }) => i.sizes)).toEqual(['192x192', '512x512'])
})

test('i loghi caricati come SVG non possono eseguire codice', async ({ page, request }) => {
  await page.goto('/')
  const stile = (await page.locator('header [role="img"]').first().getAttribute('style')) ?? ''
  const file = /url\("?(\/marchio\/[^")]+)/.exec(stile)?.[1]
  test.skip(!file, 'nessun logo caricato nel pannello: il sito usa quello predefinito')
  const r = await request.get(file!.replaceAll('&amp;', '&'))
  expect(r.status()).toBe(200)
  expect(r.headers()['content-security-policy']).toContain('sandbox')
  expect(r.headers()['x-content-type-options']).toBe('nosniff')
})
