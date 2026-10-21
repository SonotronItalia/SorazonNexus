'use client'

import { Monitor, Moon, Sun } from 'lucide-react'
import React, { useSyncExternalStore } from 'react'

import { useLingua } from '@/providers/Lingua'
import { cn } from '@/utilities/ui'

import { useTheme } from '..'
import { getThemePreference, subscribeTheme } from '../shared'

// Sul server la scelta non si conosce: nessuna icona evidenziata fino all'idratazione
const getServerPreference = () => ''

/**
 * Tema del sito con tre icone affiancate (automatico, chiaro, scuro): un clic e niente librerie
 * per il menu a tendina. Colori da currentColor, così va bene su header, menu e piè di pagina nero.
 */
export const ThemeSelector: React.FC = () => {
  const { setTheme } = useTheme()
  // Letto da localStorage; setTheme avvisa del cambio e il valore si aggiorna da solo
  const value = useSyncExternalStore(subscribeTheme, getThemePreference, getServerPreference)
  const { t } = useLingua()

  const voci = [
    { valore: 'auto', etichetta: t.temaAuto, Icona: Monitor },
    { valore: 'light', etichetta: t.temaChiaro, Icona: Sun },
    { valore: 'dark', etichetta: t.temaScuro, Icona: Moon },
  ] as const

  return (
    <div
      role="group"
      aria-label={t.tema}
      className="inline-flex items-center gap-0.5 rounded-full bg-current/[0.07] p-1"
    >
      {voci.map(({ valore, etichetta, Icona }) => {
        const attivo = value === valore
        return (
          <button
            key={valore}
            type="button"
            aria-pressed={attivo}
            aria-label={`${t.tema}: ${etichetta}`}
            title={etichetta}
            onClick={() => setTheme(valore === 'auto' ? null : valore)}
            className={cn(
              'inline-flex size-8 items-center justify-center rounded-full transition-colors',
              attivo ? 'bg-current/15 opacity-100' : 'opacity-60 hover:opacity-100',
            )}
          >
            <Icona className="size-4" aria-hidden />
          </button>
        )
      })}
    </div>
  )
}
