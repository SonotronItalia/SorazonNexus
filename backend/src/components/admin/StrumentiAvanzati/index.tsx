import type { AdminViewServerProps } from 'payload'

import { DefaultTemplate } from '@payloadcms/next/templates'
import { Gutter } from '@payloadcms/ui'
import Link from 'next/link'
import { redirect } from 'next/navigation'
import React from 'react'

import { Percorso } from './Percorso'
import { VOCI_AVANZATE } from './voci'

/**
 * Pagina "Strumenti avanzati" dell'admin (/admin/strumenti-avanzati): le voci tecniche, tolte
 * dal menu laterale, in un unico posto raggiungibile da Impostazioni del sito. Solo amministratori
 * (le collezioni restano comunque protette dai loro permessi).
 */
export function StrumentiAvanzati({ initPageResult, params, searchParams }: AdminViewServerProps) {
  const { req, visibleEntities, permissions, locale } = initPageResult
  const admin = req.payload.config.routes.admin
  if (!req.user) redirect(`${admin}/login`)
  const amministratore = (req.user as { ruolo?: string }).ruolo === 'amministratore'

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
      <Percorso />
      <Gutter>
        <h1 style={{ marginTop: 'calc(var(--base) * 2)' }}>Strumenti avanzati</h1>
        {amministratore ? (
          <>
            <p style={{ color: 'var(--theme-elevation-500)', maxWidth: '40rem' }}>
              Voci tecniche, per gli amministratori. Per i contenuti di tutti i giorni usa il menu a
              sinistra.
            </p>
            <ul
              style={{
                listStyle: 'none',
                padding: 0,
                display: 'grid',
                gap: 'var(--base)',
                maxWidth: '40rem',
              }}
            >
              {VOCI_AVANZATE.map((v) => (
                <li
                  key={v.slug}
                  style={{
                    border: '1px solid var(--theme-elevation-150)',
                    borderRadius: 'var(--style-radius-m)',
                    padding: 'var(--base)',
                  }}
                >
                  <Link href={`${admin}/collections/${v.slug}`} style={{ fontWeight: 600 }}>
                    {v.nome}
                  </Link>
                  <div style={{ color: 'var(--theme-elevation-500)', marginTop: 4 }}>
                    {v.descrizione}
                  </div>
                </li>
              ))}
            </ul>
          </>
        ) : (
          <p>Questa pagina è riservata agli amministratori.</p>
        )}
      </Gutter>
    </DefaultTemplate>
  )
}
