'use client'

import React, { useEffect, useRef } from 'react'
import { cn } from '@/utilities/ui'
import { useEffects } from '@/providers/Effects'

type Point = { x: number; y: number }
type Bolt = { pts: Point[]; born: number; life: number }

// Spezzata irregolare tra a e b: a ogni passo si sposta a caso il punto medio
function makeBolt(a: Point, b: Point, displace: number, steps = 6): Point[] {
  let pts: Point[] = [a, b]
  let d = displace
  for (let i = 0; i < steps; i++) {
    const next: Point[] = []
    for (let j = 0; j < pts.length - 1; j++) {
      const p = pts[j]!
      const q = pts[j + 1]!
      next.push(p, {
        x: (p.x + q.x) / 2 + (Math.random() - 0.5) * d,
        y: (p.y + q.y) / 2 + (Math.random() - 0.5) * d,
      })
    }
    next.push(pts[pts.length - 1]!)
    pts = next
    d /= 2
  }
  return pts
}

// "#rrggbb" -> [r, g, b]
const rgb = (hex: string) => [1, 3, 5].map((i) => parseInt(hex.slice(i, i + 2), 16))

type Props = {
  className?: string
  /** Punto di partenza delle scariche, in proporzione alla larghezza/altezza (0-1) */
  origin?: Point
  /** Colore dell'alone (#rrggbb); il nucleo è lo stesso colore schiarito. Predefinito: viola */
  colore?: string
  /** Moltiplica l'intervallo tra le scariche: >1 più lente, <1 più frequenti (mai sotto 0,7 s) */
  ritmo?: number
  /** Moltiplica la luminosità (0,5 bassa, 1 media, 1,4 alta) */
  intensita?: number
}

export const TeslaDischarge: React.FC<Props> = ({
  className,
  origin = { x: 0.72, y: 0.5 },
  colore = '#a855f7',
  ritmo = 1,
  intensita = 1,
}) => {
  const { enabled } = useEffects()
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    if (!enabled) return
    const canvas = canvasRef.current
    const ctx = canvas?.getContext('2d')
    if (!canvas || !ctx) return

    let w = 0
    let h = 0
    let raf = 0
    let visible = true
    let bolts: Bolt[] = []
    let nextAt = 0
    // Canvas già vuoto: tra una scarica e l'altra (quasi sempre) non si ridisegna nulla
    let vuoto = true

    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2)
      const rect = canvas.getBoundingClientRect()
      w = rect.width
      h = rect.height
      canvas.width = Math.round(w * dpr)
      canvas.height = Math.round(h * dpr)
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
    }

    const spawn = (t: number) => {
      const from = { x: w * origin.x, y: h * origin.y }
      const angle = Math.random() * Math.PI * 2
      const dist = Math.min(w, h) * (0.35 + Math.random() * 0.5)
      const to = { x: from.x + Math.cos(angle) * dist, y: from.y + Math.sin(angle) * dist }
      bolts.push({ pts: makeBolt(from, to, dist * 0.35), born: t, life: 300 + Math.random() * 200 })
    }

    // Alone del colore scelto e nucleo schiarito (70% verso il bianco)
    const [cr, cg, cb] = rgb(colore)
    const [nr, ng, nb] = [cr, cg, cb].map((c) => Math.round(c + (255 - c) * 0.7))

    const stroke = (pts: Point[], width: number, color: string, blur: number) => {
      ctx.beginPath()
      ctx.moveTo(pts[0]!.x, pts[0]!.y)
      for (let i = 1; i < pts.length; i++) ctx.lineTo(pts[i]!.x, pts[i]!.y)
      ctx.lineWidth = width
      ctx.strokeStyle = color
      ctx.shadowColor = colore
      ctx.shadowBlur = blur
      ctx.stroke()
    }

    const draw = (t: number) => {
      raf = 0
      if (!visible || document.hidden) return // ripartirà da avvia()
      raf = requestAnimationFrame(draw)

      // Al massimo una scarica ogni 0,7-2 secondi (x ritmo, mai più spesso di 0,7 s), ognuna con
      // dissolvenza morbida: niente lampeggi
      if (t >= nextAt) {
        spawn(t)
        nextAt = t + Math.max(700, (700 + Math.random() * 1300) * ritmo)
      }
      bolts = bolts.filter((b) => t - b.born < b.life)
      if (bolts.length === 0) {
        if (!vuoto) ctx.clearRect(0, 0, w, h)
        vuoto = true
        return
      }
      ctx.clearRect(0, 0, w, h)
      vuoto = false
      for (const b of bolts) {
        const fade = 1 - (t - b.born) / b.life
        const a = Math.min(1, intensita)
        stroke(b.pts, 5, `rgba(${cr}, ${cg}, ${cb}, ${Math.min(0.6, 0.35 * intensita) * fade})`, 18) // alone
        stroke(b.pts, 1.5, `rgba(${nr}, ${ng}, ${nb}, ${0.85 * a * fade})`, 6) // nucleo chiaro
      }
    }

    resize()
    const ro = new ResizeObserver(resize)
    ro.observe(canvas)
    // Fuori schermo o con la scheda nascosta il ciclo si ferma del tutto e riparte da qui
    const avvia = () => {
      if (raf || !visible || document.hidden) return
      raf = requestAnimationFrame(draw)
    }
    const io = new IntersectionObserver(([entry]) => {
      visible = entry?.isIntersecting ?? true
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
  }, [enabled, origin.x, origin.y, colore, ritmo, intensita])

  if (!enabled) return null

  return (
    <canvas
      ref={canvasRef}
      aria-hidden
      className={cn('pointer-events-none absolute inset-0 h-full w-full', className)}
    />
  )
}