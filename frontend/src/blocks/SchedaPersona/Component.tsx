import React from 'react'

import type { SchedaPersonaBlock as Props } from '@/payload-types'
import { Media } from '@/components/Media'
import RichText from '@/components/RichText'
import { SezioneSfondo } from '@/components/SezioneSfondo'
import { cn } from '@/utilities/ui'

/**
 * Scheda di una persona: foto grande verticale e, a fianco, ruolo, nome e testo. Sotto i 42rem
 * del blocco (container query) la foto va sopra il testo.
 */
export const SchedaPersonaBlock: React.FC<Props> = ({
  ruolo,
  nome,
  richText,
  foto,
  posizioneFoto,
  sfondo,
}) => {
  const conFoto = foto && typeof foto === 'object'
  return (
    <SezioneSfondo sfondo={sfondo}>
      <div className="container @container">
        <div
          className={cn(
            'grid items-center gap-8',
            conFoto && '@2xl:grid-cols-[minmax(0,2fr)_minmax(0,3fr)] @2xl:gap-14',
          )}
        >
          {conFoto && (
            <div
              className={cn(
                'relative aspect-[4/5] w-full max-w-md overflow-hidden rounded-[28px] bg-muted @2xl:max-w-none',
                posizioneFoto === 'destra' && '@2xl:order-2',
              )}
            >
              <Media
                fill
                resource={foto}
                imgClassName="object-cover"
                size="(min-width: 1024px) 40vw, 100vw"
              />
            </div>
          )}
          <div>
            {ruolo && (
              <p className="mb-3 text-sm font-semibold tracking-wide text-cyan-600 uppercase dark:text-cyan-400">
                {ruolo}
              </p>
            )}
            <h3 className="text-[length:var(--titolo-2)] leading-tight font-semibold tracking-tight">
              {nome}
            </h3>
            {richText && (
              <RichText
                data={richText}
                enableGutter={false}
                className="mx-0 mt-5 w-full max-w-none text-[1.0625rem] leading-relaxed text-muted-foreground [&_p:first-child]:mt-0"
              />
            )}
          </div>
        </div>
      </div>
    </SezioneSfondo>
  )
}
