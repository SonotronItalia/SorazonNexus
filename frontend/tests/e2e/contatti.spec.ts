import { expect, test } from '@playwright/test'

import { cookieRifiutati } from './comune'

test.beforeEach(async ({ page }) => cookieRifiutati(page))

test('modulo contatti: errori in italiano e campo trappola invisibile', async ({ page }) => {
  await page.goto('/contatti')
  const invia = page.getByRole('button', { name: 'Invia la richiesta' })
  await invia.scrollIntoViewIfNeeded()
  await invia.click()
  await expect(page.getByText('Campo obbligatorio').first()).toBeVisible()
  expect(await page.getByText('Campo obbligatorio').count()).toBeGreaterThanOrEqual(4)

  // Il campo trappola esiste ma un visitatore non lo vede
  const trappola = page.locator('input[name="_sito"]')
  await expect(trappola).toHaveCount(1)
  await expect(trappola).not.toBeInViewport()

  await page.getByLabel('Email').fill('non-una-email')
  await invia.click()
  await expect(page.getByText('Indirizzo email non valido')).toBeVisible()
})

test("l'API dei moduli rifiuta invii senza campi obbligatori", async ({ request }) => {
  const r = await request.post('/api/form-submissions', {
    data: { form: 1, submissionData: [{ field: 'nome', value: 'Robot' }] },
  })
  expect([400, 429]).toContain(r.status())
})

test('invio completo del modulo', async ({ page }) => {
  test.skip(!process.env.E2E_SCRITTURA, 'scrive nel database: solo con E2E_SCRITTURA=1')
  await page.goto('/contatti')
  await page.getByLabel('Nome e cognome').fill('Test automatico')
  await page.getByLabel('Email').fill('test@esempio.it')
  await page.getByLabel('Messaggio').fill('Invio di prova dei test end-to-end.')
  await page.getByRole('combobox', { name: 'Argomento' }).click()
  await page.getByRole('option', { name: 'Altro' }).click()
  await page.getByRole('checkbox', { name: /informativa sulla privacy/ }).click()
  await page.getByRole('button', { name: 'Invia la richiesta' }).click()
  await expect(page.getByText(/Grazie, abbiamo ricevuto/)).toBeVisible()
})
