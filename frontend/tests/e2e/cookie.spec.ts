import { expect, test } from '@playwright/test'

test('banner dei cookie: nessun tracciamento prima della scelta, la scelta resta', async ({
  page,
}) => {
  const google: string[] = []
  page.on('request', (r) => {
    if (/googletagmanager|google-analytics|doubleclick/.test(r.url())) google.push(r.url())
  })

  await page.goto('/')
  await expect(page.getByRole('button', { name: 'Rifiuta', exact: true })).toBeVisible()
  await page.getByRole('button', { name: 'Rifiuta', exact: true }).click()
  await expect(page.getByRole('button', { name: 'Rifiuta', exact: true })).toBeHidden()

  await page.reload()
  await expect(page.getByRole('button', { name: 'Rifiuta', exact: true })).toBeHidden()
  await page.waitForLoadState('networkidle')
  expect(google, 'richieste a Google senza consenso').toEqual([])
})

test('la mappa di Google non si carica senza consenso', async ({ page }) => {
  await page.goto('/contatti')
  await page.getByRole('button', { name: 'Rifiuta', exact: true }).click()
  await expect(page.locator('iframe[src*="google.com/maps"]')).toHaveCount(0)
  await expect(page.getByRole('button', { name: 'Mostra la mappa' })).toBeVisible()
})
