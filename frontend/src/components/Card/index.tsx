'use client'
import { cn } from '@/utilities/ui'
import useClickableCard from '@/utilities/useClickableCard'
import Link from 'next/link'
import React from 'react'

import type { Post } from '@/payload-types'

import { Media } from '@/components/Media'
import { useLingua } from '@/providers/Lingua'
import { percorsoDoc } from '@/utilities/lingue'

export type CardPostData = Pick<Post, 'slug' | 'categories' | 'meta' | 'title'> &
  Partial<Pick<Post, 'publishedAt'>>

const data = (iso: string) =>
  new Intl.DateTimeFormat('it-IT', { day: 'numeric', month: 'long', year: 'numeric' }).format(
    new Date(iso),
  )

// Scheda di una notizia in stile "Newsroom": riquadro arrotondato, immagine grande, categoria e
// data piccole, titolo in evidenza. Tutta la scheda è cliccabile
export const Card: React.FC<{
  alignItems?: 'center'
  className?: string
  doc?: CardPostData
  relationTo?: 'posts'
  showCategories?: boolean
  title?: string
}> = (props) => {
  const { cardRef, linkRef } = useClickableCard<HTMLElement>({})
  const { className, doc, relationTo, showCategories, title: titleFromProps } = props

  const { slug, categories, meta, title, publishedAt } = doc || {}
  const { description, image: metaImage } = meta || {}

  const categorie = showCategories
    ? (categories ?? [])
        .flatMap((c) => (typeof c === 'object' && c !== null ? [c.title || 'Senza categoria'] : []))
        .join(', ')
    : ''
  const titleToUse = titleFromProps || title
  const sanitizedDescription = description?.replace(/\s/g, ' ') // spazi non separabili -> spazi
  const { lingua } = useLingua()
  const href = percorsoDoc(lingua, slug ?? '', relationTo === 'posts' ? 'posts' : 'pages')

  return (
    <article
      className={cn(
        'group flex flex-col overflow-hidden rounded-[28px] bg-[#f5f5f7] transition-shadow hover:cursor-pointer hover:shadow-xl dark:bg-white/[0.06]',
        className,
      )}
      ref={cardRef}
    >
      {/* Riquadro fisso: immagini orizzontali e copertine verticali restano intere e allineate */}
      <div className="relative aspect-[4/3] w-full overflow-hidden bg-neutral-200/70 dark:bg-white/5">
        {metaImage && typeof metaImage !== 'string' && (
          <Media
            fill
            imgClassName="object-contain p-6 transition-transform duration-700 ease-out group-hover:scale-[1.04]"
            resource={metaImage}
            size="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
          />
        )}
      </div>
      <div className="flex flex-1 flex-col p-7">
        {(categorie || publishedAt) && (
          <p className="mb-3 text-xs font-semibold tracking-wide uppercase">
            {categorie && <span className="text-cyan-600 dark:text-cyan-400">{categorie}</span>}
            {categorie && publishedAt && <span className="text-neutral-400"> · </span>}
            {publishedAt && (
              <time dateTime={publishedAt} className="text-neutral-500">
                {data(publishedAt)}
              </time>
            )}
          </p>
        )}
        {titleToUse && (
          <h3 className="text-xl leading-snug font-semibold tracking-tight md:text-2xl">
            <Link href={href} ref={linkRef}>
              {titleToUse}
            </Link>
          </h3>
        )}
        {description && (
          <p className="mt-3 line-clamp-3 text-neutral-600 dark:text-neutral-400">
            {sanitizedDescription}
          </p>
        )}
      </div>
    </article>
  )
}
