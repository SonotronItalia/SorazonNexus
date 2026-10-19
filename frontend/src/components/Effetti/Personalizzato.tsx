'use client'

import React, { useMemo } from 'react'

import type { TipiEffetto } from '@/payload-types'

type Parametri = {
  colore: string
  intensita: number
  velocita: number
  puntoX: number
  puntoY: number
}

// Il codice non deve poter chiudere i propri tag e "uscire" dal documento dell'iframe
const neutralizza = (codice: string, tag: 'script' | 'style') =>
  codice.replace(new RegExp(`</${tag}`, 'gi'), `<\\/${tag}`)

/**
 * Tipo di effetto personalizzato (sezione "Tipi di effetto"): CSS e JavaScript scritti
 * nell'admin girano in un iframe sandbox SENZA allow-same-origin, quindi senza accesso alla
 * pagina, ai cookie, a localStorage o ai dati del visitatore; la Content Security Policy del
 * documento blocca qualsiasi richiesta in rete (niente script, immagini o font esterni).
 * Riceve un <canvas id="effetto"> a tutta area e i parametri in window.EFFETTO.
 */
export const Personalizzato: React.FC<{ tipo: TipiEffetto; parametri: Parametri }> = ({
  tipo,
  parametri,
}) => {
  const documento = useMemo(
    () => `<!doctype html><html><head><meta charset="utf-8">
<meta http-equiv="Content-Security-Policy" content="default-src 'none'; script-src 'unsafe-inline'; style-src 'unsafe-inline'; img-src data: blob:">
<meta name="color-scheme" content="light dark">
<style>html,body{margin:0;width:100%;height:100%;overflow:hidden;background:transparent}#effetto{display:block;position:absolute;inset:0;width:100%;height:100%}</style>
<style>${neutralizza(tipo.css ?? '', 'style')}</style>
</head><body><canvas id="effetto"></canvas>
<script>window.EFFETTO=Object.freeze(${JSON.stringify(parametri).replace(/</g, '\\u003c')});</script>
<script>${neutralizza(tipo.javascript ?? '', 'script')}</script>
</body></html>`,
    [tipo.css, tipo.javascript, parametri],
  )

  return (
    <iframe
      title=""
      aria-hidden
      tabIndex={-1}
      sandbox="allow-scripts"
      srcDoc={documento}
      className="pointer-events-none absolute inset-0 h-full w-full border-0"
      // Trasparente anche quando il tema del sito e quello dell'iframe non coincidono
      style={{ colorScheme: 'light dark', background: 'transparent' }}
    />
  )
}
