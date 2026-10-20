'use client'

import {
  type MotionValue,
  motion,
  useMotionValueEvent,
  useReducedMotionConfig,
  useScroll,
  useTransform,
} from 'motion/react'
import React, { useRef } from 'react'

import type { ProdottoScorrimentoBlock as Props } from '@/payload-types'
import { Media } from '@/components/Media'
import { Rivela } from '@/components/Rivela'
import { mediaSrc } from '@/lib/api'
import { sezione } from '@/utilities/sezione'
import { cn } from '@/utilities/ui'

type Passaggio = NonNullable<Props['passaggi']>[number]

// Intervallo di scorrimento (0-1) di un passaggio, con una breve dissolvenza ai bordi
const intervallo = (i: number, n: number) => {
  const inizio = i / n
  const fine = (i + 1) / n
  const bordo = Math.min(0.06, 0.25 / n)
  return { inizio, fine, bordo }
}

// Punti tra 0 e 1 (Motion li passa alle animazioni native del browser, che non accettano altro)
const limita = (v: number) => Math.min(1, Math.max(0, v))

// Visibilità di un passaggio: il primo è già visibile all'inizio, l'ultimo resta alla fine.
// Le immagini si incrociano; i testi no (separati: prima esce uno, poi entra l'altro)
const useVisibilita = (
  avanzamento: MotionValue<number>,
  i: number,
  n: number,
  separati = false,
) => {
  const { inizio, fine, bordo } = intervallo(i, n)
  const punti = (
    separati
      ? [inizio, inizio + bordo, fine - bordo, fine]
      : [inizio - bordo, inizio + bordo, fine - bordo, fine + bordo]
  ).map(limita)
  const valori = [i === 0 ? 1 : 0, 1, 1, i === n - 1 ? 1 : 0]
  return useTransform(avanzamento, punti, valori)
}

const ImmaginePassaggio: React.FC<{
  p: Passaggio
  i: number
  n: number
  avanzamento: MotionValue<number>
}> = ({ p, i, n, avanzamento }) => {
  const opacita = useVisibilita(avanzamento, i, n)
  const { inizio, fine } = intervallo(i, n)
  // Si posa: parte un po' più grande e si assesta mentre il passaggio scorre
  const scala = useTransform(avanzamento, [inizio, fine], [1.12, 1])
  if (!p.immagine || typeof p.immagine !== 'object') return null
  return (
    <motion.div className="absolute inset-0" style={{ opacity: opacita, scale: scala }}>
      <Media
        fill
        resource={p.immagine}
        imgClassName="object-contain"
        size="(min-width: 1024px) 55vw, 100vw"
      />
    </motion.div>
  )
}

const TestoPassaggio: React.FC<{
  p: Passaggio
  i: number
  n: number
  avanzamento: MotionValue<number>
}> = ({ p, i, n, avanzamento }) => {
  const opacita = useVisibilita(avanzamento, i, n, true)
  const { inizio, bordo } = intervallo(i, n)
  const y = useTransform(
    avanzamento,
    [limita(inizio), limita(inizio + bordo)],
    [i === 0 ? 0 : 40, 0],
  )
  return (
    <motion.div
      className="absolute inset-x-0 top-1/2 -translate-y-1/2"
      style={{ opacity: opacita, y }}
    >
      <TestoStatico p={p} />
    </motion.div>
  )
}

const TestoStatico: React.FC<{ p: Passaggio }> = ({ p }) => (
  <div>
    {p.occhiello && (
      <p className="mb-3 text-sm font-semibold tracking-wide text-cyan-400 uppercase">
        {p.occhiello}
      </p>
    )}
    <h3 className="text-[length:var(--titolo-2)] leading-[1.05] font-semibold tracking-tight">
      {p.titolo}
    </h3>
    {p.testo && <p className="mt-5 max-w-md text-lg leading-relaxed opacity-70">{p.testo}</p>}
  </div>
)

// Video che avanza con lo scorrimento (es. render 3D del dispositivo esportato in MP4)
const VideoGuidato: React.FC<{ src: string; avanzamento: MotionValue<number> }> = ({
  src,
  avanzamento,
}) => {
  const video = useRef<HTMLVideoElement>(null)
  const inAttesa = useRef(false)
  useMotionValueEvent(avanzamento, 'change', (v) => {
    const el = video.current
    if (!el || !el.duration || inAttesa.current) return
    inAttesa.current = true
    requestAnimationFrame(() => {
      el.currentTime = Math.min(el.duration - 0.05, Math.max(0, v * el.duration))
      inAttesa.current = false
    })
  })
  return (
    <video
      ref={video}
      src={src}
      muted
      playsInline
      preload="auto"
      aria-hidden
      className="absolute inset-0 h-full w-full object-contain"
    />
  )
}

/**
 * Prodotto guidato dallo scorrimento: la sezione resta ferma sullo schermo (un'altezza di schermo
 * per passaggio) e, scorrendo, cambiano immagine e testo, oppure avanza il video.
 */
export const ProdottoScorrimentoBlock: React.FC<Props> = ({
  occhiello,
  titolo,
  sfondo,
  tipo,
  video,
  passaggi,
}) => {
  const ridotto = useReducedMotionConfig()
  const s = sezione(sfondo)
  const elenco = passaggi ?? []
  const n = Math.max(elenco.length, 1)
  const srcVideo =
    tipo === 'video' && video && typeof video === 'object' && video.url ? mediaSrc(video.url) : null

  const intestazione = (occhiello || titolo) && (
    <div className="container pt-24 pb-8 text-center md:pt-32">
      {occhiello && (
        <p className="mb-3 text-sm font-semibold tracking-wide text-cyan-400 uppercase">
          {occhiello}
        </p>
      )}
      {titolo && (
        <h2 className="mx-auto max-w-4xl text-[length:var(--titolo-1)] leading-[1.02] font-semibold tracking-tight">
          {titolo}
        </h2>
      )}
    </div>
  )

  // Movimento ridotto: le stesse immagini e testi, uno sotto l'altro, senza sezione fissata
  if (ridotto) {
    return (
      <section className={cn('pb-24', s.className)} data-theme={s['data-theme']}>
        {intestazione}
        <div className="container space-y-20">
          {elenco.map((p, i) => (
            <Rivela key={p.id ?? i} className="grid items-center gap-10 md:grid-cols-2">
              {p.immagine && typeof p.immagine === 'object' && (
                <Media
                  resource={p.immagine}
                  imgClassName="w-full h-auto"
                  size="(min-width: 768px) 50vw, 100vw"
                />
              )}
              <TestoStatico p={p} />
            </Rivela>
          ))}
        </div>
      </section>
    )
  }

  return (
    <section className={s.className} data-theme={s['data-theme']}>
      {intestazione}
      <Fissata elenco={elenco} n={n} srcVideo={srcVideo} />
    </section>
  )
}

// La parte fissata sullo schermo. Componente a sé: useScroll vuole il suo elemento sempre
// presente, e con il movimento ridotto non c'è
const Fissata: React.FC<{ elenco: Passaggio[]; n: number; srcVideo: string | null }> = ({
  elenco,
  n,
  srcVideo,
}) => {
  const contenitore = useRef<HTMLDivElement>(null)
  const { scrollYProgress } = useScroll({ target: contenitore, offset: ['start start', 'end end'] })
  return (
    <div ref={contenitore} className="relative" style={{ height: `${(n + 1) * 100}vh` }}>
      <div className="sticky top-0 flex h-screen items-center overflow-hidden">
        {/* Luce morbida dietro il prodotto */}
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_70%_50%,rgba(34,211,238,0.14),transparent_60%)]"
        />
        <div className="container relative grid h-full items-center gap-8 pt-20 md:grid-cols-[2fr_3fr]">
          <div className="relative order-2 h-[38vh] md:order-1 md:h-[50vh]">
            {elenco.map((p, i) => (
              <TestoPassaggio key={p.id ?? i} p={p} i={i} n={n} avanzamento={scrollYProgress} />
            ))}
          </div>
          <div className="relative order-1 h-[42vh] md:order-2 md:h-[75vh]">
            {srcVideo ? (
              <VideoGuidato src={srcVideo} avanzamento={scrollYProgress} />
            ) : (
              elenco.map((p, i) => (
                <ImmaginePassaggio
                  key={p.id ?? i}
                  p={p}
                  i={i}
                  n={n}
                  avanzamento={scrollYProgress}
                />
              ))
            )}
          </div>
        </div>
        {/* Avanzamento: un trattino per passaggio */}
        <div className="absolute bottom-8 left-1/2 flex -translate-x-1/2 gap-2" aria-hidden>
          {elenco.map((p, i) => (
            <Trattino key={p.id ?? i} i={i} n={n} avanzamento={scrollYProgress} />
          ))}
        </div>
      </div>
    </div>
  )
}

const Trattino: React.FC<{ i: number; n: number; avanzamento: MotionValue<number> }> = ({
  i,
  n,
  avanzamento,
}) => {
  const opacita = useTransform(useVisibilita(avanzamento, i, n), [0, 1], [0.25, 1])
  return <motion.span className="h-1 w-8 rounded-full bg-current" style={{ opacity: opacita }} />
}
