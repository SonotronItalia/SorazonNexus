import { describe, expect, it } from 'vitest'

import { CAMPO_TRAPPOLA, controllaModulo } from '@/hooks/controllaModulo'

// Modulo come quello della pagina Contatti
const MODULO = {
  id: 1,
  fields: [
    { blockType: 'text', name: 'nome', label: 'Nome', required: true },
    { blockType: 'email', name: 'email', label: 'Email', required: true },
    { blockType: 'textarea', name: 'messaggio', label: 'Messaggio', required: true },
    { blockType: 'checkbox', name: 'privacy', label: 'Privacy', required: true },
    { blockType: 'message', message: {} },
  ],
}

const req = {
  payload: {
    findByID: async ({ id }: { id: number }) =>
      id === 1 ? MODULO : Promise.reject(new Error('no')),
    logger: { warn: () => {} },
  },
}

const invia = (submissionData: { field: string; value: unknown }[], form: unknown = 1) =>
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  (controllaModulo as any)({ data: { form, submissionData }, operation: 'create', req })

const VALIDI = [
  { field: 'nome', value: '  Mario Rossi ' },
  { field: 'email', value: 'mario@esempio.it' },
  { field: 'messaggio', value: 'Vorrei informazioni' },
  { field: 'privacy', value: true },
]

describe('controllaModulo (controlli lato server sugli invii dei moduli)', () => {
  it('accetta un invio valido, toglie gli spazi e scarta campi estranei e trappola', async () => {
    const r = await invia([
      ...VALIDI,
      { field: CAMPO_TRAPPOLA, value: '' },
      { field: 'inventato', value: 'x' },
    ])
    expect(r.submissionData).toEqual([
      { field: 'nome', value: 'Mario Rossi' },
      { field: 'email', value: 'mario@esempio.it' },
      { field: 'messaggio', value: 'Vorrei informazioni' },
      { field: 'privacy', value: 'true' },
    ])
  })

  it('rifiuta gli invii con il campo trappola compilato (spam automatico)', async () => {
    await expect(
      invia([...VALIDI, { field: CAMPO_TRAPPOLA, value: 'http://spam' }]),
    ).rejects.toThrow(/non valido/)
  })

  it('rifiuta campi obbligatori mancanti o vuoti', async () => {
    await expect(invia(VALIDI.filter((v) => v.field !== 'nome'))).rejects.toThrow(
      /"Nome" è obbligatorio/,
    )
    await expect(invia([{ field: 'nome', value: '   ' }, ...VALIDI.slice(1)])).rejects.toThrow(
      /obbligatorio/,
    )
  })

  it('pretende la casella della privacy spuntata', async () => {
    const senza = VALIDI.map((v) => (v.field === 'privacy' ? { ...v, value: false } : v))
    await expect(invia(senza)).rejects.toThrow(/"Privacy" è obbligatorio/)
  })

  it('rifiuta email non valide, anche con tentativi di iniezione di intestazioni', async () => {
    for (const email of ['non-una-email', 'a@b', 'a@b.it\nBcc: vittima@x.it', 'a b@c.it']) {
      const dati = VALIDI.map((v) => (v.field === 'email' ? { ...v, value: email } : v))
      await expect(invia(dati)).rejects.toThrow(/email non è valido/)
    }
  })

  it('rifiuta testi troppo lunghi', async () => {
    const lungo = VALIDI.map((v) =>
      v.field === 'messaggio' ? { ...v, value: 'x'.repeat(5001) } : v,
    )
    await expect(invia(lungo)).rejects.toThrow(/troppo lungo/)
  })

  it('rifiuta moduli mancanti o inesistenti', async () => {
    await expect(invia(VALIDI, null)).rejects.toThrow(/Modulo mancante/)
    await expect(invia(VALIDI, 999)).rejects.toThrow(/Modulo inesistente/)
  })

  it("non interviene sugli aggiornamenti fatti dall'admin", async () => {
    const data = { form: 1, submissionData: [] }
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    expect(await (controllaModulo as any)({ data, operation: 'update', req })).toBe(data)
  })
})
