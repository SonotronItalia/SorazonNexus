'use client'

import { X } from 'lucide-react'
import Link from 'next/link'
import React, { useState } from 'react'

import { Button } from '@/components/ui/button'
import { NESSUNA_SCELTA, type Scelte, useConsenso } from '@/providers/Consenso'

type Categoria = { chiave: keyof Scelte; titolo: string; descrizione: string }

/**
 * Banner dei cookie (linee guida del Garante, 2021): "Rifiuta" e "Accetta tutti" con lo stesso
 * peso, "Personalizza" per scegliere per categoria, la X equivale a rifiutare (restano solo i
 * cookie tecnici). Compare finché non c'è una scelta valida o quando si riaprono le preferenze.
 * Le categorie di Google compaiono solo se il relativo ID è configurato.
 */
export const CookieBanner: React.FC<{ gaId?: string; adsId?: string }> = ({ gaId, adsId }) => {
  const { stato, scelte, salva, preferenzeAperte, chiudiPreferenze } = useConsenso()
  const [dettaglio, setDettaglio] = useState(false)
  const [bozza, setBozza] = useState<Scelte>(NESSUNA_SCELTA)

  const categorie: Categoria[] = [
    ...(gaId
      ? [
          {
            chiave: 'statistiche' as const,
            titolo: 'Statistiche',
            descrizione:
              'Google Analytics: conteggio anonimo delle visite e delle pagine viste, per migliorare il sito.',
          },
        ]
      : []),
    ...(adsId
      ? [
          {
            chiave: 'marketing' as const,
            titolo: 'Marketing',
            descrizione:
              'Google Ads: misura dei risultati delle campagne pubblicitarie e annunci personalizzati.',
          },
        ]
      : []),
    {
      chiave: 'esterni',
      titolo: 'Contenuti esterni',
      descrizione:
        'Video di YouTube e mappe di Google Maps incorporati nelle pagine: questi servizi possono impostare propri cookie.',
    },
  ]

  const visibile = stato === 'da-chiedere' || (stato === 'dato' && preferenzeAperte)
  if (!visibile) return null

  const tutte = Object.fromEntries(categorie.map((c) => [c.chiave, true])) as Partial<Scelte>
  // Dopo ogni scelta il pannello, se riaperto, riparte dalla vista breve
  const conferma = (nuove: Scelte) => {
    setDettaglio(false)
    salva(nuove)
  }
  const rifiuta = () => conferma(NESSUNA_SCELTA)
  const accettaTutto = () => conferma({ ...NESSUNA_SCELTA, ...tutte })
  const apriDettaglio = () => {
    setBozza(scelte)
    setDettaglio(true)
  }

  return (
    <section
      role="region"
      aria-label="Preferenze sui cookie"
      className="fixed inset-x-0 bottom-0 z-50 p-4 md:p-6"
    >
      <div className="relative mx-auto max-w-3xl rounded-lg border bg-card p-5 text-card-foreground shadow-xl md:p-6">
        <button
          type="button"
          onClick={() => (stato === 'dato' ? chiudiPreferenze() : rifiuta())}
          aria-label={stato === 'dato' ? 'Chiudi' : 'Chiudi e rifiuta i cookie facoltativi'}
          className="absolute right-3 top-3 inline-flex h-8 w-8 items-center justify-center rounded-md hover:bg-muted"
        >
          <X className="h-4 w-4" />
        </button>

        <h2 className="pr-8 text-lg font-semibold">Questo sito usa i cookie</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          Usiamo cookie tecnici, necessari al funzionamento del sito, e, solo con il tuo consenso,
          cookie facoltativi per {categorie.map((c) => c.titolo.toLowerCase()).join(', ')}. Puoi
          accettarli, rifiutarli o scegliere per categoria; chiudendo con la X li rifiuti. Puoi
          cambiare idea in qualsiasi momento da &ldquo;Preferenze cookie&rdquo; in fondo alla
          pagina. Dettagli nella{' '}
          <Link href="/cookie-policy" className="underline underline-offset-2">
            cookie policy
          </Link>
          .
        </p>

        {dettaglio && (
          <ul className="mt-4 space-y-3 border-t pt-4">
            <li className="flex items-start justify-between gap-4">
              <div>
                <p className="text-sm font-medium">Necessari</p>
                <p className="text-sm text-muted-foreground">
                  Tema chiaro/scuro, effetti grafici e questa scelta. Sempre attivi.
                </p>
              </div>
              <input type="checkbox" checked disabled aria-label="Necessari, sempre attivi" className="mt-1 h-4 w-4" />
            </li>
            {categorie.map((c) => (
              <li key={c.chiave} className="flex items-start justify-between gap-4">
                <label htmlFor={`consenso-${c.chiave}`}>
                  <span className="block text-sm font-medium">{c.titolo}</span>
                  <span className="block text-sm text-muted-foreground">{c.descrizione}</span>
                </label>
                <input
                  id={`consenso-${c.chiave}`}
                  type="checkbox"
                  checked={bozza[c.chiave]}
                  onChange={(e) => setBozza({ ...bozza, [c.chiave]: e.target.checked })}
                  className="mt-1 h-4 w-4 accent-current"
                />
              </li>
            ))}
          </ul>
        )}

        <div className="mt-5 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
          {dettaglio ? (
            <Button type="button" variant="outline" onClick={() => conferma(bozza)}>
              Salva le scelte
            </Button>
          ) : (
            <Button type="button" variant="outline" onClick={apriDettaglio}>
              Personalizza
            </Button>
          )}
          {/* Stesso peso visivo per rifiutare e accettare */}
          <Button type="button" onClick={rifiuta}>
            Rifiuta
          </Button>
          <Button type="button" onClick={accettaTutto}>
            Accetta tutti
          </Button>
        </div>
      </div>
    </section>
  )
}

// Collegamento nel footer per riaprire le preferenze
export const PreferenzeCookie: React.FC<{ className?: string }> = ({ className }) => {
  const { apriPreferenze } = useConsenso()
  return (
    <button type="button" onClick={apriPreferenze} className={className}>
      Preferenze cookie
    </button>
  )
}
