'use client'

import { X } from 'lucide-react'
import Link from 'next/link'
import React, { useState } from 'react'

import { Button } from '@/components/ui/button'
import { NESSUNA_SCELTA, type Scelte, useConsenso } from '@/providers/Consenso'
import { categorieGoogle, type ConfigGoogle } from '@/utilities/google'
import { useLingua } from '@/providers/Lingua'
import { conPrefisso } from '@/utilities/lingue'

type Categoria = { chiave: keyof Scelte; titolo: string; descrizione: string }

/**
 * Banner dei cookie (linee guida del Garante, 2021): "Rifiuta" e "Accetta tutti" con lo stesso
 * peso, "Personalizza" per scegliere per categoria, la X equivale a rifiutare (restano solo i
 * cookie tecnici). Compare finché non c'è una scelta valida o quando si riaprono le preferenze.
 * Le categorie di Google compaiono solo se il relativo ID è configurato.
 */
export const CookieBanner: React.FC<{ google: ConfigGoogle }> = ({ google }) => {
  const { statistiche, marketing } = categorieGoogle(google)
  const { stato, scelte, salva, preferenzeAperte, chiudiPreferenze } = useConsenso()
  const [dettaglio, setDettaglio] = useState(false)
  const [bozza, setBozza] = useState<Scelte>(NESSUNA_SCELTA)
  const { lingua, t } = useLingua()

  const categorie: Categoria[] = [
    ...(statistiche
      ? [
          {
            chiave: 'statistiche' as const,
            titolo: t.cookieStatistiche,
            descrizione: google.gtmId ? t.cookieStatisticheGtm : t.cookieStatisticheGa,
          },
        ]
      : []),
    ...(marketing
      ? [
          {
            chiave: 'marketing' as const,
            titolo: t.cookieMarketing,
            descrizione: google.gtmId ? t.cookieMarketingGtm : t.cookieMarketingAds,
          },
        ]
      : []),
    {
      chiave: 'esterni',
      titolo: t.cookieEsterni,
      descrizione: t.cookieEsterniTesto,
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
      aria-label={t.cookieRegione}
      className="fixed inset-x-0 bottom-0 z-50 p-4 md:p-6"
    >
      <div className="relative mx-auto max-w-3xl rounded-lg border bg-card p-5 text-card-foreground shadow-xl md:p-6">
        <button
          type="button"
          onClick={() => (stato === 'dato' ? chiudiPreferenze() : rifiuta())}
          aria-label={stato === 'dato' ? t.cookieChiudi : t.cookieChiudiRifiuta}
          className="absolute right-3 top-3 inline-flex h-8 w-8 items-center justify-center rounded-md hover:bg-muted"
        >
          <X className="h-4 w-4" />
        </button>

        <h2 className="pr-8 text-lg font-semibold">{t.cookieTitolo}</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          {t.cookieTesto1} {categorie.map((c) => c.titolo.toLowerCase()).join(', ')}.{' '}
          {t.cookieTesto2}{' '}
          {/* Cookie policy nella lingua della pagina (senza traduzione: la versione italiana) */}
          <Link
            href={conPrefisso(lingua, '/cookie-policy')}
            className="underline underline-offset-2"
          >
            {t.cookiePolicy}
          </Link>
          .
        </p>

        {dettaglio && (
          <ul className="mt-4 space-y-3 border-t pt-4">
            <li className="flex items-start justify-between gap-4">
              <div>
                <p className="text-sm font-medium">{t.cookieNecessari}</p>
                <p className="text-sm text-muted-foreground">{t.cookieNecessariTesto}</p>
              </div>
              <input
                type="checkbox"
                checked
                disabled
                aria-label={t.cookieNecessariSempre}
                className="mt-1 h-4 w-4"
              />
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
              {t.cookieSalva}
            </Button>
          ) : (
            <Button type="button" variant="outline" onClick={apriDettaglio}>
              {t.cookiePersonalizza}
            </Button>
          )}
          {/* Stesso peso visivo per rifiutare e accettare */}
          <Button type="button" onClick={rifiuta}>
            {t.cookieRifiuta}
          </Button>
          <Button type="button" onClick={accettaTutto}>
            {t.cookieAccetta}
          </Button>
        </div>
      </div>
    </section>
  )
}

// Collegamento nel footer per riaprire le preferenze
export const PreferenzeCookie: React.FC<{ className?: string }> = ({ className }) => {
  const { apriPreferenze } = useConsenso()
  const { t } = useLingua()
  return (
    <button type="button" onClick={apriPreferenze} className={className}>
      {t.cookiePreferenze}
    </button>
  )
}
