'use client'

import { MapPin } from 'lucide-react'
import React, { useState } from 'react'

import type { MappaBlock as MappaProps } from '@/payload-types'
import { SezioneSfondo } from '@/components/SezioneSfondo'
import { Button } from '@/components/ui/button'
import { useConsenso } from '@/providers/Consenso'
import { cn } from '@/utilities/ui'

// Le classi stanno scritte per intero: Tailwind non vede quelle costruite al volo
const ALTEZZE = {
  bassa: 'h-64',
  media: 'h-96',
  alta: 'h-[32rem]',
} as const

/**
 * Mappa di Google Maps caricata solo con il consenso ai contenuti esterni (banner dei cookie)
 * o su richiesta del visitatore per questa sola mappa: Google imposta cookie, quindi prima si
 * mostra un riquadro con l'indirizzo, il pulsante e il collegamento esterno.
 * Usa l'incorporamento senza chiave API (nessun costo e nessun account Google Cloud).
 */
export const MappaBlock: React.FC<MappaProps> = ({ titolo, indirizzo, altezza, sfondo }) => {
  const [caricata, setCaricata] = useState(false)
  // Con il consenso ai contenuti esterni (banner dei cookie) la mappa si carica da sola
  const { scelte } = useConsenso()
  const query = encodeURIComponent(indirizzo)

  return (
    <SezioneSfondo sfondo={sfondo}>
      <section className="container">
        {titolo && (
          <h2 className="mb-8 text-[length:var(--titolo-2)] leading-tight font-semibold tracking-tight">
            {titolo}
          </h2>
        )}
        <div
          className={cn(
            'overflow-hidden rounded-[28px] border bg-muted',
            ALTEZZE[altezza ?? 'media'],
          )}
        >
          {caricata || scelte.esterni ? (
            <iframe
              title={`Mappa: ${indirizzo}`}
              src={`https://www.google.com/maps?q=${query}&output=embed`}
              className="h-full w-full border-0"
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              allowFullScreen
            />
          ) : (
            <div className="flex h-full flex-col items-center justify-center gap-4 p-6 text-center">
              <MapPin className="h-8 w-8 text-muted-foreground" aria-hidden />
              <p className="font-medium">{indirizzo}</p>
              <Button type="button" onClick={() => setCaricata(true)}>
                Mostra la mappa
              </Button>
              <p className="max-w-sm text-xs text-muted-foreground">
                La mappa è fornita da Google, che può impostare cookie sul tuo dispositivo.{' '}
                <a
                  className="underline underline-offset-2"
                  href={`https://www.google.com/maps/search/?api=1&query=${query}`}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Apri in Google Maps
                </a>
              </p>
            </div>
          )}
        </div>
      </section>
    </SezioneSfondo>
  )
}
