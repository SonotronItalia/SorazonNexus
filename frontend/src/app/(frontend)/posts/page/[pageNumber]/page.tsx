import type { Metadata } from 'next/types'

import { CollectionArchive } from '@/components/CollectionArchive'
import { LowImpactHero } from '@/heros/LowImpact'
import { PageRange } from '@/components/PageRange'
import { Pagination } from '@/components/Pagination'
import { getPosts } from '@/lib/content'
import { redirect } from 'next/navigation'
import { LINGUA_PRINCIPALE } from '@/utilities/lingue'
import { linguaRichiesta } from '@/utilities/linguaRichiesta'
import { testi } from '@/utilities/testi'
import { SITE_NAME } from '@/utilities/mergeOpenGraph'
import React from 'react'
import { notFound } from 'next/navigation'

type Args = {
  params: Promise<{
    pageNumber: string
  }>
}

export default async function Page({ params: paramsPromise }: Args) {
  const { pageNumber } = await paramsPromise

  const sanitizedPageNumber = Number(pageNumber)

  if (!Number.isInteger(sanitizedPageNumber) || sanitizedPageNumber < 1) notFound()

  const lingua = await linguaRichiesta()
  const posts = await getPosts(sanitizedPageNumber, 12, lingua)
  if (lingua !== LINGUA_PRINCIPALE && posts.totalDocs === 0) redirect('/posts')

  return (
    <div className="pb-24">
      <LowImpactHero>
        <p className="mb-4 text-sm font-semibold tracking-wide text-cyan-600 uppercase md:text-base dark:text-cyan-400">
          Newsroom
        </p>
        <h1 className="text-[length:var(--titolo-display)] leading-[0.95] font-semibold tracking-[-0.035em]">
          {testi(lingua).notizie}
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
        {posts?.page && posts?.totalPages > 1 && (
          <Pagination page={posts.page} totalPages={posts.totalPages} />
        )}
      </div>
    </div>
  )
}

export async function generateMetadata({ params: paramsPromise }: Args): Promise<Metadata> {
  const { pageNumber } = await paramsPromise
  return {
    title: `Notizie, pagina ${pageNumber || ''} | ${SITE_NAME}`,
    alternates: { canonical: `/posts/page/${pageNumber}` },
  }
}

// Nessuna pagina pre-generata in build: si costruiscono alla prima richiesta
export async function generateStaticParams() {
  return []
}
