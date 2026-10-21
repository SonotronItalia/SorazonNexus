import React from 'react'
import type { Page } from '@/payload-types'
import { Media } from '@/components/Media'
import RichText from '@/components/RichText'
import { Effetti } from '@/components/Effetti'
import { CMSLink } from '@/components/Link'
import { Parallasse } from '@/components/Parallasse'

export const SorazonHero: React.FC<Page['hero']> = ({
  richText,
  links,
  media,
  effetti,
  bordoImmagine,
}) => {
  // data-theme="dark": l'hero resta scuro anche nel tema chiaro, pulsanti compresi
  return (
    <div
      data-theme="dark"
      className="relative overflow-hidden bg-slate-950 px-6 py-24 text-white md:px-12"
    >
      {/* Effetti dalla sezione "Effetti" (prima: caselle pulsazione e scarica) */}
      <Effetti effetti={effetti} />

      <div className="container relative z-10 mx-auto grid grid-cols-1 items-center gap-12 lg:grid-cols-2">
        <div className="entrata">
          {richText && (
            <RichText
              data={richText}
              enableGutter={false}
              className="[&_h1]:mb-4 [&_p]:text-[length:var(--testo-sottotitolo)] [&_p]:text-white/70"
            />
          )}
          {Array.isArray(links) && links.length > 0 && (
            <ul className="mt-8 flex flex-wrap gap-4">
              {links.map(({ link }, i) => (
                <li key={i}>
                  <CMSLink {...link} size="lg" className="rounded-full px-6" />
                </li>
              ))}
            </ul>
          )}
        </div>
        {media && typeof media === 'object' && (
          <Parallasse>
            {/* Bordo e ombra attivabili dall'admin (predefinito: attivi) */}
            <div
              className={
                bordoImmagine === false
                  ? 'relative overflow-hidden rounded-lg'
                  : 'relative overflow-hidden rounded-lg border border-slate-800 shadow-2xl'
              }
            >
              <Media
                resource={media}
                imgClassName="h-auto w-full object-cover"
                priority
                size="(max-width: 1024px) 100vw, 50vw"
              />
            </div>
          </Parallasse>
        )}
      </div>
    </div>
  )
}
