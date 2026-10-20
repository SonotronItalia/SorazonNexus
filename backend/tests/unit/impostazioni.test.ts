import type { CollectionConfig, Field, GlobalConfig } from 'payload'
import { describe, expect, it } from 'vitest'

import { RISORSE } from '@/access/risorse'
import { eAmministratore, nascostaSenzaPermesso, può } from '@/access/ruoli'
import { Categories } from '@/collections/Categories'
import { TipiEffetto } from '@/collections/TipiEffetto'
import { Users } from '@/collections/Users'
import { FORMATI_ID, Impostazioni } from '@/Impostazioni/config'
import { ordineMenu } from '@/plugins/ordineMenu'

// Ruoli come li crea la migrazione: Amministratore (accesso completo) e Redattore
const PROFILI = {
  amministratore: { id: 1, completo: true },
  redattore: {
    id: 2,
    completo: false,
    permessi: Object.fromEntries(
      RISORSE.map((r) => [r.chiave, Object.fromEntries(r.redattore.map((a) => [a, true]))]),
    ),
  },
  // Ruolo personalizzato: solo le notizie, senza eliminarle
  notizie: { id: 3, completo: false, permessi: { posts: { vede: true, crea: true, modifica: true } } },
}
type NomeProfilo = keyof typeof PROFILI
const utente = (ruolo?: NomeProfilo, id = 1) => (ruolo ? { id, profilo: PROFILI[ruolo] } : null)
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const con = (ruolo?: NomeProfilo, id = 1) => ({ req: { user: utente(ruolo, id) }, id: undefined }) as any

// Trova un campo per nome dentro schede, righe e gruppi
const trova = (campi: Field[], nome: string): Field | undefined => {
  for (const c of campi) {
    if ('name' in c && c.name === nome) return c
    const figli =
      c.type === 'tabs'
        ? c.tabs.flatMap((t) =>
            'name' in t && t.name === nome ? [{ ...t, type: 'group' } as Field] : t.fields,
          )
        : 'fields' in c
          ? c.fields
          : []
    const f = trova(figli, nome)
    if (f) return f
  }
}

describe('ruoli', () => {
  it("l'accesso completo vale come amministratore", () => {
    expect(eAmministratore(con('amministratore'))).toBe(true)
    expect(eAmministratore(con('redattore'))).toBe(false)
    expect(eAmministratore(con())).toBe(false)
    expect(nascostaSenzaPermesso('users')({ user: utente('redattore') })).toBe(true)
    expect(nascostaSenzaPermesso('users')({ user: utente('amministratore') })).toBe(false)
    expect(nascostaSenzaPermesso('effetti')({ user: utente('redattore') })).toBe(false)
  })

  it('un ruolo personalizzato fa solo quello che ha spuntato', () => {
    expect(può(utente('notizie'), 'posts', 'crea')).toBe(true)
    expect(può(utente('notizie'), 'posts', 'elimina')).toBe(false)
    expect(può(utente('notizie'), 'pages', 'vede')).toBe(false)
    expect(può(null, 'posts', 'vede')).toBe(false)
    // Un ruolo non caricato (solo l'id) non dà permessi
    expect(può({ id: 1, profilo: 3 }, 'posts', 'vede')).toBe(false)
  })

  it('il redattore gestisce gli effetti ma non scrive codice nei tipi di effetto', () => {
    for (const a of ['vede', 'crea', 'modifica', 'elimina'] as const)
      expect(può(utente('redattore'), 'effetti', a), a).toBe(true)
    expect(può(utente('redattore'), 'tipi-effetto', 'crea')).toBe(false)
  })

  it('un redattore vede e modifica solo il proprio account e non crea utenti', () => {
    const a = Users.access!
    expect((a.read as (x: unknown) => unknown)(con('redattore', 7))).toEqual({ id: { equals: 7 } })
    expect((a.update as (x: unknown) => unknown)(con('redattore', 7))).toEqual({
      id: { equals: 7 },
    })
    expect((a.create as (x: unknown) => unknown)(con('redattore'))).toBe(false)
    expect((a.delete as (x: unknown) => unknown)(con('redattore'))).toBe(false)
    expect((a.read as (x: unknown) => unknown)(con('amministratore'))).toBe(true)
  })

  it('un redattore non può cambiarsi il ruolo', () => {
    const ruolo = Users.fields.find((f) => 'name' in f && f.name === 'profilo') as Field & {
      access: { update: (x: unknown) => boolean }
    }
    expect(ruolo.access.update(con('redattore'))).toBe(false)
    expect(ruolo.access.update(con('amministratore'))).toBe(true)
  })

  it('voci avanzate: si leggono, ma le modifica solo chi ha il permesso', () => {
    for (const c of [Categories, TipiEffetto] as CollectionConfig[]) {
      const a = c.access!
      expect((a.read as (x: unknown) => unknown)(con()), c.slug).toBe(true)
      for (const azione of ['create', 'update', 'delete'] as const) {
        expect(
          (a[azione] as (x: unknown) => unknown)(con('redattore')),
          `${c.slug} ${azione}`,
        ).toBe(false)
        expect(
          (a[azione] as (x: unknown) => unknown)(con('amministratore')),
          `${c.slug} ${azione}`,
        ).toBe(true)
      }
    }
  })
})

describe('Impostazioni del sito', () => {
  it('formati degli ID di Google', () => {
    expect(FORMATI_ID.gtm.test('GTM-ABC1234')).toBe(true)
    expect(FORMATI_ID.ga.test('G-ABC123XYZ9')).toBe(true)
    expect(FORMATI_ID.ads.test('AW-123456789')).toBe(true)
    for (const sbagliato of [
      'GTM-',
      'gtm-abc',
      'G-ABC<script>',
      'UA-12345-1',
      'AW-ABC',
      'G-ABC123 ; alert(1)',
    ]) {
      expect(
        FORMATI_ID.gtm.test(sbagliato) ||
          FORMATI_ID.ga.test(sbagliato) ||
          FORMATI_ID.ads.test(sbagliato),
        sbagliato,
      ).toBe(false)
    }
  })

  it('ID di Google e modalità del consenso: solo con il permesso della scheda Analisi', () => {
    for (const nome of [
      'googleTagManagerId',
      'googleAnalyticsId',
      'googleAdsId',
      'modalitaConsenso',
    ]) {
      const campo = trova(Impostazioni.fields, nome) as Field & {
        access: { update: (x: unknown) => boolean }
      }
      expect(campo, nome).toBeDefined()
      expect(campo.access.update(con('redattore')), nome).toBe(false)
      expect(campo.access.update(con('amministratore')), nome).toBe(true)
    }
  })

  it("validazione: ID sbagliati rifiutati, vuoti accettati; fine dell'avviso dopo l'inizio", () => {
    const ga = trova(Impostazioni.fields, 'googleAnalyticsId') as Field & {
      validate: (v: unknown) => unknown
    }
    expect(ga.validate('')).toBe(true)
    expect(ga.validate('G-ABC123XYZ9')).toBe(true)
    expect(ga.validate('UA-1234-1')).toMatch(/Formato non valido/)
    const fine = trova(Impostazioni.fields, 'fine') as Field & {
      validate: (v: unknown, o: unknown) => unknown
    }
    expect(fine.validate('2026-08-10', { siblingData: { inizio: '2026-08-20' } })).toMatch(/dopo/)
    expect(fine.validate('2026-08-30', { siblingData: { inizio: '2026-08-20' } })).toBe(true)
  })

  it("l'avviso attivo richiede un testo", () => {
    const testo = trova(Impostazioni.fields, 'testo') as Field & {
      validate: (v: unknown, o: unknown) => unknown
    }
    expect(testo.validate('', { siblingData: { attivo: true } })).toMatch(/testo/)
    expect(testo.validate('', { siblingData: { attivo: false } })).toBe(true)
  })

  it('lettura pubblica (serve al sito), modifica solo con login', () => {
    const a = (Impostazioni as GlobalConfig).access!
    expect((a.read as (x: unknown) => unknown)(con())).toBe(true)
    expect((a.update as (x: unknown) => unknown)(con())).toBe(false)
  })
})

describe('ordine della barra laterale', () => {
  it('Contenuti, Contatti, Aspetto, Impostazioni, Avanzate; le voci senza gruppo in testa', async () => {
    const config = await ordineMenu({
      collections: [
        { slug: 'utenti', admin: { group: 'Avanzate' } },
        { slug: 'moduli', admin: { group: 'Contatti' } },
        { slug: 'senza', admin: {} },
        { slug: 'pagine', admin: { group: 'Contenuti' } },
        { slug: 'colori', admin: { group: 'Aspetto del sito' } },
      ],
      globals: [
        { slug: 'torna', admin: { group: 'Aspetto del sito' } },
        { slug: 'impostazioni', admin: { group: 'Impostazioni' } },
      ],
    } as never)
    expect(config.collections!.map((c) => c.slug)).toEqual([
      'senza',
      'pagine',
      'moduli',
      'colori',
      'utenti',
    ])
    expect(config.globals!.map((g) => g.slug)).toEqual(['torna', 'impostazioni'])
  })
})
