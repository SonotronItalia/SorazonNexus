import type { Metadata } from 'next/types'

import { CollectionArchive } from '@/components/CollectionArchive'
import React from 'react'
import { Search } from '@/search/Component'
import PageClient from './page.client'
import { CardPostData } from '@/components/Card'
import { searchPosts } from '@/lib/content'
import { SITE_NAME } from '@/utilities/mergeOpenGraph'

type Args = {
  searchParams: Promise<{
    q: string
  }>
}
export default async function Page({ searchParams: searchParamsPromise }: Args) {
  const { q: query } = await searchParamsPromise
  const posts = await searchPosts(query)

  return (
    <div className="pt-24 pb-24">
      <PageClient />
      <div className="container mb-16">
        <div className="prose dark:prose-invert max-w-none text-center">
          <h1 className="mb-8 lg:mb-16">Cerca</h1>

          <div className="max-w-[50rem] mx-auto">
            <Search />
          </div>
        </div>
      </div>

      {posts.length > 0 ? (
        <CollectionArchive posts={posts as CardPostData[]} />
      ) : (
        <div className="container">Nessun risultato.</div>
      )}
    </div>
  )
}

export function generateMetadata(): Metadata {
  return {
    title: `Cerca | ${SITE_NAME}`,
  }
}
