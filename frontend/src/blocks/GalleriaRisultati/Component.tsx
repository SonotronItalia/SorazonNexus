import React from 'react'

import type { GalleriaRisultatiBlock as GalleriaRisultatiProps } from '@/payload-types'
import { Media } from '@/components/Media'
import { cn } from '@/utilities/ui'

// Le classi stanno scritte per intero: Tailwind non vede quelle costruite al volo.
// "celeste": #0095ac è il celeste del marchio (vecchio sito), le schede restano scure (#36353a).
const SFONDI = {
  nessuno: '',
  tenue: 'bg-muted',
  scuro: 'bg-background text-foreground',
  celeste: 'bg-[#0095ac] text-white',
} as const

const TESTO_SECONDARIO = {
  nessuno: 'text-muted-foreground',
  tenue: 'text-muted-foreground',
  scuro: 'text-muted-foreground',
  celeste: 'text-white/90',
} as const

const COLONNE = {
  '2': 'sm:grid-cols-2',
  '3': 'sm:grid-cols-2 lg:grid-cols-3',
} as const

/**
 * Effetto al passaggio del mouse (come il vecchio sito): l'immagine, attenuata e spostata a
 * sinistra, si illumina scorrendo al suo posto; l'etichetta sale e compare il sottotitolo.
 * Vale solo con un mouse (pointer-fine): su telefoni e tablet immagine e sottotitolo sono
 * già visibili. Con "riduci movimento" niente animazioni.
 */
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
          <p className={cn('mt-4 max-w-3xl whitespace-pre-line', TESTO_SECONDARIO[variante])}>
            {introduzione}
          </p>
        )}

        <ul className={cn('grid grid-cols-1 gap-6', COLONNE[colonne ?? '2'], (titolo || introduzione) && 'mt-8')}>
          {voci?.map((voce) => (
            <li key={voce.id}>
              <figure className="group relative aspect-[4/3] overflow-hidden rounded-lg bg-[#36353a]">
                {/* Più larga di 50px e spostata di 40px: al passaggio del mouse scorre al suo posto */}
                <div className="absolute inset-y-0 left-0 w-full opacity-80 transition duration-350 group-hover:translate-x-0 group-hover:opacity-100 motion-reduce:transition-none pointer-fine:w-[calc(100%+50px)] pointer-fine:-translate-x-10 pointer-fine:opacity-50">
                  {voce.immagine && typeof voce.immagine === 'object' && (
                    <Media
                      resource={voce.immagine}
                      fill
                      // Con "fill" il contenitore diretto dell'immagine deve essere posizionato
                      pictureClassName="absolute inset-0"
                      imgClassName="object-cover"
                      size="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                    />
                  )}
                </div>
                <figcaption className="absolute inset-x-0 bottom-0 p-6 text-white md:p-8">
                  <span
                    className={cn(
                      'block text-xl font-semibold transition-transform duration-350 group-hover:translate-y-0 motion-reduce:transition-none',
                      // Con il sottotitolo nascosto l'etichetta occupa il suo posto
                      voce.sottotitolo && 'pointer-fine:translate-y-7',
                    )}
                  >
                    {voce.etichetta}
                  </span>
                  {voce.sottotitolo && (
                    <span className="mt-1 block tracking-wide text-white/80 transition duration-350 group-hover:translate-y-0 group-hover:opacity-100 group-hover:delay-50 motion-reduce:transition-none pointer-fine:translate-y-7 pointer-fine:opacity-0">
                      {voce.sottotitolo}
                    </span>
                  )}
                </figcaption>
              </figure>
              {voce.descrizione && (
                <p className={cn('mt-3 text-sm', TESTO_SECONDARIO[variante])}>{voce.descrizione}</p>
              )}
            </li>
          ))}
        </ul>
      </div>
    </section>
  )
}
