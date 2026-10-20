import React from 'react'

import type { SchedeBlock as Props } from '@/payload-types'
import { Media } from '@/components/Media'
import RichText from '@/components/RichText'
import { Rivela } from '@/components/Rivela'
import { sezione } from '@/utilities/sezione'
import { cn } from '@/utilities/ui'

// Colori delle schede secondo lo sfondo della sezione (classi scritte per intero)
const SCHEDA = {
  scuro: 'bg-white/[0.06] ring-1 ring-white/10',
  chiaro: 'bg-[#f5f5f7]',
  tenue: 'bg-white',
} as const

const COLONNE = {
  '2': '@2xl:grid-cols-2',
  '3': '@2xl:grid-cols-2 @5xl:grid-cols-3',
} as const

/**
 * Schede in evidenza: griglia di riquadri arrotondati con titolo, testo e immagine facoltativa.
 * Il testo resta quello del CMS: cambia solo la disposizione.
 */
export const SchedeBlock: React.FC<Props> = ({ occhiello, titolo, sfondo, colonne, schede }) => {
  const s = sezione(sfondo ?? 'chiaro')
  const tono = sfondo ?? 'chiaro'
  const scuro = tono === 'scuro'
  return (
    <section className={cn('py-20 md:py-28', s.className)} data-theme={s['data-theme']}>
      <div className="container @container">
        {(occhiello || titolo) && (
          <Rivela className="mb-12 max-w-4xl md:mb-16">
            {occhiello && (
              <p className="mb-3 text-sm font-semibold tracking-wide text-cyan-600 uppercase dark:text-cyan-400">
                {occhiello}
              </p>
            )}
            {titolo && (
              <h2 className="text-[length:var(--titolo-1)] leading-[1.02] font-semibold tracking-tight">
                {titolo}
              </h2>
            )}
          </Rivela>
        )}
        <div className={cn('grid gap-5', COLONNE[colonne ?? '3'])}>
          {(schede ?? []).map((sc, i) => (
            <Rivela
              key={sc.id ?? i}
              ritardo={(i % 3) * 0.08}
              className={cn('flex flex-col overflow-hidden rounded-[28px]', SCHEDA[tono])}
            >
              {sc.immagine && typeof sc.immagine === 'object' && (
                <div className="relative aspect-[16/10] overflow-hidden bg-black">
                  <Media
                    fill
                    resource={sc.immagine}
                    imgClassName="object-cover opacity-90"
                    size="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
                  />
                </div>
              )}
              <div className="flex flex-1 flex-col p-8 md:p-10">
                {sc.occhiello && (
                  <p
                    className={cn(
                      'mb-2 text-sm font-semibold tracking-wide uppercase',
                      scuro ? 'text-cyan-400' : 'text-cyan-600',
                    )}
                  >
                    {sc.occhiello}
                  </p>
                )}
                {sc.titolo && (
                  <h3 className="text-[length:var(--titolo-3)] leading-tight font-semibold tracking-tight">
                    {sc.titolo}
                  </h3>
                )}
                {sc.richText && (
                  <RichText
                    data={sc.richText}
                    enableGutter={false}
                    className={cn(
                      'mx-0 mt-3 w-full max-w-none text-[1.0625rem] leading-relaxed [&_a]:font-semibold',
                      '[&_h3]:mt-0 [&_h3]:text-[length:var(--titolo-3)] [&_p:first-child]:mt-0',
                      scuro ? 'text-neutral-300' : 'text-neutral-600',
                    )}
                  />
                )}
              </div>
            </Rivela>
          ))}
        </div>
      </div>
    </section>
  )
}
