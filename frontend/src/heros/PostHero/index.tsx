import { formatDateTime } from 'src/utilities/formatDateTime'
import React from 'react'

import type { Post } from '@/payload-types'

import { Media } from '@/components/Media'
import { formatAuthors } from '@/utilities/formatAuthors'

// Immagine a tutto schermo dietro il titolo solo se è larga abbastanza da non sgranarsi;
// altrimenti (es. copertine di riviste da 200 px) intestazione compatta con l'immagine accanto
const LARGHEZZA_MINIMA = 1200

export const heroAPienoSchermo = (post: Post): boolean =>
  typeof post.heroImage === 'object' &&
  post.heroImage !== null &&
  (post.heroImage.width ?? 0) >= LARGHEZZA_MINIMA

export const PostHero: React.FC<{
  post: Post
}> = ({ post }) => {
  const { categories, heroImage, populatedAuthors, publishedAt, title } = post

  const hasAuthors =
    populatedAuthors && populatedAuthors.length > 0 && formatAuthors(populatedAuthors) !== ''

  const categorie = categories
    ?.flatMap((c) => (typeof c === 'object' && c !== null ? [c.title || 'Senza categoria'] : []))
    .join(', ')

  const dettagli = (
    <div className="flex flex-col md:flex-row gap-4 md:gap-16">
      {hasAuthors && (
        <div className="flex flex-col gap-1">
          <p className="text-sm">Autore</p>
          <p>{formatAuthors(populatedAuthors)}</p>
        </div>
      )}
      {publishedAt && (
        <div className="flex flex-col gap-1">
          <p className="text-sm">Pubblicato il</p>
          <time dateTime={publishedAt}>{formatDateTime(publishedAt)}</time>
        </div>
      )}
    </div>
  )

  if (!heroAPienoSchermo(post)) {
    return (
      <div className="container lg:grid lg:grid-cols-[1fr_48rem_1fr]">
        <div className="flex flex-col gap-8 sm:flex-row sm:items-end lg:col-start-2">
          {heroImage && typeof heroImage === 'object' && (
            <Media
              className="w-40 shrink-0 sm:w-48"
              imgClassName="rounded-md border border-border shadow-md"
              priority
              resource={heroImage}
            />
          )}
          <div>
            {categorie && <div className="mb-4 text-sm uppercase text-muted-foreground">{categorie}</div>}
            <h1 className="mb-6 text-3xl md:text-5xl">{title}</h1>
            <div className="text-muted-foreground">{dettagli}</div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="relative -mt-[10.4rem] flex items-end">
      <div className="container z-10 relative lg:grid lg:grid-cols-[1fr_48rem_1fr] text-white pb-8">
        <div className="col-start-1 col-span-1 md:col-start-2 md:col-span-2">
          {categorie && <div className="uppercase text-sm mb-6">{categorie}</div>}
          <h1 className="mb-6 text-3xl md:text-5xl lg:text-6xl">{title}</h1>
          {dettagli}
        </div>
      </div>
      <div className="min-h-[80vh] select-none">
        {heroImage && typeof heroImage !== 'string' && (
          <Media fill priority imgClassName="-z-10 object-cover" resource={heroImage} />
        )}
        <div className="absolute pointer-events-none left-0 bottom-0 w-full h-1/2 bg-linear-to-t from-black to-transparent" />
      </div>
    </div>
  )
}
