'use client'

import { createClientFeature } from '@payloadcms/richtext-lexical/client'
import {
  $getSelection,
  $isRangeSelection,
  type LexicalEditor,
} from '@payloadcms/richtext-lexical/lexical'
import { $patchStyleText } from '@payloadcms/richtext-lexical/lexical/selection'
import { useConfig, useDocumentDrawer } from '@payloadcms/ui'
import React, { useCallback, useEffect, useRef, useState } from 'react'

type Colore = { id: number; nome: string; codice: string }

/**
 * Dimensioni del testo. Nel testo si salva una variabile CSS con un valore di riserva per
 * l'editor: sul sito le variabili sono responsive (frontend/src/app/(frontend)/globals.css).
 * Le chiavi devono restare uguali a quelle ammesse da frontend/src/utilities/stileTesto.ts.
 */
const DIMENSIONI = [
  { chiave: null, etichetta: 'Normale', riserva: '' },
  { chiave: 'piccolo', etichetta: 'Piccolo', riserva: '0.875rem' },
  { chiave: 'grande', etichetta: 'Grande', riserva: '1.25rem' },
  { chiave: 'molto-grande', etichetta: 'Molto grande', riserva: '1.5rem' },
  { chiave: 'enorme', etichetta: 'Enorme', riserva: '2rem' },
  { chiave: 'sottotitolo', etichetta: 'Sottotitolo', riserva: '1.25rem' },
] as const

// Applica (o toglie, con null) proprietà di stile al testo selezionato
const applica = (editor: LexicalEditor, stile: Record<string, string | null>) =>
  editor.update(() => {
    const selezione = $getSelection()
    if ($isRangeSelection(selezione)) $patchStyleText(selezione, stile)
  })

// I pulsanti del pannello non devono togliere la selezione al testo
const tieniSelezione = (e: React.MouseEvent) => e.preventDefault()

const stilePulsante: React.CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  gap: 8,
  width: '100%',
  padding: '4px 8px',
  border: 0,
  borderRadius: 4,
  background: 'transparent',
  color: 'var(--theme-text)',
  cursor: 'pointer',
  textAlign: 'left',
  font: 'inherit',
}

// Matita per modificare un colore nel pannello laterale dell'admin
const ModificaColore: React.FC<{ colore: Colore; dopoSalvataggio: () => void }> = ({
  colore,
  dopoSalvataggio,
}) => {
  const [Drawer, , { openDrawer }] = useDocumentDrawer({ collectionSlug: 'colori', id: colore.id })
  return (
    <>
      <button
        type="button"
        onMouseDown={tieniSelezione}
        onClick={openDrawer}
        title={`Modifica "${colore.nome}"`}
        aria-label={`Modifica il colore ${colore.nome}`}
        style={{ ...stilePulsante, width: 'auto', padding: '4px 6px' }}
      >
        ✎
      </button>
      <Drawer onSave={dopoSalvataggio} />
    </>
  )
}

/**
 * Pulsante "Stile testo" nella barra dell'editor: dimensione del testo (responsiva sul sito)
 * e colore dalla tavolozza "Colori del sito", con la possibilità di aggiungere un colore o
 * modificarne uno senza uscire dalla pagina. Il colore si salva come var(--colore-ID, #codice):
 * sul sito vale il codice attuale della tavolozza, anche se cambia dopo.
 */
const PulsanteStileTesto: React.FC<{ editor: LexicalEditor }> = ({ editor }) => {
  const {
    config: { serverURL, routes },
  } = useConfig()
  const [aperto, setAperto] = useState(false)
  const [posizione, setPosizione] = useState({ top: 0, left: 0 })
  const [colori, setColori] = useState<Colore[]>([])
  const pulsanteRef = useRef<HTMLButtonElement>(null)
  const pannelloRef = useRef<HTMLDivElement>(null)
  const [NuovoColore, , { openDrawer: apriNuovoColore }] = useDocumentDrawer({
    collectionSlug: 'colori',
  })

  const caricaColori = useCallback(() => {
    fetch(`${serverURL}${routes.api}/colori?limit=200&depth=0&sort=nome`, {
      credentials: 'include',
    })
      .then((r) => r.json())
      .then((d: { docs?: Colore[] }) => setColori(d.docs ?? []))
      .catch(() => setColori([]))
  }, [serverURL, routes.api])

  useEffect(() => {
    if (!aperto) return
    caricaColori()
    // Chiude cliccando fuori (ma non dentro i pannelli laterali dei colori)
    const fuori = (e: MouseEvent) => {
      const t = e.target as Node
      if (pannelloRef.current?.contains(t) || pulsanteRef.current?.contains(t)) return
      if ((t as Element).closest?.('.drawer, [class*="drawer"]')) return
      setAperto(false)
    }
    document.addEventListener('mousedown', fuori)
    return () => document.removeEventListener('mousedown', fuori)
  }, [aperto, caricaColori])

  const apri = () => {
    const r = pulsanteRef.current?.getBoundingClientRect()
    if (r) setPosizione({ top: r.bottom + 4, left: r.left })
    setAperto(!aperto)
  }

  return (
    <>
      <button
        ref={pulsanteRef}
        type="button"
        className="toolbar-popup__button"
        onMouseDown={tieniSelezione}
        onClick={apri}
        title="Stile testo: dimensione e colore"
        aria-label="Stile testo: dimensione e colore"
        aria-expanded={aperto}
        style={{ fontWeight: 700, padding: '0 6px' }}
      >
        A<span style={{ fontSize: 10, verticalAlign: 'super' }}>±</span>
      </button>

      {aperto && (
        <div
          ref={pannelloRef}
          role="dialog"
          aria-label="Stile testo"
          style={{
            position: 'fixed',
            top: posizione.top,
            left: posizione.left,
            zIndex: 1000,
            width: 240,
            maxHeight: 420,
            overflowY: 'auto',
            padding: 8,
            borderRadius: 6,
            border: '1px solid var(--theme-elevation-150)',
            background: 'var(--theme-elevation-0)',
            boxShadow: '0 6px 20px rgba(0,0,0,.18)',
          }}
        >
          <p style={{ margin: '4px 8px', fontSize: 11, textTransform: 'uppercase', opacity: 0.7 }}>
            Dimensione
          </p>
          {DIMENSIONI.map((d) => (
            <button
              key={d.etichetta}
              type="button"
              onMouseDown={tieniSelezione}
              onClick={() =>
                applica(editor, {
                  'font-size': d.chiave ? `var(--testo-${d.chiave}, ${d.riserva})` : null,
                  'font-weight': d.chiave === 'sottotitolo' ? '500' : null,
                })
              }
              style={stilePulsante}
            >
              {d.etichetta}
            </button>
          ))}

          <p
            style={{
              margin: '12px 8px 4px',
              fontSize: 11,
              textTransform: 'uppercase',
              opacity: 0.7,
            }}
          >
            Colore
          </p>
          <button
            type="button"
            onMouseDown={tieniSelezione}
            onClick={() => applica(editor, { color: null })}
            style={stilePulsante}
          >
            <span
              style={{ width: 14, height: 14, borderRadius: 3, border: '1px dashed currentColor' }}
            />
            Predefinito
          </button>
          {colori.map((c) => (
            <div key={c.id} style={{ display: 'flex', alignItems: 'center' }}>
              <button
                type="button"
                onMouseDown={tieniSelezione}
                onClick={() => applica(editor, { color: `var(--colore-${c.id}, ${c.codice})` })}
                style={stilePulsante}
              >
                <span
                  style={{
                    width: 14,
                    height: 14,
                    borderRadius: 3,
                    background: c.codice,
                    flexShrink: 0,
                  }}
                />
                {c.nome}
              </button>
              <ModificaColore colore={c} dopoSalvataggio={caricaColori} />
            </div>
          ))}
          <button
            type="button"
            onMouseDown={tieniSelezione}
            onClick={apriNuovoColore}
            style={{ ...stilePulsante, marginTop: 4, fontWeight: 600 }}
          >
            + Nuovo colore
          </button>
          <NuovoColore onSave={caricaColori} />
        </div>
      )}
    </>
  )
}

const gruppo = {
  type: 'buttons' as const,
  key: 'stileTesto',
  order: 25,
  items: [{ key: 'stileTesto', Component: PulsanteStileTesto }],
}

export const StileTestoFeatureClient = createClientFeature({
  toolbarFixed: { groups: [gruppo] },
  toolbarInline: { groups: [gruppo] },
})
