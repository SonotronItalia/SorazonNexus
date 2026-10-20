import React from 'react'

import type { NumeriEvidenzaBlock as Props } from '@/payload-types'
import { Rivela } from '@/components/Rivela'
import { getCentri } from '@/lib/content'
import { sezione } from '@/utilities/sezione'
import { cn } from '@/utilities/ui'

import { Contatore } from './Contatore'

// Colonne secondo quanti numeri ci sono (classi scritte per intero)
const COLONNE: Record<number, string> = {
  1: '',
  2: '@xl:grid-cols-2',
  3: '@xl:grid-cols-3',
  4: '@xl:grid-cols-2 @4xl:grid-cols-4',
  5: '@xl:grid-cols-3',
  6: '@xl:grid-cols-3',
}

/**
 * Numeri in evidenza: grandi, in gradiente sullo sfondo scuro, contano da zero quando compaiono.
 * Centri e regioni si calcolano dalla collezione Centri: si aggiornano da soli.
 */
export const NumeriEvidenzaBlock: React.FC<Props> = async ({ titolo, sfondo, voci }) => {
  const automatici = (voci ?? []).some((v) => v.tipo === 'centri' || v.tipo === 'regioni')
  const centri = automatici ? await getCentri().catch(() => []) : []
  const regioni = new Set(centri.map((c) => c.regione?.trim()).filter(Boolean)).size

  const valore = (tipo: string | null | undefined, v: number | null | undefined) =>
    tipo === 'centri' ? centri.length : tipo === 'regioni' ? regioni : (v ?? 0)

  const s = sezione(sfondo)
  const scuro = s['data-theme'] === 'dark'
  const elenco = voci ?? []

  return (
    <section className={cn('py-24 md:py-32', s.className)} data-theme={s['data-theme']}>
      <div className="container @container">
        {titolo && (
          <Rivela>
            <h2 className="mx-auto mb-16 max-w-3xl text-center text-[length:var(--titolo-2)] leading-tight font-semibold tracking-tight">
              {titolo}
            </h2>
          </Rivela>
        )}
        <div className={cn('grid gap-12 text-center', COLONNE[elenco.length] ?? '@xl:grid-cols-3')}>
          {elenco.map((v, i) => (
            <Rivela key={v.id ?? i} ritardo={i * 0.12}>
              <div className="flex flex-col items-center">
                <p
                  className={cn(
                    'text-[length:clamp(3.25rem,2rem+5vw,6.5rem)] leading-none font-semibold tracking-tighter tabular-nums',
                    scuro
                      ? 'bg-gradient-to-b from-white via-white to-cyan-300 bg-clip-text text-transparent'
                      : 'text-neutral-900',
                  )}
                >
                  {v.prefisso && (
                    <span className="mr-3 align-top text-[0.35em] font-medium tracking-normal">
                      {v.prefisso}
                    </span>
                  )}
                  <Contatore valore={valore(v.tipo, v.valore)} conta={v.conta !== false} />
                  {v.suffisso && <span>{v.suffisso}</span>}
                </p>
                <p className={cn('mt-4 text-lg', scuro ? 'text-neutral-400' : 'text-neutral-500')}>
                  {v.etichetta}
                </p>
              </div>
            </Rivela>
          ))}
        </div>
      </div>
    </section>
  )
}
