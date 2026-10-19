import React from 'react'

import type { Page } from '@/payload-types'

import { CMSLink } from '@/components/Link'
import { Media } from '@/components/Media'
import RichText from '@/components/RichText'
import { SfondoHero } from '@/heros/comune/SfondoHero'
import { posizioneTitolo, SFUMATURA } from '@/heros/comune/posizione'
import { cn } from '@/utilities/ui'

// Le classi stanno scritte per intero: Tailwind non vede quelle costruite al volo
const PROPORZIONI = { '16-9': 'aspect-[16/9]', '21-9': 'aspect-[21/9]', '3-1': 'aspect-[3/1]' } as const

// Testo e pulsanti dell'hero (uguali nelle due posizioni)
const Testo: React.FC<Pick<Page['hero'], 'links' | 'richText'>> = ({ links, richText }) => (
  <>
    {richText && <RichText className="mb-6" data={richText} enableGutter={false} />}
    {Array.isArray(links) && links.length > 0 && (
      <ul className="flex flex-wrap gap-4">
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
 * Banner: immagine (con le sue proporzioni, senza ritagli) o video a tutta larghezza, con il
 * titolo sovrapposto nella posizione scelta (predefinita: in alto al centro) e, se richiesta,
 * una sovrapposizione colorata. Senza sovrapposizione una sfumatura scura dal lato del titolo
 * lo rende leggibile. Sotto i 1024px il banner è troppo basso per una scritta sovrapposta:
 * il titolo va sopra l'immagine.
 */
export const BannerHero: React.FC<Page['hero']> = (props) => {
  const { links, media, richText, sfondoMedia, proporzione, overlay } = props
  const video = sfondoMedia === 'video'
  // Con un'immagine e senza proporzione scelta si usano quelle dell'immagine
  const naturale = !video && !proporzione
  const pos = posizioneTitolo(props.posizioneTitolo, 'alto-centro')
  const conOverlay = Boolean(overlay) && overlay !== 'nessuna'

  return (
    <div>
      <div className="container mb-8 lg:hidden">
        <Testo links={links} richText={richText} />
      </div>
      <div className={cn('relative overflow-hidden', !naturale && PROPORZIONI[proporzione ?? '16-9'])}>
        {naturale && media && typeof media === 'object' && (
          <Media resource={media} imgClassName="block h-auto w-full" priority size="100vw" />
        )}
        <SfondoHero {...props} senzaImmagine={naturale} />
        <div
          className={cn(
            'absolute inset-0 hidden py-8 text-white lg:flex xl:py-12',
            pos.verticale,
            !conOverlay && SFUMATURA[pos.riga],
          )}
          // Testo chiaro sopra immagine o video, in entrambi i temi del sito
          data-theme="dark"
        >
          <div className={cn('container flex', pos.orizzontale)}>
            <div className={cn('max-w-3xl [&_h1]:text-4xl xl:[&_h1]:text-5xl', pos.testo)}>
              <Testo links={links} richText={richText} />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
