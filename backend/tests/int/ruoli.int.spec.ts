import { getPayload, type Payload } from 'payload'
import { afterAll, beforeAll, describe, expect, it } from 'vitest'

import config from '@/payload.config'
import type { Ruoli, User } from '@/payload-types'

// Ruoli e permessi su Payload vero (database di PROVA): i ruoli Amministratore e Redattore li
// crea la migrazione "ruoli_personalizzati"; qui se ne aggiunge uno personalizzato
let payload: Payload
let amministratore: User
let redattore: User
let soloNotizie: User
let ruoloNotizie: Ruoli
const suffisso = Date.now()

const ruolo = async (nome: string) => {
  const { docs } = await payload.find({ collection: 'ruoli', where: { nome: { equals: nome } } })
  if (!docs[0]) throw new Error(`manca il ruolo "${nome}": applica le migrazioni`)
  return docs[0]
}

// L'utente come arriva nelle richieste: con il ruolo caricato (auth.depth = 1)
const carica = (id: number) => payload.findByID({ collection: 'users', id, depth: 1 })

const nuovoUtente = async (nome: string, profilo: number) => {
  const u = await payload.create({
    collection: 'users',
    data: { email: `${nome}-${suffisso}@esempio.invalid`, password: 'Prova-0123456789', profilo },
  })
  return carica(u.id)
}

beforeAll(async () => {
  payload = await getPayload({ config: await config })
  ruoloNotizie = await payload.create({
    collection: 'ruoli',
    data: {
      nome: `Solo notizie ${suffisso}`,
      permessi: { posts: { vede: true, crea: true, modifica: true } },
    },
  })
  amministratore = await nuovoUtente('admin', (await ruolo('Amministratore')).id)
  redattore = await nuovoUtente('redattore', (await ruolo('Redattore')).id)
  soloNotizie = await nuovoUtente('notizie', ruoloNotizie.id)
})

afterAll(async () => {
  for (const u of [amministratore, redattore, soloNotizie]) {
    if (u) await payload.delete({ collection: 'users', id: u.id }).catch(() => {})
  }
  if (ruoloNotizie) await payload.delete({ collection: 'ruoli', id: ruoloNotizie.id }).catch(() => {})
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
      data: { profilo: (await ruolo('Amministratore')).id },
      ...come(redattore),
    })
    const dopo = await payload.findByID({ collection: 'users', id: redattore.id, depth: 1 })
    expect((dopo.profilo as Ruoli).nome).toBe('Redattore')
  })

  it('un redattore non crea utenti né reindirizzamenti; un amministratore sì', async () => {
    await expect(
      payload.create({
        collection: 'users',
        data: {
          email: `x-${suffisso}@esempio.invalid`,
          password: 'Prova-0123456789',
          profilo: (await ruolo('Redattore')).id,
        },
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

  it('un nuovo utente deve avere un ruolo', async () => {
    await expect(
      payload.create({
        collection: 'users',
        data: {
          email: `nuovo-${suffisso}@esempio.invalid`,
          password: 'Prova-0123456789',
        } as unknown as User, // senza ruolo, di proposito
        ...come(amministratore),
      }),
    ).rejects.toThrow()
  })
})

describe('ruoli personalizzati', () => {
  it('il ruolo "Solo notizie" crea notizie ma non pagine', async () => {
    const notizia = await payload.create({
      collection: 'posts',
      data: { title: `Prova ruolo ${suffisso}`, _status: 'draft' },
      draft: true,
      ...come(soloNotizie),
      context: { disableRevalidate: true },
    })
    await expect(
      payload.create({
        collection: 'pages',
        data: { title: `Prova ruolo ${suffisso}`, _status: 'draft' },
        draft: true,
        ...come(soloNotizie),
        context: { disableRevalidate: true },
      }),
    ).rejects.toThrow()
    // "Elimina" non spuntato
    await expect(
      payload.delete({
        collection: 'posts',
        id: notizia.id,
        ...come(soloNotizie),
        context: { disableRevalidate: true },
      }),
    ).rejects.toThrow()
    await payload.delete({ collection: 'posts', id: notizia.id, context: { disableRevalidate: true } })
  })

  it('un ruolo assegnato non si elimina', async () => {
    await expect(payload.delete({ collection: 'ruoli', id: ruoloNotizie.id })).rejects.toThrow(
      /assegnato/,
    )
  })

  it("non si toglie l'accesso completo all'ultimo che ce l'ha né al proprio ruolo", async () => {
    const admin = await ruolo('Amministratore')
    await expect(
      payload.update({
        collection: 'ruoli',
        id: admin.id,
        data: { completo: false },
        ...come(amministratore),
      }),
    ).rejects.toThrow(/tuo stesso ruolo/)
    // Con un solo amministratore (questo test) declassarlo è rifiutato; con altri è permesso
    const { totalDocs } = await payload.count({
      collection: 'users',
      where: { 'profilo.completo': { equals: true } },
    })
    if (totalDocs === 1) {
      await expect(
        payload.update({
          collection: 'users',
          id: amministratore.id,
          data: { profilo: (await ruolo('Redattore')).id },
        }),
      ).rejects.toThrow(/ultimo utente/)
    }
  })
})
