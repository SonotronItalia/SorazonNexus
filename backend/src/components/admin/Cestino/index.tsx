import type { AdminViewServerProps, CollectionSlug } from 'payload'

import { DefaultTemplate } from '@payloadcms/next/templates'
import { Gutter } from '@payloadcms/ui'
import Link from 'next/link'
import { redirect } from 'next/navigation'
import React from 'react'

import { può } from '@/access/ruoli'

// Voce dei permessi per ogni raccolta con il cestino (i file del marchio seguono le Impostazioni)
const RISORSA: Partial<Record<string, string>> = { marchio: 'impostazioni' }

const etichetta = (v: unknown, lingua: string): string =>
  typeof v === 'string'
    ? v
    : v && typeof v === 'object'
      ? String((v as Record<string, string>)[lingua] ?? Object.values(v)[0] ?? '')
      : ''

const data = new Intl.DateTimeFormat('it-IT', { dateStyle: 'medium', timeStyle: 'short' })

/**
 * Pagina "Cestino" (Avanzate, /admin/cestino): gli elementi eliminati di tutte le raccolte con
 * il cestino (trash: true), divisi per tipologia. Ognuno vede solo le raccolte che può vedere
 * nei permessi. Ripristino ed eliminazione definitiva (solo amministratori) si fanno aprendo
 * l'elemento, nel cestino di Payload.
 */
export async function Cestino({ initPageResult, params, searchParams }: AdminViewServerProps) {
  const { req, visibleEntities, permissions, locale } = initPageResult
  const admin = req.payload.config.routes.admin
  if (!req.user) redirect(`${admin}/login`)
  const lingua = req.locale && req.locale !== 'all' ? req.locale : 'it'

  const raccolte = req.payload.config.collections.filter(
    (c) => c.trash && può(req.user, RISORSA[c.slug] ?? c.slug, 'vede'),
  )
  const sezioni = await Promise.all(
    raccolte.map(async (c) => {
      const titolo = (c.admin?.useAsTitle as string | undefined) ?? 'id'
      const risultato = await req.payload
        .find({
          collection: c.slug as CollectionSlug,
          trash: true,
          where: { deletedAt: { exists: true } },
          sort: '-deletedAt',
          depth: 0,
          limit: 50,
          overrideAccess: false,
          user: req.user,
          locale: lingua as never,
          fallbackLocale: 'it' as never,
        })
        .catch(() => null)
      return {
        slug: c.slug,
        nome: etichetta(c.labels?.plural, 'it') || c.slug,
        totale: risultato?.totalDocs ?? 0,
        voci: (risultato?.docs ?? []).map((d) => {
          const doc = d as unknown as Record<string, unknown>
          return {
            id: String(doc.id),
            titolo: String(doc[titolo] ?? doc.filename ?? doc.id),
            eliminato:
              typeof doc.deletedAt === 'string' ? data.format(new Date(doc.deletedAt)) : '',
          }
        }),
      }
    }),
  )
  const totale = sezioni.reduce((n, s) => n + s.totale, 0)

  return (
    <DefaultTemplate
      i18n={req.i18n}
      locale={locale}
      params={params}
      payload={req.payload}
      permissions={permissions}
      searchParams={searchParams}
      user={req.user ?? undefined}
      visibleEntities={visibleEntities}
    >
      <Gutter>
        <div className="cestino">
          <h1>Cestino</h1>
          <p className="cestino__intro">
            Gli elementi eliminati restano qui finché non vengono eliminati definitivamente. Apri un
            elemento e premi
            <strong> Ripristina</strong> per rimetterlo al suo posto. Eliminare per sempre è solo
            per gli amministratori.
          </p>
          {totale === 0 && <p className="cestino__vuoto">Il cestino è vuoto.</p>}
          {sezioni.map((s) => (
            <section key={s.slug} className="cestino__sezione">
              <div className="cestino__testa">
                <h2>
                  {s.nome} <span className="cestino__conta">{s.totale}</span>
                </h2>
                {s.totale > 0 && (
                  <Link href={`${admin}/collections/${s.slug}/trash`}>
                    Apri il cestino di {s.nome.toLowerCase()}
                  </Link>
                )}
              </div>
              {s.voci.length > 0 ? (
                <ul className="cestino__elenco">
                  {s.voci.map((v) => (
                    <li key={v.id}>
                      <Link href={`${admin}/collections/${s.slug}/trash/${v.id}`}>{v.titolo}</Link>
                      <span>eliminato il {v.eliminato}</span>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="cestino__vuoto">Nessun elemento.</p>
              )}
              {s.totale > s.voci.length && (
                <p className="cestino__altri">
                  Mostrati gli ultimi {s.voci.length} su {s.totale}: gli altri nel cestino di{' '}
                  {s.nome.toLowerCase()}.
                </p>
              )}
            </section>
          ))}
        </div>
      </Gutter>
    </DefaultTemplate>
  )
}
