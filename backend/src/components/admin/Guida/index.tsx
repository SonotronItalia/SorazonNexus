import type { AdminViewServerProps } from 'payload'

import { DefaultTemplate } from '@payloadcms/next/templates'
import { Gutter } from '@payloadcms/ui'
import fs from 'node:fs/promises'
import path from 'node:path'
import Link from 'next/link'
import { redirect } from 'next/navigation'
import React from 'react'

import { haAccessoCompleto } from '@/access/ruoli'

import { Stampa } from './Stampa'
import { markdownInHtml } from './markdown'

// Manuali in src/guida (Markdown, immagini in public/guida). Quello per amministratori lo vede
// solo chi ha l'accesso completo
const MANUALI = {
  redattori: { titolo: 'Guida per redattori e proprietari', file: 'redattori.md' },
  amministratori: { titolo: 'Guida per amministratori', file: 'amministratori.md' },
} as const
type Manuale = keyof typeof MANUALI

const leggi = (file: string) =>
  fs.readFile(path.join(process.cwd(), 'src', 'guida', file), 'utf8').catch(() => null)

/**
 * Pagina "Guida" dell'admin (/admin/guida): il manuale d'uso, con indice e stampa in PDF.
 */
export async function Guida({ initPageResult, params, searchParams }: AdminViewServerProps) {
  const { req, visibleEntities, permissions, locale } = initPageResult
  const admin = req.payload.config.routes.admin
  if (!req.user) redirect(`${admin}/login`)
  const completo = haAccessoCompleto(req.user)
  const scelto: Manuale =
    completo && searchParams?.manuale === 'amministratori' ? 'amministratori' : 'redattori'
  const testo = await leggi(MANUALI[scelto].file)
  const { titolo, html, indice } = markdownInHtml(testo ?? '# Guida non disponibile')

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
        <div className="guida">
          <div className="guida__barra">
            {completo && (
              <nav className="guida__schede" aria-label="Manuali">
                {(Object.keys(MANUALI) as Manuale[]).map((m) => (
                  <Link
                    key={m}
                    href={`${admin}/guida${m === 'redattori' ? '' : `?manuale=${m}`}`}
                    aria-current={m === scelto ? 'page' : undefined}
                  >
                    {MANUALI[m].titolo}
                  </Link>
                ))}
              </nav>
            )}
            <Stampa />
          </div>
          {titolo && <h1 className="guida__titolo">{titolo}</h1>}
          {indice.length > 1 && (
            <nav className="guida__indice" aria-label="Indice">
              <strong>Indice</strong>
              <ol>
                {indice.map((v) => (
                  <li key={v.id}>
                    <a href={`#${v.id}`}>{v.testo}</a>
                  </li>
                ))}
              </ol>
            </nav>
          )}
          <article className="guida__testo" dangerouslySetInnerHTML={{ __html: html }} />
        </div>
      </Gutter>
    </DefaultTemplate>
  )
}
