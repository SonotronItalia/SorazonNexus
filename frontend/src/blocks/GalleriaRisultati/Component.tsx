import React from 'react'

import type { GalleriaRisultatiBlock as GalleriaRisultatiProps } from '@/payload-types'
import { Media } from '@/components/Media'
import { cn } from '@/utilities/ui'

// Le classi stanno scritte per intero: Tailwind non vede quelle costruite al volo
const SFONDI = {
  nessuno: '',
  tenue: 'bg-muted',
  scuro: 'bg-background text-foreground',
} as const

const COLONNE = {
  '2': 'sm:grid-cols-2',
  '3': 'sm:grid-cols-2 lg:grid-cols-3',
} as const

export const GalleriaRisultatiBlock: React.FC<GalleriaRisultatiProps> = ({
  titolo,
  introduzione,
  colonne,
  sfondo,
  voci,
}) => {
  const variante = sfondo ?? 'nessuno'

  return (
    <section
      className={cn('py-16', SFONDI[variante])}
      // "Scuro" usa il tema scuro del sito solo per questa sezione
      {...(variante === 'scuro' ? { 'data-theme': 'dark' } : {})}
    >
      <div className="container">
        {titolo && <h2 className="text-3xl font-semibold">{titolo}</h2>}
        {introduzione && (
          <p className="mt-4 max-w-3xl whitespace-pre-line text-muted-foreground">{introduzione}</p>
        )}

        <ul className={cn('mt-8 grid grid-cols-1 gap-6', COLONNE[colonne ?? '2'])}>
          {voci?.map((voce) => (
            <li key={voce.id}>
              <figure>
                {/* Immagine scura con l'etichetta in sovraimpressione, leggibile grazie alla sfumatura */}
                <div className="relative aspect-[4/3] overflow-hidden rounded-lg bg-slate-900">
                  {voce.immagine && typeof voce.immagine === 'object' && (
                    <Media
                      resource={voce.immagine}
                      fill
                      imgClassName="object-cover"
                      size="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                    />
                  )}
                  <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/80 to-transparent p-5 pt-12">
                    <span className="text-lg font-semibold text-white">{voce.etichetta}</span>
                  </div>
                </div>
                {voce.descrizione && (
                  <figcaption className="mt-3 text-sm text-muted-foreground">
                    {voce.descrizione}
                  </figcaption>
                )}
              </figure>
            </li>
          ))}
        </ul>
      </div>
    </section>
  )
}
