import type { Metadata } from 'next/types'

import { CollectionArchive } from '@/components/CollectionArchive'
import { LowImpactHero } from '@/heros/LowImpact'
import { PageRange } from '@/components/PageRange'
import { Pagination } from '@/components/Pagination'
import { getPosts } from '@/lib/content'
import { immagineOg, mergeOpenGraph, SITE_NAME } from '@/utilities/mergeOpenGraph'
import React from 'react'

// Rotta statica: senza questa opzione verrebbe generata in build, quando il backend può mancare.
// La pagina si disegna a ogni richiesta, ma i dati restano in cache (tag "posts").
export const dynamic = 'force-dynamic'

export default async function Page() {
  const posts = await getPosts(1, 12)

  return (
    <div className="pb-24">
      <LowImpactHero>
        <p className="mb-4 text-sm font-semibold tracking-wide text-cyan-600 uppercase md:text-base dark:text-cyan-400">
          Newsroom
        </p>
        <h1 className="text-[length:var(--titolo-display)] leading-[0.95] font-semibold tracking-[-0.035em]">
          Notizie
        </h1>
      </LowImpactHero>

      <div className="container mb-8">
        <PageRange
          collection="posts"
          currentPage={posts.page}
          limit={12}
          totalDocs={posts.totalDocs}
        />
      </div>

      <CollectionArchive posts={posts.docs} />

      <div className="container">
        {posts.totalPages > 1 && posts.page && (
          <Pagination page={posts.page} totalPages={posts.totalPages} />
        )}
      </div>
    </div>
  )
}

export function generateMetadata(): Metadata {
  return {
    title: `Notizie | ${SITE_NAME}`,
    description:
      'Notizie su Sorazon: articoli della rivista Senza Età sulla terapia antinfiammatoria con ozono, eventi e aggiornamenti dalla rete dei centri.',
    alternates: { canonical: '/posts' },
    openGraph: mergeOpenGraph({
      title: `Notizie | ${SITE_NAME}`,
      url: '/posts',
      images: [{ url: immagineOg('Notizie'), width: 1200, height: 630 }],
    }),
  }
}
