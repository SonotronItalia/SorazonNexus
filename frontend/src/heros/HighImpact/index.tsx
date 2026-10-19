'use client'
import { useHeaderScuro } from '@/providers/HeaderTheme'
import React from 'react'

import type { Page } from '@/payload-types'

import { CMSLink } from '@/components/Link'
import RichText from '@/components/RichText'
import { SfondoHero } from '@/heros/comune/SfondoHero'
import { posizioneTitolo } from '@/heros/comune/posizione'
import { cn } from '@/utilities/ui'

/**
 * High Impact: immagine o video a tutto schermo (80% dell'altezza, sotto l'header), con
 * sovrapposizione e titolo nella posizione scelta (predefinita: al centro).
 */
export const HighImpactHero: React.FC<Page['hero']> = (props) => {
  const { links, richText } = props
  const pos = posizioneTitolo(props.posizioneTitolo, 'centro-centro')

  useHeaderScuro()

  return (
    <div
      className={cn('relative -mt-[10.4rem] flex min-h-[80vh] overflow-hidden text-white', pos.verticale)}
      data-theme="dark"
    >
      <SfondoHero {...props} />
      {/* pt: spazio per l'header che sta sopra l'immagine */}
      <div className={cn('container relative z-10 flex pb-12 pt-[12rem]', pos.orizzontale)}>
        <div className={cn('max-w-[36.5rem]', pos.testo)}>
          {richText && <RichText className="mb-6" data={richText} enableGutter={false} />}
          {Array.isArray(links) && links.length > 0 && (
            <ul className="flex flex-wrap gap-4">
              {links.map(({ link }, i) => {
                return (
                  <li key={i}>
                    <CMSLink {...link} />
                  </li>
                )
              })}
            </ul>
          )}
        </div>
      </div>
    </div>
  )
}
