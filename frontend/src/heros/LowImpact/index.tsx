import React from 'react'

import type { Page } from '@/payload-types'

import RichText from '@/components/RichText'
import { Rivela } from '@/components/Rivela'

type LowImpactHeroType =
  | {
      children?: React.ReactNode
      richText?: never
      occhiello?: never
    }
  | (Omit<Page['hero'], 'richText'> & {
      children?: never
      richText?: Page['hero']['richText']
    })

// Apertura delle pagine interne: occhiello celeste, titolo molto grande, sottotitolo, su chiaro
export const LowImpactHero: React.FC<LowImpactHeroType> = ({ children, richText, occhiello }) => {
  return (
    <div className="container pt-16 pb-6 md:pt-24 md:pb-10">
      <Rivela className="max-w-5xl">
        {occhiello && (
          <p className="mb-4 text-sm font-semibold tracking-wide text-cyan-600 uppercase md:text-base dark:text-cyan-400">
            {occhiello}
          </p>
        )}
        {children ||
          (richText && (
            <RichText
              data={richText}
              enableGutter={false}
              className="max-w-none [&_h1]:mb-6 [&_h1]:text-[length:var(--titolo-display)] [&_h1]:leading-[0.95] [&_h1]:tracking-[-0.035em] [&_p]:max-w-3xl [&_p]:text-[length:var(--testo-sottotitolo)] [&_p]:leading-snug [&_p]:text-neutral-500 dark:[&_p]:text-neutral-400"
            />
          ))}
      </Rivela>
    </div>
  )
}
