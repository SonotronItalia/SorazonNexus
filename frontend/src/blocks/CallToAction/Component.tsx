import React from 'react'

import type { CallToActionBlock as CTABlockProps } from '@/payload-types'

import RichText from '@/components/RichText'
import { CMSLink } from '@/components/Link'
import { sfondo as stileSfondo } from '@/utilities/sfondo'
import { cn } from '@/utilities/ui'

export const CallToActionBlock: React.FC<CTABlockProps> = ({ links, richText, sfondo, colore }) => {
  // "Nessuno" è il riquadro chiaro con il bordo di sempre
  const { className: classeSfondo, ...attributiSfondo } = stileSfondo(sfondo, colore)
  const conSfondo = Boolean(classeSfondo || attributiSfondo.style)

  return (
    <div className="container @container">
      <div
        className={cn(
          'rounded p-4 flex flex-col gap-8 @2xl:flex-row @2xl:justify-between @2xl:items-center',
          conSfondo ? classeSfondo : 'bg-card border-border border',
        )}
        {...attributiSfondo}
      >
        <div className="max-w-[48rem] flex items-center">
          {richText && <RichText className="mb-0" data={richText} enableGutter={false} />}
        </div>
        <div className="flex flex-col gap-8">
          {(links || []).map(({ link }, i) => {
            return <CMSLink key={i} size="lg" {...link} />
          })}
        </div>
      </div>
    </div>
  )
}
