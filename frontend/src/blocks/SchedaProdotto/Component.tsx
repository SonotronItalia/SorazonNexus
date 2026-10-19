import React from 'react'

import type { SchedaProdottoBlock as SchedaProdottoProps } from '@/payload-types'
import { Media } from '@/components/Media'
import { sfondo as stileSfondo } from '@/utilities/sfondo'
import { cn } from '@/utilities/ui'
import { DatiStrutturati } from '@/components/DatiStrutturati'
import { ID_AZIENDA, urlImmagine } from '@/utilities/datiStrutturati'

// Le classi stanno scritte per intero: Tailwind non vede quelle costruite al volo
const COLONNE = {
  '2': '@2xl:grid-cols-2',
  '3': '@2xl:grid-cols-2 @4xl:grid-cols-3',
} as const

export const SchedaProdottoBlock: React.FC<SchedaProdottoProps> = ({
  titolo,
  descrizione,
  immagine,
  posizioneImmagine,
  sfondo,
  colore,
  colonneComponenti,
  gruppi,
  componenti,
}) => {
  const { className: classeSfondo, ...attributiSfondo } = stileSfondo(sfondo, colore)

  // Dati strutturati del prodotto: solo quello che la scheda mostra (voci visibili)
  const immagineUrl = urlImmagine(immagine)
  const prodotto = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: titolo,
    ...(descrizione ? { description: descrizione } : {}),
    ...(immagineUrl ? { image: immagineUrl } : {}),
    brand: { '@type': 'Brand', name: 'Sorazon' },
    manufacturer: { '@id': ID_AZIENDA() },
    category: 'Apparecchio elettromedicale',
    additionalProperty: (gruppi ?? []).flatMap((g) =>
      (g.voci ?? [])
        .filter((v) => v.visibile !== false)
        .map((v) => ({ '@type': 'PropertyValue', name: g.titolo, value: v.testo })),
    ),
  }

  return (
    <section className={cn('py-16', classeSfondo)} {...attributiSfondo}>
      <DatiStrutturati dati={prodotto} />
      <div className="container @container">
        <div className="grid items-center gap-10 @4xl:grid-cols-2">
          <div className={posizioneImmagine === 'destra' ? '@4xl:order-2' : ''}>
            {immagine && typeof immagine === 'object' && (
              <Media resource={immagine} imgClassName="rounded-lg" />
            )}
          </div>

          <div>
            <h2 className="text-3xl font-semibold">{titolo}</h2>
            {descrizione && <p className="mt-4 text-muted-foreground">{descrizione}</p>}

            {gruppi?.map((gruppo) => (
              <div key={gruppo.id} className="mt-6">
                <h3 className="font-semibold text-red-600">{gruppo.titolo}</h3>
                <ul className="mt-2 list-disc space-y-1 pl-5">
                  {gruppo.voci
                    ?.filter((voce) => voce.visibile !== false)
                    .map((voce) => <li key={voce.id}>{voce.testo}</li>)}
                </ul>
              </div>
            ))}
          </div>
        </div>

        {componenti && componenti.length > 0 && (
          <div className={cn('mt-12 grid gap-6', COLONNE[colonneComponenti ?? '3'])}>
            {componenti.map((c) => (
              <div key={c.id} className="rounded-lg border bg-card p-5 text-card-foreground">
                {c.foto && typeof c.foto === 'object' && (
                  <Media resource={c.foto} imgClassName="mb-4 rounded-md" />
                )}
                <h3 className="text-lg font-semibold">{c.nome}</h3>
                <ul className="mt-2 list-disc space-y-1 pl-5 text-sm">
                  {c.composto_da
                    ?.filter((p) => p.visibile !== false)
                    .map((p) => <li key={p.id}>{p.testo}</li>)}
                </ul>
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  )
}