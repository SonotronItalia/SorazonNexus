import { expect, test } from '@playwright/test'

test.describe('SEO e motori di risposta AI', () => {
  test('robots.txt, sitemap e llms.txt', async ({ request }) => {
    const robots = await (await request.get('/robots.txt')).text()
    expect(robots).toContain('Sitemap:')
    expect(robots).toContain('Disallow: /api/')
    expect(robots).toMatch(/GPTBot|ClaudeBot/)

    const sitemap = await (await request.get('/pages-sitemap.xml')).text()
    const indirizzi = [...sitemap.matchAll(/<loc>([^<]+)<\/loc>/g)].map(
      (m) => new URL(m[1]).pathname,
    )
    expect(indirizzi.length).toBeGreaterThan(5)
    for (const p of indirizzi) expect((await request.get(p)).status(), p).toBe(200)

    const llms = await request.get('/llms.txt')
    expect(llms.headers()['content-type']).toContain('text/markdown')
    expect(await llms.text()).toMatch(/^# Sorazon/)
  })

  test('immagine di condivisione generata', async ({ request }) => {
    const r = await request.get('/og?titolo=Prova')
    expect(r.status()).toBe(200)
    expect(r.headers()['content-type']).toBe('image/png')
  })

  test('i vecchi indirizzi del sito Joomla portano alle pagine nuove', async ({ request }) => {
    for (const [vecchio, nuovo] of [
      ['/it/notizie', '/posts'],
      ['/it/notizie/122-senzaeta-64', '/posts/senza-eta-64-contro-l-artrosi'],
      ['/pdf/s64.pdf', '/media/senza-eta-64.pdf'],
    ]) {
      const r = await request.get(vecchio, { maxRedirects: 0 })
      expect([301, 307, 308], vecchio).toContain(r.status())
      expect(new URL(r.headers()['location'], 'http://x').pathname).toBe(nuovo)
    }
  })
})

test.describe('sicurezza', () => {
  test('le risposte non rivelano la tecnologia usata', async ({ request }) => {
    const r = await request.get('/')
    expect(r.headers()['x-powered-by']).toBeUndefined()
  })

  test("l'anteprima delle bozze richiede il segreto", async ({ request }) => {
    const r = await request.get('/next/preview?path=/&previewSecret=sbagliato', { maxRedirects: 0 })
    expect(r.status()).toBe(403)
    const fuori = await request.get('/next/preview?path=//spia.example&previewSecret=x', {
      maxRedirects: 0,
    })
    expect(fuori.status()).toBeGreaterThanOrEqual(400)
  })

  test('la revalidazione della cache non si può chiamare da fuori', async ({ request }) => {
    const r = await request.post('/api/revalidate', { data: { tags: ['pages'] } })
    expect([401, 404]).toContain(r.status())
  })

  test('dietro nginx in HTTPS: intestazioni di sicurezza', async ({ request, baseURL }) => {
    test.skip(
      !baseURL?.startsWith('https'),
      'solo dietro nginx in HTTPS (make stack-proxy o produzione)',
    )
    const h = (await request.get('/')).headers()
    expect(h['strict-transport-security']).toContain('max-age=')
    expect(h['x-content-type-options']).toBe('nosniff')
    expect(h['content-security-policy']).toContain('frame-ancestors')
    expect(h['referrer-policy']).toBeTruthy()
    expect((await request.post('/api/revalidate', { data: { tags: ['x'] } })).status()).toBe(404)
  })
})
