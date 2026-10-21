import { Inter_Tight } from 'next/font/google'
import type { Payload } from 'payload'
import React from 'react'

import { CSS_TEMA } from './tema'

// Stesso carattere del sito, servito dal backend (nessuna richiesta a Google dal browser)
const interTight = Inter_Tight({ subsets: ['latin'], display: 'swap' })

/**
 * Aspetto Sorazon del pannello: colori del marchio, carattere del sito, angoli più morbidi.
 * Si accende e si spegne da Impostazioni del sito > Marchio ("Aspetto Sorazon del pannello",
 * solo amministratori): spento, il pannello torna quello standard di Payload senza toccare il
 * codice. Inserito in ogni pagina del pannello (admin.components.header) e nella pagina di
 * accesso (insieme al logo). Lo stile usa le variabili del tema di Payload; dopo un
 * aggiornamento di Payload va ricontrollato a vista (docs/tecnica/cms.md).
 */
export const TemaPannello = async ({ payload }: { payload?: Payload }) => {
  if (!payload) return null
  let acceso = true
  try {
    const { marchio } = await payload.findGlobal({ slug: 'impostazioni', depth: 0 })
    acceso = marchio?.pannelloSorazon !== false
  } catch {
    // Impostazioni non leggibili (es. database appena creato): tema acceso
  }
  if (!acceso) return null
  return <style dangerouslySetInnerHTML={{ __html: CSS_TEMA(interTight.style.fontFamily) }} />
}
