import React from 'react'

import type { CentriListBlock as CentriListProps } from '@/payload-types'
import { getCentri } from '@/lib/content'
import { DatiStrutturati } from '@/components/DatiStrutturati'

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
      {titolo && <h2 className="text-3xl font-semibold">{titolo}</h2>}
      {introduzione && (
        <p className="mt-4 max-w-3xl whitespace-pre-line text-muted-foreground">{introduzione}</p>
      )}

      {regioni.length === 0 && (
        <p className="mt-8 text-muted-foreground">Nessun centro disponibile al momento.</p>
      )}

      {mostraIndice && regioni.length > 0 && (
        <nav aria-label="Regioni" className="mt-8 flex flex-wrap gap-2">
          {regioni.map((regione) => (
            <a
              key={regione}
              href={`#${slugify(regione)}`}
              className="rounded-full border px-3 py-1 text-sm hover:bg-muted"
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
          <div key={regione} id={slugify(regione)} className="mt-12 scroll-mt-24">
            <h3 className="text-2xl font-semibold">{regione}</h3>

            <ul className={`mt-6 grid gap-4 ${GRIGLIA[colonne ?? '2']}`}>
              {centri.map((centro) => (
                <li key={centro.id} className="rounded-lg border bg-card p-5">
                  <p className="text-sm uppercase tracking-wide text-muted-foreground">
                    {centro.citta}
                    {centro.provincia ? ` (${centro.provincia})` : ''}
                  </p>
                  <h4 className="mt-1 text-lg font-medium">{centro.nome_struttura}</h4>

                  {centro.indirizzo && <p className="mt-2">{centro.indirizzo}</p>}
                  {centro.telefoni && <p className="mt-1">Tel. {centro.telefoni}</p>}

                  {centro.professionisti && (
                    <p className="mt-3 whitespace-pre-line text-sm text-muted-foreground">
                      {centro.professionisti}
                    </p>
                  )}

                  <div className="mt-3 flex flex-wrap gap-x-4 gap-y-1 text-sm">
                    {centro.email && (
                      <a className="underline" href={`mailto:${centro.email}`}>
                        {centro.email}
                      </a>
                    )}
                    {centro.sito && (
                      <a
                        className="underline"
                        href={toUrl(centro.sito)}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        Sito web
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
