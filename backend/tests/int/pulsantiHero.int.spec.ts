import { getPayload, type Payload } from 'payload'
import { afterAll, beforeAll, describe, expect, it } from 'vitest'

import config from '@/payload.config'

// Pulsanti dell'hero nelle due lingue: con il collegamento misto (pagine o notizie) Payload 3.91
// a ogni salvataggio in una lingua cancellava o scambiava quelli dell'altra (fields/link.ts).
// Database di PROVA (vitest.setup.ts); le pagine create qui vengono cancellate alla fine.
let payload: Payload
const create: number[] = []
const suffisso = Date.now()
const contesto = { disableRevalidate: true }
// Le pagine richiedono almeno un blocco, in ogni lingua
const layout = [{ blockType: 'content' as const, columns: [{ size: 'full' as const }] }]

const pagina = async (slug: string) => {
  const p = await payload.create({
    collection: 'pages',
    data: { title: slug, slug, layout, hero: { type: 'lowImpact' }, _status: 'published' },
    context: contesto,
  })
  create.push(p.id)
  return p.id
}

beforeAll(async () => {
  payload = await getPayload({ config: await config })
})

afterAll(async () => {
  for (const id of create.reverse())
    await payload.delete({ collection: 'pages', id, trash: false, context: contesto }).catch(() => {})
})

describe("pulsanti dell'hero", () => {
  it('restano collegati in tutte e due le lingue dopo salvataggi alternati', async () => {
    const a = await pagina(`prova-a-${suffisso}`)
    const b = await pagina(`prova-b-${suffisso}`)
    const pulsanti = (etichette: string[]) =>
      etichette.map((label, i) => ({
        link: { type: 'reference' as const, label, reference: [a, b][i] },
      }))
    const home = await pagina(`prova-home-${suffisso}`)

    // Anche la forma dei collegamenti misti, come la scrive il seed
    await payload.update({
      collection: 'pages',
      id: home,
      locale: 'it',
      data: {
        hero: {
          type: 'lowImpact',
          links: [
            { link: { type: 'reference', label: 'Uno', reference: { relationTo: 'pages', value: a } as never } },
            { link: { type: 'reference', label: 'Due', reference: b } },
          ],
        },
      },
      context: contesto,
    })
    await payload.update({
      collection: 'pages',
      id: home,
      locale: 'en',
      data: { title: 'home en', slug: `prova-home-en-${suffisso}`, layout, hero: { type: 'lowImpact', links: pulsanti(['One', 'Two']) } },
      context: contesto,
    })
    await payload.update({
      collection: 'pages',
      id: home,
      locale: 'it',
      data: { hero: { type: 'lowImpact', links: pulsanti(['Uno', 'Due']) } },
      context: contesto,
    })

    for (const locale of ['it', 'en'] as const) {
      const doc = await payload.findByID({ collection: 'pages', id: home, locale, depth: 0 })
      expect(doc.hero.links?.map((l) => l.link.reference)).toEqual([a, b])
    }
  })
})
