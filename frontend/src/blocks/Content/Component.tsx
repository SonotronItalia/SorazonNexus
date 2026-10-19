import { cn } from '@/utilities/ui'
import React from 'react'
import RichText from '@/components/RichText'

import type { ContentBlock as ContentBlockProps } from '@/payload-types'

import { CMSLink } from '../../components/Link'

export const ContentBlock: React.FC<ContentBlockProps> = (props) => {
  const { columns } = props

  // Classi scritte per intero (Tailwind non vede quelle costruite al volo). Container query:
  // le colonne si affiancano in base allo spazio del blocco, anche dentro un Contenitore
  const colsSpanClasses = {
    full: '@4xl:col-span-12',
    half: '@2xl:col-span-2 @4xl:col-span-6',
    oneThird: '@2xl:col-span-2 @4xl:col-span-4',
    twoThirds: '@2xl:col-span-2 @4xl:col-span-8',
  }

  return (
    <div className="container my-16 @container">
      <div className="grid grid-cols-4 @4xl:grid-cols-12 gap-y-8 gap-x-16">
        {columns &&
          columns.length > 0 &&
          columns.map((col, index) => {
            const { enableLink, link, richText, size } = col

            return (
              <div
                className={cn('col-span-4', colsSpanClasses[size ?? 'full'])}
                key={index}
              >
                {richText && <RichText data={richText} enableGutter={false} />}

                {enableLink && <CMSLink {...link} />}
              </div>
            )
          })}
      </div>
    </div>
  )
}
