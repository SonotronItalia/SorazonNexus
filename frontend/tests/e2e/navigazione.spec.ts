import { expect, test } from '@playwright/test'

import { cookieRifiutati } from './comune'

test.beforeEach(async ({ page }) => cookieRifiutati(page))

test('il menu porta alle pagine (desktop e telefono)', async ({ page, isMobile }) => {
  await page.goto('/')
  if (isMobile) {
    const menu = page.getByRole('button', { name: 'Apri il menu' })
    await expect(menu).toBeVisible()
    await menu.click()
    await expect(page.locator('#menu-mobile')).toBeVisible()
    await page.locator('#menu-mobile').getByRole('link', { name: 'Centri' }).click()
  } else {
    await page.getByRole('banner').getByRole('link', { name: 'Centri' }).first().click()
  }
  await expect(page).toHaveURL(/\/centri$/)
  await expect(page.locator('h1')).toBeVisible()
})

test("i pulsanti dell'header sono visibili anche in tema scuro", async ({ page, isMobile }) => {
  await page.emulateMedia({ colorScheme: 'dark' })
  await page.goto('/terapia')
  const pulsante = isMobile
    ? page.getByRole('button', { name: 'Apri il menu' })
    : page.getByRole('banner').getByRole('link', { name: 'Terapia' }).first()
  await expect(pulsante).toBeVisible()
  // Colore del pulsante diverso dallo sfondo della pagina (niente "nero su nero")
  const [colore, sfondo] = await Promise.all([
    pulsante.evaluate((e) => getComputedStyle(e).color),
    page.evaluate(() => getComputedStyle(document.body).backgroundColor),
  ])
  expect(colore).not.toBe(sfondo)
})

test('il pulsante "torna su" compare scorrendo e riporta in cima', async ({ page }) => {
  await page.goto('/terapia')
  // In cima il pulsante è nascosto anche agli screen reader (aria-hidden): si cerca per attributo
  const torna = page.locator('button[aria-label="Torna in cima alla pagina"]')
  if (!(await torna.count())) test.skip(true, "pulsante spento nell'admin")
  await expect(torna).toHaveAttribute('aria-hidden', 'true')
  await page.mouse.wheel(0, 4000)
  await expect(torna).toBeVisible()
  await expect(torna).toHaveCSS('opacity', '1')
  await torna.click()
  await expect.poll(() => page.evaluate(() => window.scrollY)).toBe(0)
})
