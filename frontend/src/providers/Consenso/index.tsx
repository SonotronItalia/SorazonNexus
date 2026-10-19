'use client'

import React, { createContext, useCallback, useContext, useMemo, useState, useSyncExternalStore } from 'react'

import { CONSENSO } from './costanti'

/**
 * Consenso ai cookie (linee guida del Garante privacy, 2021).
 * - Categorie facoltative: statistiche (Google Analytics), marketing (Google Ads) e contenuti
 *   esterni (video YouTube, Google Maps). I cookie tecnici non chiedono consenso.
 * - La scelta vale 6 mesi; cambiando VERSIONE (es. nuove categorie) si chiede di nuovo.
 * - Si salva nel browser (localStorage, chiave "sorazon-consenso"); sul server e durante
 *   l'idratazione lo stato è "sconosciuto": il banner compare solo dopo, senza differenze.
 */

export type Scelte = { statistiche: boolean; marketing: boolean; esterni: boolean }
type Salvato = Scelte & { versione: number; data: string }

const { CHIAVE, EVENTO, VERSIONE, DURATA_MS } = CONSENSO

export const NESSUNA_SCELTA: Scelte = { statistiche: false, marketing: false, esterni: false }

// Copia in memoria per i browser che bloccano localStorage (la scelta vale per la visita)
let inMemoria = ''

// Testo salvato così com'è: useSyncExternalStore confronta stringhe, non oggetti nuovi
const leggi = () => {
  try {
    // Se localStorage funziona vale solo lui (anche quando la scelta è stata cancellata)
    return localStorage.getItem(CHIAVE) ?? ''
  } catch {
    return inMemoria
  }
}

const valido = (testo: string): Salvato | null => {
  if (!testo) return null
  try {
    const s = JSON.parse(testo) as Salvato
    if (s.versione !== VERSIONE || Date.now() - Date.parse(s.data) > DURATA_MS) return null
    return s
  } catch {
    return null
  }
}

const iscrivi = (callback: () => void) => {
  window.addEventListener(EVENTO, callback)
  window.addEventListener('storage', callback)
  return () => {
    window.removeEventListener(EVENTO, callback)
    window.removeEventListener('storage', callback)
  }
}

// Sul server non si sa nulla: niente banner, niente contenuti esterni
const SUL_SERVER = '__server__'

type ContestoConsenso = {
  // "sconosciuto": server o idratazione; "da-chiedere": nessuna scelta valida; "dato": scelta valida
  stato: 'sconosciuto' | 'da-chiedere' | 'dato'
  scelte: Scelte
  salva: (scelte: Scelte) => void
  preferenzeAperte: boolean
  apriPreferenze: () => void
  chiudiPreferenze: () => void
}

const Contesto = createContext<ContestoConsenso>({
  stato: 'sconosciuto',
  scelte: NESSUNA_SCELTA,
  salva: () => {},
  preferenzeAperte: false,
  apriPreferenze: () => {},
  chiudiPreferenze: () => {},
})

export const useConsenso = () => useContext(Contesto)

export const ConsensoProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const testo = useSyncExternalStore(iscrivi, leggi, () => SUL_SERVER)
  const [preferenzeAperte, setPreferenzeAperte] = useState(false)

  const salva = useCallback((scelte: Scelte) => {
    const s: Salvato = { ...scelte, versione: VERSIONE, data: new Date().toISOString() }
    inMemoria = JSON.stringify(s)
    try {
      localStorage.setItem(CHIAVE, inMemoria)
    } catch {}
    setPreferenzeAperte(false)
    window.dispatchEvent(new Event(EVENTO))
  }, [])

  const valore = useMemo<ContestoConsenso>(() => {
    const salvato = testo === SUL_SERVER ? null : valido(testo)
    return {
      stato: testo === SUL_SERVER ? 'sconosciuto' : salvato ? 'dato' : 'da-chiedere',
      scelte: salvato
        ? { statistiche: salvato.statistiche, marketing: salvato.marketing, esterni: salvato.esterni }
        : NESSUNA_SCELTA,
      salva,
      preferenzeAperte,
      apriPreferenze: () => setPreferenzeAperte(true),
      chiudiPreferenze: () => setPreferenzeAperte(false),
    }
  }, [testo, salva, preferenzeAperte])

  return <Contesto value={valore}>{children}</Contesto>
}
