import { describe, expect, it } from 'vitest'

import { authenticatedOrPublished } from '@/access/authenticatedOrPublished'
import { Media } from '@/collections/Media'
import { Users } from '@/collections/Users'

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const conUtente = (user: unknown) => ({ req: { user } }) as any

describe('regole di sicurezza delle collezioni', () => {
  it('i visitatori anonimi vedono solo i contenuti pubblicati', () => {
    expect(authenticatedOrPublished(conUtente(null))).toEqual({ _status: { equals: 'published' } })
    expect(authenticatedOrPublished(conUtente({ id: 1 }))).toBe(true)
  })

  it('gli utenti del CMS non sono leggibili né modificabili senza accesso', () => {
    for (const azione of ['read', 'create', 'update', 'delete'] as const) {
      const regola = Users.access?.[azione] as (a: unknown) => unknown
      expect(regola(conUtente(null)), azione).toBe(false)
    }
  })

  it('il login si blocca dopo 5 tentativi e non usa chiavi API', () => {
    const auth = Users.auth as Exclude<typeof Users.auth, boolean | undefined>
    expect(auth.maxLoginAttempts).toBe(5)
    expect(auth.lockTime).toBeGreaterThanOrEqual(10 * 60 * 1000)
    expect(auth.useAPIKey).toBeFalsy()
  })

  it('i caricamenti accettano solo immagini, PDF e video (niente SVG o HTML eseguibili)', () => {
    const upload = Media.upload as Exclude<typeof Media.upload, boolean | undefined>
    const tipi = upload.mimeTypes ?? []
    expect(tipi).toContain('image/jpeg')
    expect(tipi).toContain('application/pdf')
    for (const pericoloso of [
      'image/svg+xml',
      'text/html',
      'application/xhtml+xml',
      'application/javascript',
    ]) {
      expect(tipi).not.toContain(pericoloso)
    }
    expect(tipi.some((t) => t.includes('*'))).toBe(false)
  })
})
