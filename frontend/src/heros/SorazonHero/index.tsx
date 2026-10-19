import React from 'react'
import type { Page } from '@/payload-types'
import { Media } from '@/components/Media'
import RichText from '@/components/RichText'
import { Effetti } from '@/components/Effetti'

export const SorazonHero: React.FC<Page['hero']> = ({
  richText,
  media,
  effetti,
  bordoImmagine,
}) => {
  return (
    <div className="relative overflow-hidden bg-slate-950 px-6 py-24 text-white md:px-12">
      {/* Effetti dalla sezione "Effetti" (prima: caselle pulsazione e scarica) */}
      <Effetti effetti={effetti} />

      <div className="container relative z-10 mx-auto grid grid-cols-1 items-center gap-12 lg:grid-cols-2">
        <div>{richText && <RichText data={richText} enableGutter={false} />}</div>
        {media && typeof media === 'object' && (
          // Bordo e ombra attivabili dall'admin (predefinito: attivi)
          <div
            className={
              bordoImmagine === false
                ? 'relative overflow-hidden rounded-lg'
                : 'relative overflow-hidden rounded-lg border border-slate-800 shadow-2xl'
            }
          >
            <Media resource={media} imgClassName="h-auto w-full object-cover" />
          </div>
        )}
      </div>
    </div>
  )
}