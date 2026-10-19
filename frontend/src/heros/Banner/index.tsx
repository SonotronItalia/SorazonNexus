import React from 'react'

import type { Page } from '@/payload-types'

import { CMSLink } from '@/components/Link'
import { Media } from '@/components/Media'
import RichText from '@/components/RichText'

// Testo e pulsanti dell'hero (uguali nelle due posizioni)
const Testo: React.FC<Pick<Page['hero'], 'links' | 'richText'>> = ({ links, richText }) => (
  <>
    {richText && <RichText className="mb-6" data={richText} enableGutter={false} />}
    {Array.isArray(links) && links.length > 0 && (
      <ul className="flex flex-wrap gap-4 lg:justify-center">
        {links.map(({ link }, i) => (
          <li key={i}>
            <CMSLink {...link} />
          </li>
        ))}
      </ul>
    )}
  </>
)

/**
 * Banner: immagine intera a tutta larghezza, con le sue proporzioni (nessun ritaglio), e il
 * titolo sovrapposto nella fascia alta su una sfumatura scura. Pensato per illustrazioni
 * larghe (es. 3:1) con la parte alta libera. Sotto i 1024px il banner è troppo basso per
 * una scritta sovrapposta: il titolo va sopra l'immagine.
 */
export const BannerHero: React.FC<Page['hero']> = ({ links, media, richText }) => {
  return (
    <div>
      <div className="container mb-8 lg:hidden">
        <Testo links={links} richText={richText} />
      </div>
      <div className="relative">
        {media && typeof media === 'object' && (
          <Media resource={media} imgClassName="block h-auto w-full" priority size="100vw" />
        )}
        <div
          className="absolute inset-x-0 top-0 hidden bg-gradient-to-b from-black/60 via-black/25 to-transparent pb-20 pt-8 text-white lg:block xl:pt-12"
          // Testo chiaro sulla sfumatura scura, in entrambi i temi del sito
          data-theme="dark"
        >
          <div className="container text-center [&_h1]:text-4xl xl:[&_h1]:text-5xl">
            <Testo links={links} richText={richText} />
          </div>
        </div>
      </div>
    </div>
  )
}
