'use client'

import React, { useEffect, useRef } from 'react'

type Particella = { x: number; y: number; r: number; v: number; fase: number }

/**
 * Particelle luminose che salgono lente e ondeggiano, con luminosità che varia dolcemente
 * (nessun lampeggio). Si ferma fuori dallo schermo e con la scheda nascosta.
 * L'alone è disegnato una volta sola in un'immagine (sprite) e poi solo copiato: la sfocatura
 * del canvas (shadowBlur) su ogni punto a ogni fotogramma era il costo maggiore.
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
    // Sprite: punto luminoso con alone, disegnato una volta (raggio massimo 3,5 px + alone 8 px)
    const R = 12
    const dprSprite = Math.min(window.devicePixelRatio || 1, 2)
    const sprite = document.createElement('canvas')
    sprite.width = sprite.height = Math.ceil(R * 2 * dprSprite)
    const sc = sprite.getContext('2d')
    if (sc) {
      sc.scale(dprSprite, dprSprite)
      sc.fillStyle = colore
      sc.shadowColor = colore
      sc.shadowBlur = 8
      sc.beginPath()
      sc.arc(R, R, 3.5, 0, Math.PI * 2)
      sc.fill()
    }
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
      raf = 0
      const dt = Math.min(0.05, (t - ultimo) / 1000)
      ultimo = t
      if (!visibile || document.hidden) return // ripartirà da avvia()
      raf = requestAnimationFrame(disegna)
      ctx.clearRect(0, 0, w, h)
      for (const p of particelle) {
        p.y -= p.v * dt
        p.fase += dt * 0.8
        if (p.y < -10) Object.assign(p, nuova(true))
        // Luminosità tra 40% e 100% con un ciclo di alcuni secondi
        ctx.globalAlpha = alfa * (0.4 + 0.6 * (0.5 + 0.5 * Math.sin(p.fase)))
        // Lo sprite in scala con il raggio della particella (3,5 px = dimensione piena)
        const lato = (R * 2 * p.r) / 3.5
        ctx.drawImage(sprite, p.x + Math.sin(p.fase) * 6 - lato / 2, p.y - lato / 2, lato, lato)
      }
      ctx.globalAlpha = 1
    }
    const avvia = () => {
      if (raf || !visibile || document.hidden) return
      ultimo = performance.now()
      raf = requestAnimationFrame(disegna)
    }

    ridimensiona()
    const ro = new ResizeObserver(ridimensiona)
    ro.observe(canvas)
    const io = new IntersectionObserver(([voce]) => {
      visibile = voce?.isIntersecting ?? true
      avvia()
    })
    io.observe(canvas)
    document.addEventListener('visibilitychange', avvia)
    avvia()
    return () => {
      cancelAnimationFrame(raf)
      ro.disconnect()
      io.disconnect()
      document.removeEventListener('visibilitychange', avvia)
    }
  }, [colore, quante, velocita, alfa])

  return <canvas ref={canvasRef} aria-hidden className="pointer-events-none absolute inset-0 h-full w-full" />
}
