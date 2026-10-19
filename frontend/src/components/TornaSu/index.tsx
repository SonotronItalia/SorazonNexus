'use client'

import { ArrowUp, ArrowUpToLine, ChevronsUp, ChevronUp } from 'lucide-react'
import React, { useSyncExternalStore } from 'react'

import type { TornaSu as Impostazioni } from '@/payload-types'
import { useRiduciMovimento } from '@/utilities/riduciMovimento'
import { codiceColore, scuro } from '@/utilities/sfondo'
import { cn } from '@/utilities/ui'

// Le classi stanno scritte per intero: Tailwind non vede quelle costruite al volo
const ICONA = { freccia: ArrowUp, punta: ChevronUp, doppia: ChevronsUp, riga: ArrowUpToLine } as const
const POSIZIONE = {
  destra: 'right-4 md:right-6',
  sinistra: 'left-4 md:left-6',
  centro: 'left-1/2 -translate-x-1/2',
} as const
const FORMA = { cerchio: 'rounded-full', quadrato: 'rounded-xl' } as const
const DIMENSIONE = {
  piccola: { pulsante: 'size-10', icona: 'size-4' },
  media: { pulsante: 'size-12', icona: 'size-5' },
  grande: { pulsante: 'size-14', icona: 'size-6' },
} as const
// Di quanto bisogna scorrere prima che compaia, in frazioni dell'altezza dello schermo
const SOGLIA = { breve: 0.25, mezzo: 0.5, schermo: 1 } as const

// Vale true quando la pagina è scorsa oltre la soglia (false sul server e all'idratazione)
const useOltre = (frazione: number) =>
  useSyncExternalStore(
    (avvisa) => {
      window.addEventListener('scroll', avvisa, { passive: true })
      window.addEventListener('resize', avvisa)
      return () => {
        window.removeEventListener('scroll', avvisa)
        window.removeEventListener('resize', avvisa)
      }
    },
    () => window.scrollY > window.innerHeight * frazione,
    () => false,
  )

/**
 * Pulsante "torna su" (sezione "Pulsante torna su" dell'admin). Compare scorrendo la pagina,
 * riporta in cima con uno scorrimento morbido (immediato con "riduci movimento") e sposta il
 * focus all'inizio della pagina per chi usa la tastiera. Il banner dei cookie gli sta sopra.
 */
export const TornaSu: React.FC<{ impostazioni: Impostazioni }> = ({ impostazioni: i }) => {
  const visibile = useOltre(SOGLIA[i.comparsa ?? 'schermo'])
  const riduciMovimento = useRiduciMovimento()
  if (i.attivo === false) return null

  const Icona = ICONA[i.icona ?? 'freccia']
  const misura = DIMENSIONE[i.dimensione ?? 'media']
  const codice = codiceColore(i.colore)

  const vaiSu = () => {
    window.scrollTo({ top: 0, behavior: riduciMovimento ? 'auto' : 'smooth' })
    document.body.setAttribute('tabindex', '-1')
    document.body.focus({ preventScroll: true })
    document.body.removeAttribute('tabindex')
  }

  return (
    <button
      type="button"
      onClick={vaiSu}
      aria-label="Torna in cima alla pagina"
      title="Torna in cima"
      aria-hidden={!visibile}
      tabIndex={visibile ? 0 : -1}
      className={cn(
        'fixed bottom-[calc(1rem+env(safe-area-inset-bottom))] z-40 inline-flex items-center justify-center shadow-lg ring-1 ring-black/10 transition-[opacity,transform] duration-300 hover:scale-105 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring md:bottom-6 motion-reduce:transition-none',
        POSIZIONE[i.posizione ?? 'destra'],
        FORMA[i.forma ?? 'cerchio'],
        misura.pulsante,
        codice ? '' : 'bg-foreground text-background',
        i.telefono === false && 'max-md:hidden',
        visibile ? 'opacity-100' : 'pointer-events-none translate-y-3 opacity-0',
      )}
      style={codice ? { backgroundColor: codice, color: scuro(codice) ? '#ffffff' : '#0a0a0a' } : undefined}
    >
      <Icona aria-hidden className={misura.icona} strokeWidth={2.25} />
    </button>
  )
}
