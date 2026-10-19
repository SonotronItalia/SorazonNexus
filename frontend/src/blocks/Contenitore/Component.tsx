import React from 'react'

import type { ContenitoreBlock as ContenitoreProps } from '@/payload-types'
import { Effetti } from '@/components/Effetti'
import { classeLarghezza } from '@/utilities/larghezza'
import { sfondo as stileSfondo } from '@/utilities/sfondo'
import { cn } from '@/utilities/ui'

// Le classi stanno scritte per intero: Tailwind non vede quelle costruite al volo
const SPAZIO_COLONNE = {
  nessuno: 'gap-0',
  piccolo: 'gap-4',
  medio: 'gap-8',
  grande: 'gap-12',
} as const

const SPAZIO_VERTICALE = {
  nessuno: '',
  piccolo: 'py-6',
  medio: 'py-12',
  grande: 'py-20',
} as const

const ALLINEAMENTO = {
  inizio: '@2xl:items-start',
  centro: '@2xl:items-center',
  fine: '@2xl:items-end',
} as const

// "auto" divide lo spazio con le altre colonne automatiche; le altre hanno una base fissa
// che si restringe quanto basta per lo spazio tra le colonne
const LARGHEZZA_COLONNA = {
  auto: '@2xl:flex-1',
  '25': '@2xl:basis-1/4',
  '33': '@2xl:basis-1/3',
  '50': '@2xl:basis-1/2',
  '66': '@2xl:basis-2/3',
  '75': '@2xl:basis-3/4',
} as const

type Colonna = NonNullable<ContenitoreProps['colonne']>[number]

/**
 * Contenitore a colonne (tutti i livelli: contenitore, contenitore2, contenitore3).
 * I blocchi di ogni colonna li disegna RenderBlocks, passato come funzione per evitare un
 * import circolare (RenderBlocks disegna a sua volta il Contenitore).
 * Le colonne si affiancano se il contenitore è largo almeno 42rem (container query: vale anche
 * dentro la colonna di un altro Contenitore), altrimenti vanno una sotto l'altra.
 */
export const ContenitoreBlock: React.FC<
  ContenitoreProps & { renderBlocchi: (blocchi: Colonna['blocchi']) => React.ReactNode }
> = ({
  larghezza,
  allineamento,
  spazioColonne,
  spazioVerticale,
  sfondo,
  colore,
  effetti,
  colonne,
  renderBlocchi,
}) => {
  const { className: classeSfondo, ...attributiSfondo } = stileSfondo(sfondo, colore)
  const conSfondo = Boolean(classeSfondo || attributiSfondo.style)

  return (
    <div className="container @container">
      <div
        className={cn(
          classeLarghezza(larghezza),
          // Gli effetti animati stanno dietro le colonne, dentro il riquadro
          effetti?.length && 'relative overflow-hidden',
          SPAZIO_VERTICALE[spazioVerticale ?? 'nessuno'],
          // Con uno sfondo il contenitore diventa un riquadro con margine interno
          conSfondo && 'rounded-lg px-6 md:px-10',
          conSfondo && (spazioVerticale ?? 'nessuno') === 'nessuno' && 'py-6',
          classeSfondo,
        )}
        {...attributiSfondo}
      >
        <Effetti effetti={effetti} />
        <div
          className={cn(
            'relative flex flex-col @2xl:flex-row',
            SPAZIO_COLONNE[spazioColonne ?? 'medio'],
            ALLINEAMENTO[allineamento ?? 'inizio'],
          )}
        >
          {colonne?.map((colonna) => (
            <div
              key={colonna.id}
              className={cn(
                'colonna-contenitore min-w-0 @2xl:shrink',
                LARGHEZZA_COLONNA[colonna.larghezza ?? 'auto'],
              )}
            >
              {renderBlocchi(colonna.blocchi)}
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
