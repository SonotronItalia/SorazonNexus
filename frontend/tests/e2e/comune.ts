import type { Page } from '@playwright/test'

// Pagine pubbliche del sito (quelle del menu più le pagine legali)
export const PAGINE = [
  '/',
  '/dispositivo',
  '/terapia',
  '/indicazioni',
  '/risultati',
  '/centri',
  '/posts',
  '/distribuzione',
  '/contatti',
  '/privacy-policy',
  '/cookie-policy',
]

// Scelta sui cookie già fatta (tutto rifiutato): il banner non copre la pagina
export async function cookieRifiutati(page: Page) {
  await page.addInitScript(() => {
    localStorage.setItem(
      'sorazon-consenso',
      JSON.stringify({
        statistiche: false,
        marketing: false,
        esterni: false,
        versione: 1,
        data: new Date().toISOString(),
      }),
    )
  })
}

// Errori in console e richieste fallite durante la visita (immagini rotte, script mancanti)
export function raccogliErrori(page: Page) {
  const errori: string[] = []
  page.on('pageerror', (e) => errori.push(`errore JS: ${e.message}`))
  page.on('console', (m) => {
    if (m.type() === 'error') errori.push(`console: ${m.text()}`)
  })
  page.on('response', (r) => {
    const url = new URL(r.url())
    if (r.status() >= 400 && url.origin === new URL(page.url() || r.url()).origin) {
      errori.push(`${r.status()} ${url.pathname}`)
    }
  })
  return errori
}
