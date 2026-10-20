import { getPayload, type Payload } from 'payload'
import { afterAll, beforeAll, describe, expect, it } from 'vitest'

import config from '@/payload.config'

// Permessi visti da un visitatore anonimo (overrideAccess: false, nessun utente), su Payload vero
// e su un database di PROVA (vitest.setup.ts). I documenti creati qui vengono cancellati alla fine.
let payload: Payload
const daCancellare: { collection: 'pages' | 'forms' | 'form-submissions'; id: number }[] = []
const anonimo = { overrideAccess: false } as const

beforeAll(async () => {
  payload = await getPayload({ config: await config })
})

afterAll(async () => {
  for (const { collection, id } of daCancellare.reverse()) {
    await payload.delete({ collection, id, context: { disableRevalidate: true } }).catch(() => {})
  }
})

describe('accesso anonimo', () => {
  it('non può leggere gli utenti del CMS', async () => {
    await expect(payload.find({ collection: 'users', ...anonimo })).rejects.toThrow()
  })

  it('non può creare pagine né caricare file', async () => {
    await expect(
      payload.create({
        collection: 'pages',
        data: { title: 'Intrusa', slug: 'intrusa' },
        draft: true,
        ...anonimo,
      }),
    ).rejects.toThrow()
    await expect(
      payload.create({
        collection: 'media',
        data: { alt: 'x' },
        file: { data: Buffer.from('ciao'), mimetype: 'image/png', name: 'x.png', size: 4 },
        ...anonimo,
      }),
    ).rejects.toThrow()
  })

  it('vede le pagine pubblicate ma non le bozze', async () => {
    const bozza = await payload.create({
      collection: 'pages',
      data: { title: 'Bozza segreta', slug: `bozza-test-${Date.now()}`, _status: 'draft' },
      draft: true,
      context: { disableRevalidate: true },
    })
    daCancellare.push({ collection: 'pages', id: bozza.id })
    const { docs } = await payload.find({
      collection: 'pages',
      where: { slug: { equals: bozza.slug } },
      ...anonimo,
    })
    expect(docs).toHaveLength(0)
  })
})

describe('caricamenti (anche da utente del CMS)', () => {
  it('rifiutano SVG e HTML, che il browser potrebbe eseguire', async () => {
    for (const [name, mimetype] of [
      ['x.svg', 'image/svg+xml'],
      ['x.html', 'text/html'],
    ]) {
      await expect(
        payload.create({
          collection: 'media',
          data: { alt: 'x' },
          file: { data: Buffer.from('<svg onload="alert(1)"/>'), mimetype, name, size: 24 },
        }),
      ).rejects.toThrow()
    }
  })
})

describe('moduli del sito', () => {
  let form: number
  beforeAll(async () => {
    const f = await payload.create({
      collection: 'forms',
      data: {
        title: `Modulo di prova ${Date.now()}`,
        fields: [
          { blockType: 'text', name: 'nome', label: 'Nome', required: true },
          { blockType: 'email', name: 'email', label: 'Email', required: true },
        ],
        emails: [],
        confirmationType: 'message',
        // Testo formattato minimo (Lexical): il messaggio di conferma è obbligatorio
        confirmationMessage: {
          root: {
            type: 'root',
            version: 1,
            direction: null,
            format: '',
            indent: 0,
            children: [
              {
                type: 'paragraph',
                version: 1,
                direction: null,
                format: '',
                indent: 0,
                textFormat: 0,
                textStyle: '',
                children: [
                  {
                    type: 'text',
                    version: 1,
                    text: 'Grazie',
                    detail: 0,
                    format: 0,
                    mode: 'normal',
                    style: '',
                  },
                ],
              },
            ],
          },
        },
      },
    })
    form = f.id
    daCancellare.push({ collection: 'forms', id: form })
  })

  it('un visitatore può inviare un modulo valido', async () => {
    const invio = await payload.create({
      collection: 'form-submissions',
      data: {
        form,
        submissionData: [
          { field: 'nome', value: 'Mario' },
          { field: 'email', value: 'm@esempio.it' },
        ],
      },
      ...anonimo,
    })
    daCancellare.push({ collection: 'form-submissions', id: invio.id })
    expect(invio.id).toBeDefined()
  })

  it('un invio con la trappola compilata o un campo mancante viene rifiutato', async () => {
    await expect(
      payload.create({
        collection: 'form-submissions',
        data: {
          form,
          submissionData: [
            { field: 'nome', value: 'Bot' },
            { field: 'email', value: 'b@esempio.it' },
            { field: '_sito', value: 'spam' },
          ],
        },
        ...anonimo,
      }),
    ).rejects.toThrow()
    await expect(
      payload.create({
        collection: 'form-submissions',
        data: { form, submissionData: [{ field: 'nome', value: 'Senza email' }] },
        ...anonimo,
      }),
    ).rejects.toThrow()
  })

  it('un visitatore non può leggere gli invii degli altri', async () => {
    await expect(payload.find({ collection: 'form-submissions', ...anonimo })).rejects.toThrow()
  })
})
