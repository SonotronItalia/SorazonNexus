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
  // Consent Mode v2: modalità base -> nessuna richiesta a Google; modalità avanzata (scelta
  // nell'admin) -> Google può caricarsi, ma con tutti i consensi negati
  if (google.length) {
    const consensi = await page.evaluate(() =>
      ((window as unknown as { dataLayer?: unknown[][] }).dataLayer ?? [])
        .filter((e) => e?.[0] === 'consent')
        .map((e) => e[2] as Record<string, string>),
    )
    expect(consensi.length, 'Google caricato senza Consent Mode').toBeGreaterThan(0)
    for (const c of consensi) {
      expect(c.analytics_storage).toBe('denied')
      expect(c.ad_storage).toBe('denied')
    }
  }
})

test('la mappa di Google non si carica senza consenso', async ({ page }) => {
  await page.goto('/contatti')
  await page.getByRole('button', { name: 'Rifiuta', exact: true }).click()
  await expect(page.locator('iframe[src*="google.com/maps"]')).toHaveCount(0)
  await expect(page.getByRole('button', { name: 'Mostra la mappa' })).toBeVisible()
})
