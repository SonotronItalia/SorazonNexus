import React from 'react'

import type { GalleriaRisultatiBlock as GalleriaRisultatiProps } from '@/payload-types'
import { Media } from '@/components/Media'
import { classeLarghezza } from '@/utilities/larghezza'
import { codiceColore, sfondo as stileSfondo } from '@/utilities/sfondo'
import { cn } from '@/utilities/ui'

// Schede dietro le immagini: grigio scuro del vecchio sito se non si sceglie un colore
const SCHEDE_PREDEFINITE = '#36353a'

const COLONNE = {
  '2': '@xl:grid-cols-2',
  '3': '@xl:grid-cols-2 @4xl:grid-cols-3',
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
  larghezza,
  sfondo,
  colore,
  schede,
  voci,
}) => {
  const { className: classeSfondo, ...attributiSfondo } = stileSfondo(sfondo, colore)
  const conSfondo = Boolean(classeSfondo || attributiSfondo.style)
  const coloreSchede = codiceColore(schede) ?? SCHEDE_PREDEFINITE

  return (
    <div className="container @container">
      <section
        className={cn(
          classeLarghezza(larghezza),
          // Con uno sfondo il blocco diventa un riquadro con margine interno
          conSfondo && 'rounded-lg px-6 py-10 md:px-10 md:py-12',
          classeSfondo,
        )}
        {...attributiSfondo}
      >
        {titolo && <h2 className="text-3xl font-semibold">{titolo}</h2>}
        {introduzione && (
          <p className="mt-4 max-w-3xl whitespace-pre-line text-muted-foreground">{introduzione}</p>
        )}

        <ul className={cn('grid grid-cols-1 gap-6', COLONNE[colonne ?? '2'], (titolo || introduzione) && 'mt-8')}>
          {voci?.map((voce) => (
            <li key={voce.id}>
              <figure
                className="group relative aspect-[4/3] overflow-hidden rounded-lg"
                style={{ backgroundColor: coloreSchede }}
              >
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
                <p className="mt-3 text-sm text-muted-foreground">{voce.descrizione}</p>
              )}
            </li>
          ))}
        </ul>
      </section>
    </div>
  )
}
