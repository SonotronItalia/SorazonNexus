import { getPayload, type Payload } from 'payload'
import { afterAll, beforeAll, describe, expect, it } from 'vitest'

import config from '@/payload.config'
import type { User } from '@/payload-types'

// Ruoli su Payload vero (database di PROVA): cosa può fare un redattore e cosa no
let payload: Payload
let amministratore: User
let redattore: User
const suffisso = Date.now()

beforeAll(async () => {
  payload = await getPayload({ config: await config })
  amministratore = await payload.create({
    collection: 'users',
    data: {
      email: `admin-${suffisso}@esempio.invalid`,
      password: 'Prova-0123456789',
      ruolo: 'amministratore',
    },
  })
  redattore = await payload.create({
    collection: 'users',
    data: {
      email: `redattore-${suffisso}@esempio.invalid`,
      password: 'Prova-0123456789',
      ruolo: 'redattore',
    },
  })
})

afterAll(async () => {
  for (const u of [amministratore, redattore]) {
    if (u) await payload.delete({ collection: 'users', id: u.id }).catch(() => {})
  }
})

const come = (user: User) => ({ user, overrideAccess: false }) as const

describe('Impostazioni del sito', () => {
  it('un redattore cambia il nome del sito ma non gli ID di Google', async () => {
    await payload.updateGlobal({
      slug: 'impostazioni',
      data: { nomeSito: 'Sorazon', analisi: { googleAnalyticsId: 'G-PRIMA12345' } },
      ...come(amministratore),
    })
    await payload.updateGlobal({
      slug: 'impostazioni',
      data: {
        nomeSito: `Nome del redattore ${suffisso}`,
        analisi: { googleAnalyticsId: 'G-REDATTORE1' },
      },
      ...come(redattore),
    })
    const dopo = await payload.findGlobal({ slug: 'impostazioni' })
    expect(dopo.nomeSito).toBe(`Nome del redattore ${suffisso}`)
    expect(dopo.analisi?.googleAnalyticsId).toBe('G-PRIMA12345')
  })

  it('un amministratore cambia gli ID; un ID nel formato sbagliato è rifiutato', async () => {
    await payload.updateGlobal({
      slug: 'impostazioni',
      data: { analisi: { googleTagManagerId: 'gtm-abc1234' } },
      ...come(amministratore),
    })
    expect((await payload.findGlobal({ slug: 'impostazioni' })).analisi?.googleTagManagerId).toBe(
      'GTM-ABC1234',
    )
    await expect(
      payload.updateGlobal({
        slug: 'impostazioni',
        data: { analisi: { googleTagManagerId: '<script>' } },
        ...come(amministratore),
      }),
    ).rejects.toThrow()
    await payload.updateGlobal({
      slug: 'impostazioni',
      data: { nomeSito: 'Sorazon', analisi: { googleTagManagerId: '', googleAnalyticsId: '' } },
      ...come(amministratore),
    })
  })
})

describe('utenti e voci avanzate', () => {
  it('un redattore vede solo il proprio account e non si promuove', async () => {
    const { docs } = await payload.find({ collection: 'users', ...come(redattore) })
    expect(docs.map((d) => d.id)).toEqual([redattore.id])
    await payload.update({
      collection: 'users',
      id: redattore.id,
      data: { ruolo: 'amministratore' },
      ...come(redattore),
    })
    expect((await payload.findByID({ collection: 'users', id: redattore.id })).ruolo).toBe(
      'redattore',
    )
  })

  it('un redattore non crea utenti né reindirizzamenti; un amministratore sì', async () => {
    await expect(
      payload.create({
        collection: 'users',
        data: {
          email: `x-${suffisso}@esempio.invalid`,
          password: 'Prova-0123456789',
        } as unknown as User, // senza ruolo, di proposito
        ...come(redattore),
      }),
    ).rejects.toThrow()
    const dati = { from: `/vecchio-${suffisso}`, to: { type: 'custom' as const, url: '/' } }
    await expect(
      payload.create({
        collection: 'redirects',
        data: dati,
        ...come(redattore),
        context: { disableRevalidate: true },
      }),
    ).rejects.toThrow()
    const r = await payload.create({
      collection: 'redirects',
      data: dati,
      ...come(amministratore),
      context: { disableRevalidate: true },
    })
    await payload.delete({
      collection: 'redirects',
      id: r.id,
      context: { disableRevalidate: true },
    })
  })

  it('un nuovo utente senza ruolo nasce redattore', async () => {
    const u = await payload.create({
      collection: 'users',
      data: {
        email: `nuovo-${suffisso}@esempio.invalid`,
        password: 'Prova-0123456789',
      } as unknown as User, // senza ruolo, di proposito
      ...come(amministratore),
    })
    expect(u.ruolo).toBe('redattore')
    await payload.delete({ collection: 'users', id: u.id })
  })
})
