'use client'

import { Pause, Play } from 'lucide-react'
import React, { useEffect, useRef, useState, useSyncExternalStore } from 'react'

import type { Page } from '@/payload-types'
import { Media } from '@/components/Media'
import { mediaSrc } from '@/lib/api'
import { useConsenso } from '@/providers/Consenso'
import { codiceColore } from '@/utilities/sfondo'
import { idYouTube } from '@/utilities/youtube'
import { cn } from '@/utilities/ui'

// Le classi stanno scritte per intero: Tailwind non vede quelle costruite al volo
const INTENSITA = { nessuna: '', leggera: 'opacity-30', media: 'opacity-50', forte: 'opacity-70' } as const

// "Riduci movimento" del sistema: il video non parte da solo (sul server: falso)
const query = '(prefers-reduced-motion: reduce)'
const iscriviMovimento = (cb: () => void) => {
  const m = window.matchMedia(query)
  m.addEventListener('change', cb)
  return () => m.removeEventListener('change', cb)
}
const useRiduciMovimento = () =>
  useSyncExternalStore(
    iscriviMovimento,
    () => window.matchMedia(query).matches,
    () => false,
  )

type Props = Pick<Page['hero'], 'media' | 'sfondoMedia' | 'video' | 'overlay' | 'coloreOverlay'> & {
  // L'immagine la disegna già il chiamante (Banner con le proporzioni dell'immagine)
  senzaImmagine?: boolean
}

/**
 * Sfondo degli hero grandi: immagine o video (file della libreria, URL diretto o YouTube) a
 * riempire l'area, con la sovrapposizione colorata sopra. Il video parte muto e in loop e ha
 * sempre un pulsante pausa/riproduci (accessibilità: contenuti in movimento oltre 5 secondi).
 * YouTube si carica solo con il consenso ai contenuti esterni; senza, si vede l'immagine con un
 * pulsante per caricarlo una volta. Con "riduci movimento" il video non parte da solo.
 */
export const SfondoHero: React.FC<Props> = ({
  media,
  sfondoMedia,
  video,
  overlay,
  coloreOverlay,
  senzaImmagine = false,
}) => {
  const { scelte } = useConsenso()
  const riduciMovimento = useRiduciMovimento()
  const [inPausa, setInPausa] = useState<boolean | null>(null)
  const [youTubeChiesto, setYouTubeChiesto] = useState(false)
  const videoRef = useRef<HTMLVideoElement>(null)
  const iframeRef = useRef<HTMLIFrameElement>(null)

  // In pausa finché il visitatore non decide; con "riduci movimento" si parte fermi
  const fermo = inPausa ?? riduciMovimento
  const conVideo = sfondoMedia === 'video' && video
  const idYT = conVideo && video.sorgente === 'youtube' && video.url ? idYouTube(video.url) : null
  const youTubeAttivo = Boolean(idYT) && (scelte.esterni || youTubeChiesto)
  const srcVideo =
    conVideo && video.sorgente === 'file' && video.file && typeof video.file === 'object'
      ? mediaSrc(video.file.url)
      : conVideo && video.sorgente === 'url'
        ? video.url
        : null

  // Comando all'iframe di YouTube (API via postMessage, attiva con enablejsapi=1)
  const comandoYouTube = (pausa: boolean) =>
    iframeRef.current?.contentWindow?.postMessage(
      JSON.stringify({ event: 'command', func: pausa ? 'pauseVideo' : 'playVideo', args: [] }),
      '*',
    )

  // Pausa e ripresa: elemento <video> oppure comandi a YouTube. L'indirizzo dell'iframe non
  // cambia con la pausa, altrimenti YouTube ricaricherebbe il video mostrando la copertina
  useEffect(() => {
    if (videoRef.current) {
      if (fermo) videoRef.current.pause()
      else void videoRef.current.play().catch(() => {})
    }
    comandoYouTube(fermo)
  }, [fermo, srcVideo, youTubeAttivo])

  const poster = media && typeof media === 'object' ? mediaSrc(media.url) : undefined
  const mostraImmagine = !senzaImmagine && !srcVideo && !youTubeAttivo
  const intensita = overlay ?? 'nessuna'

  return (
    <>
      {mostraImmagine && media && typeof media === 'object' && (
        <Media fill pictureClassName="absolute inset-0" imgClassName="object-cover" priority resource={media} />
      )}

      {srcVideo && (
        <video
          ref={videoRef}
          className="absolute inset-0 h-full w-full object-cover"
          src={srcVideo}
          poster={poster}
          muted
          loop
          playsInline
          autoPlay={!fermo}
          aria-hidden
        />
      )}

      {idYT && youTubeAttivo && (
        // Riempie l'area come object-cover: l'iframe 16:9 è grande almeno quanto il contenitore
        <div className="absolute inset-0 overflow-hidden" style={{ containerType: 'size' }} aria-hidden>
          <iframe
            ref={iframeRef}
            title="Video di sfondo"
            src={`https://www.youtube-nocookie.com/embed/${idYT}?autoplay=${riduciMovimento ? 0 : 1}&mute=1&loop=1&playlist=${idYT}&controls=0&playsinline=1&rel=0&modestbranding=1&enablejsapi=1`}
            // Appena pronto riceve lo stato attuale (es. messo in pausa durante il caricamento)
            onLoad={() => comandoYouTube(fermo)}
            allow="autoplay; encrypted-media"
            className="pointer-events-none absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 border-0"
            style={{ width: 'max(100cqw, 177.78cqh)', height: 'max(100cqh, 56.25cqw)' }}
            tabIndex={-1}
          />
        </div>
      )}

      {intensita !== 'nessuna' && (
        <div
          aria-hidden
          className={cn('pointer-events-none absolute inset-0', INTENSITA[intensita])}
          style={{ backgroundColor: codiceColore(coloreOverlay) ?? '#000000' }}
        />
      )}

      {idYT && !youTubeAttivo && (
        <button
          type="button"
          onClick={() => setYouTubeChiesto(true)}
          className="absolute bottom-4 right-4 z-20 inline-flex items-center gap-2 rounded-full bg-black/70 px-4 py-2 text-sm text-white hover:bg-black/80"
        >
          <Play className="h-4 w-4" aria-hidden />
          Guarda il video (YouTube)
        </button>
      )}

      {(srcVideo || youTubeAttivo) && (
        <button
          type="button"
          onClick={() => setInPausa(!fermo)}
          aria-label={fermo ? 'Riproduci il video' : 'Metti in pausa il video'}
          className="absolute bottom-4 right-4 z-20 inline-flex h-10 w-10 items-center justify-center rounded-full bg-black/60 text-white hover:bg-black/80"
        >
          {fermo ? <Play className="h-4 w-4" /> : <Pause className="h-4 w-4" />}
        </button>
      )}
    </>
  )
}
