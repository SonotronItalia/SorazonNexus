'use client'

import { ChevronLeft, ChevronRight } from 'lucide-react'
import { m } from 'motion/react'
import React, { useCallback, useEffect, useRef, useState } from 'react'

import type { CaroselloBlock as Props } from '@/payload-types'
import { CMSLink } from '@/components/Link'
import { Media } from '@/components/Media'
import { CURVA } from '@/components/Rivela'
import { sezione } from '@/utilities/sezione'
import { cn } from '@/utilities/ui'
import { useLingua } from '@/providers/Lingua'

/**
 * Carosello orizzontale di schede grandi (stile "Le novità"): si scorre con il dito, la rotella
 * o le frecce, e si aggancia a ogni scheda. Le schede compaiono in sequenza la prima volta.
 */
export const CaroselloBlock: React.FC<Props> = ({ titolo, sfondo, schede }) => {
  const { t } = useLingua()
  const s = sezione(sfondo)
  const scuro = s['data-theme'] === 'dark'
  const binario = useRef<HTMLUListElement>(null)
  const [estremi, setEstremi] = useState({ inizio: true, fine: false })

  const aggiorna = useCallback(() => {
    const el = binario.current
    if (!el) return
    const inizio = el.scrollLeft < 8
    const fine = el.scrollLeft + el.clientWidth >= el.scrollWidth - 8
    // Stesso oggetto se non cambia nulla: niente nuovo disegno del carosello a ogni evento di
    // scorrimento (decine al secondo), solo quando si arriva o si lascia un estremo
    setEstremi((prima) => (prima.inizio === inizio && prima.fine === fine ? prima : { inizio, fine }))
  }, [])

  useEffect(() => {
    const el = binario.current
    if (!el) return
    const osserva = new ResizeObserver(aggiorna)
    osserva.observe(el)
    return () => osserva.disconnect()
  }, [aggiorna])

  // Una scheda alla volta (larghezza della prima più lo spazio tra le schede)
  const scorri = (verso: 1 | -1) => {
    const el = binario.current
    const scheda = el?.querySelector('li')
    if (!el || !scheda) return
    el.scrollBy({ left: verso * (scheda.getBoundingClientRect().width + 20), behavior: 'smooth' })
  }

  const freccia = cn(
    'inline-flex size-11 items-center justify-center rounded-full transition-colors disabled:opacity-30',
    scuro
      ? 'bg-white/10 text-white hover:bg-white/20'
      : 'bg-black/[0.06] text-neutral-900 hover:bg-black/10',
  )

  return (
    <section
      className={cn('overflow-hidden py-24 md:py-32', s.className)}
      data-theme={s['data-theme']}
    >
      <div className="container">
        {titolo && (
          <h2 className="mb-10 text-[length:var(--titolo-2)] leading-tight font-semibold tracking-tight">
            {titolo}
          </h2>
        )}
      </div>
      <ul
        ref={binario}
        onScroll={aggiorna}
        className="flex snap-x snap-mandatory gap-5 overflow-x-auto scroll-smooth px-[max(1rem,calc((100vw-var(--breakpoint-xl))/2+2rem))] pb-4 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
        aria-label={titolo ?? 'Carosello'}
      >
        {(schede ?? []).map((scheda, i) => (
          <m.li
            key={scheda.id ?? i}
            className="group relative aspect-[4/5] w-[82vw] shrink-0 snap-start overflow-hidden rounded-[28px] bg-neutral-900 shadow-sm sm:w-[24rem]"
            initial={{ opacity: 0, x: 60 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: '0px 0px -10% 0px' }}
            transition={{ duration: 0.9, ease: CURVA, delay: Math.min(i, 4) * 0.08 }}
          >
            {scheda.immagine && typeof scheda.immagine === 'object' && (
              <Media
                fill
                resource={scheda.immagine}
                imgClassName="object-cover transition-transform duration-700 group-hover:scale-105"
                size="(min-width: 640px) 24rem, 82vw"
              />
            )}
            {/* Sfumatura dall'alto: il testo resta leggibile su qualsiasi immagine */}
            <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-black/75 via-black/20 to-transparent" />
            <div className="absolute inset-x-0 top-0 p-7 text-white">
              {scheda.occhiello && (
                <p className="mb-2 text-sm font-semibold tracking-wide text-cyan-300 uppercase">
                  {scheda.occhiello}
                </p>
              )}
              <h3 className="text-2xl leading-tight font-semibold tracking-tight">
                {scheda.titolo}
              </h3>
              {scheda.testo && (
                <p className="mt-3 text-base leading-snug text-white/80">{scheda.testo}</p>
              )}
              {scheda.conLink && scheda.link && (
                <CMSLink
                  {...scheda.link}
                  appearance="inline"
                  className="mt-4 inline-block font-semibold text-white underline-offset-4 hover:underline"
                />
              )}
            </div>
          </m.li>
        ))}
      </ul>
      <div className="container mt-6 flex justify-end gap-3">
        <button
          type="button"
          className={freccia}
          onClick={() => scorri(-1)}
          disabled={estremi.inizio}
          aria-label={t.precedente}
        >
          <ChevronLeft aria-hidden className="size-5" />
        </button>
        <button
          type="button"
          className={freccia}
          onClick={() => scorri(1)}
          disabled={estremi.fine}
          aria-label={t.successivo}
        >
          <ChevronRight aria-hidden className="size-5" />
        </button>
      </div>
    </section>
  )
}
