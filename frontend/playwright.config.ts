import { defineConfig, devices } from '@playwright/test'

/**
 * Test end-to-end: il sito vero, aperto in Chromium come da un visitatore (desktop e telefono).
 * Si lancia contro un sito già acceso: BASE_URL (predefinito lo stack locale su :3000).
 *   make test-e2e                                   -> http://127.0.0.1:3000
 *   BASE_URL=https://www.sorazon.it make test-e2e   -> il sito online (sola lettura)
 * I test che scrivono dati (invio di un modulo) partono solo con E2E_SCRITTURA=1.
 *
 * Progetto "api": le API REST del CMS chiamate via HTTP (tests/api), su BACKEND_URL
 * (predefinito il backend locale su :3001). Variabili facoltative in tests/api/comune.ts.
 */
export default defineConfig({
  timeout: 60_000,
  expect: { timeout: 10_000 },
  fullyParallel: true,
  retries: process.env.CI ? 1 : 0,
  reporter: [['list'], ['html', { open: 'never', outputFolder: 'playwright-report' }]],
  use: {
    baseURL: process.env.BASE_URL || 'http://127.0.0.1:3000',
    ignoreHTTPSErrors: true,
    locale: 'it-IT',
    timezoneId: 'Europe/Rome',
    trace: 'retain-on-failure',
    screenshot: 'only-on-failure',
  },
  projects: [
    { name: 'desktop', testDir: './tests/e2e', use: { ...devices['Desktop Chrome'] } },
    { name: 'telefono', testDir: './tests/e2e', use: { ...devices['Pixel 7'] } },
    {
      name: 'api',
      testDir: './tests/api',
      use: { baseURL: process.env.BACKEND_URL || 'http://127.0.0.1:3001' },
    },
  ],
})
