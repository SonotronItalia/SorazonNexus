import React from 'react'

import type { CentriListBlock as CentriListProps } from '@/payload-types'
import { getCentri } from '@/lib/content'
import { DatiStrutturati } from '@/components/DatiStrutturati'
import { telefoni } from '@/utilities/telefoni'
import { linguaRichiesta } from '@/utilities/linguaRichiesta'
import { testi } from '@/utilities/testi'

const slugify = (s: string) =>
  s
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '')

const toUrl = (s: string) => (/^https?:\/\//i.test(s) ? s : `https://${s}`)

// Le classi stanno scritte per intero: Tailwind non vede quelle costruite al volo
const GRIGLIA = {
  '2': '@2xl:grid-cols-2',
  '3': '@2xl:grid-cols-2 @4xl:grid-cols-3',
} as const

export const CentriListBlock: React.FC<CentriListProps> = async ({
  titolo,
  introduzione,
  mostraIndice,
  colonne,
}) => {
  const docs = await getCentri()
  const t = testi(await linguaRichiesta())

  const perRegione = new Map<string, typeof docs>()
  for (const centro of docs) {
    const regione = centro.regione?.trim() || 'Altre'
    perRegione.set(regione, [...(perRegione.get(regione) ?? []), centro])
  }
  const regioni = [...perRegione.keys()].sort((a, b) => a.localeCompare(b, 'it'))

  // Dati strutturati: ogni centro come struttura sanitaria con indirizzo e contatti, così i
  // motori di ricerca e gli assistenti AI possono indicare il centro più vicino
  const elencoCentri = {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    name: 'Centri di riferimento Sorazon in Italia',
    numberOfItems: docs.length,
    itemListElement: docs.map((c, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      item: {
        '@type': 'MedicalClinic',
        name: c.nome_struttura?.trim() || `Centro Sorazon ${c.citta ?? ''}`.trim(),
        address: {
          '@type': 'PostalAddress',
          ...(c.indirizzo ? { streetAddress: c.indirizzo } : {}),
          ...(c.citta ? { addressLocality: c.citta } : {}),
          ...(c.provincia ? { addressRegion: c.provincia } : {}),
          addressCountry: 'IT',
        },
        // Più numeri nello stesso campo: il primo è quello principale
        ...(c.telefoni ? { telephone: c.telefoni.split(/\s*[\/,;]\s*|\s+-\s+/)[0] } : {}),
        ...(c.email ? { email: c.email } : {}),
        ...(c.sito ? { url: toUrl(c.sito) } : {}),
        // Il campo "point" di Payload è [longitudine, latitudine]
        ...(c.coordinate
          ? { geo: { '@type': 'GeoCoordinates', latitude: c.coordinate[1], longitude: c.coordinate[0] } }
          : {}),
      },
    })),
  }

  return (
    <section className="container my-16 @container">
      {docs.length > 0 && <DatiStrutturati dati={elencoCentri} />}
      {titolo && (
        <h2 className="text-[length:var(--titolo-1)] leading-[1.02] font-semibold tracking-tight">
          {titolo}
        </h2>
      )}
      {introduzione && (
        <p className="mt-6 max-w-3xl text-[length:var(--testo-sottotitolo)] leading-snug whitespace-pre-line text-neutral-500 dark:text-neutral-400">
          {introduzione}
        </p>
      )}

      {regioni.length === 0 && (
        <p className="mt-8 text-muted-foreground">{t.centriNessuno}</p>
      )}

      {/* Indice delle regioni: resta sotto l'header mentre si scorre l'elenco */}
      {mostraIndice && regioni.length > 0 && (
        <nav
          aria-label={t.centriRegioni}
          className="sticky top-[60px] z-20 -mx-4 mt-10 flex gap-2 overflow-x-auto bg-background/80 px-4 py-3 backdrop-blur-xl backdrop-saturate-150 md:top-[68px]"
        >
          {regioni.map((regione) => (
            <a
              key={regione}
              href={`#${slugify(regione)}`}
              className="shrink-0 rounded-full bg-neutral-100 px-4 py-1.5 text-sm font-medium transition-colors hover:bg-cyan-600 hover:text-white dark:bg-white/10"
            >
              {regione}
            </a>
          ))}
        </nav>
      )}

      {regioni.map((regione) => {
        const centri = [...(perRegione.get(regione) ?? [])].sort((a, b) =>
          (a.citta ?? '').localeCompare(b.citta ?? '', 'it'),
        )

        return (
          <div key={regione} id={slugify(regione)} className="mt-16 scroll-mt-40">
            <h3 className="text-[length:var(--titolo-2)] leading-tight font-semibold tracking-tight">
              {regione}
            </h3>

            <ul className={`mt-8 grid gap-5 ${GRIGLIA[colonne ?? '2']}`}>
              {centri.map((centro) => (
                <li
                  key={centro.id}
                  className="flex flex-col rounded-[28px] bg-[#f5f5f7] p-7 md:p-8 dark:bg-white/[0.06]"
                >
                  <p className="text-sm font-semibold tracking-wide text-cyan-600 uppercase dark:text-cyan-400">
                    {centro.citta}
                    {centro.provincia ? ` (${centro.provincia})` : ''}
                  </p>
                  <h4 className="mt-2 text-xl leading-snug font-semibold tracking-tight">
                    {centro.nome_struttura}
                  </h4>

                  {centro.indirizzo && (
                    <p className="mt-3 text-neutral-600 dark:text-neutral-300">{centro.indirizzo}</p>
                  )}

                  {centro.professionisti && (
                    <p className="mt-3 text-sm whitespace-pre-line text-neutral-500 dark:text-neutral-400">
                      {centro.professionisti}
                    </p>
                  )}

                  <div className="mt-auto flex flex-wrap gap-2 pt-6 text-sm font-medium">
                    {telefoni(centro.telefoni).map((t) => (
                      <a
                        key={t.href}
                        href={t.href}
                        className="rounded-full bg-white px-4 py-2 shadow-xs hover:bg-cyan-600 hover:text-white dark:bg-white/10"
                      >
                        {t.testo}
                      </a>
                    ))}
                    {centro.email && (
                      <a
                        className="rounded-full bg-white px-4 py-2 shadow-xs hover:bg-cyan-600 hover:text-white dark:bg-white/10"
                        href={`mailto:${centro.email}`}
                      >
                        {centro.email}
                      </a>
                    )}
                    {centro.sito && (
                      <a
                        className="rounded-full bg-white px-4 py-2 shadow-xs hover:bg-cyan-600 hover:text-white dark:bg-white/10"
                        href={toUrl(centro.sito)}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        {t.centriSito}
                      </a>
                    )}
                  </div>
                </li>
              ))}
            </ul>
          </div>
        )
      })}
    </section>
  )
}
