'use client'

import React, { useEffect, useRef } from 'react'

type Particella = { x: number; y: number; r: number; v: number; fase: number }

/**
 * Particelle luminose che salgono lente e ondeggiano, con luminosità che varia dolcemente
 * (nessun lampeggio). Si ferma fuori dallo schermo e con la scheda nascosta.
 */
export const Particelle: React.FC<{ colore: string; quante: number; velocita: number; alfa: number }> = ({
  colore,
  quante,
  velocita,
  alfa,
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    const ctx = canvas?.getContext('2d')
    if (!canvas || !ctx) return
    let w = 0
    let h = 0
    let raf = 0
    let visibile = true
    let ultimo = 0
    let particelle: Particella[] = []

    const nuova = (inBasso: boolean): Particella => ({
      x: Math.random() * w,
      y: inBasso ? h + 10 : Math.random() * h,
      r: 1 + Math.random() * 2.5,
      v: (8 + Math.random() * 18) * velocita,
      fase: Math.random() * Math.PI * 2,
    })

    const ridimensiona = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2)
      const rect = canvas.getBoundingClientRect()
      w = rect.width
      h = rect.height
      canvas.width = Math.round(w * dpr)
      canvas.height = Math.round(h * dpr)
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
      particelle = Array.from({ length: quante }, () => nuova(false))
    }

    const disegna = (t: number) => {
      raf = requestAnimationFrame(disegna)
      const dt = Math.min(0.05, (t - ultimo) / 1000)
      ultimo = t
      if (!visibile || document.hidden) return
      ctx.clearRect(0, 0, w, h)
      ctx.fillStyle = colore
      ctx.shadowColor = colore
      ctx.shadowBlur = 8
      for (const p of particelle) {
        p.y -= p.v * dt
        p.fase += dt * 0.8
        if (p.y < -10) Object.assign(p, nuova(true))
        // Luminosità tra 40% e 100% con un ciclo di alcuni secondi
        ctx.globalAlpha = alfa * (0.4 + 0.6 * (0.5 + 0.5 * Math.sin(p.fase)))
        ctx.beginPath()
        ctx.arc(p.x + Math.sin(p.fase) * 6, p.y, p.r, 0, Math.PI * 2)
        ctx.fill()
      }
      ctx.globalAlpha = 1
    }

    ridimensiona()
    const ro = new ResizeObserver(ridimensiona)
    ro.observe(canvas)
    const io = new IntersectionObserver(([voce]) => {
      visibile = voce?.isIntersecting ?? true
    })
    io.observe(canvas)
    raf = requestAnimationFrame(disegna)
    return () => {
      cancelAnimationFrame(raf)
      ro.disconnect()
      io.disconnect()
    }
  }, [colore, quante, velocita, alfa])

  return <canvas ref={canvasRef} aria-hidden className="pointer-events-none absolute inset-0 h-full w-full" />
}
