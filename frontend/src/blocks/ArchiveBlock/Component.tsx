import type { Post, ArchiveBlock as ArchiveBlockProps } from '@/payload-types'

import React from 'react'
import { getPostsByCategories } from '@/lib/content'
import RichText from '@/components/RichText'

import { CollectionArchive } from '@/components/CollectionArchive'
import { linguaRichiesta } from '@/utilities/linguaRichiesta'

export const ArchiveBlock: React.FC<
  ArchiveBlockProps & {
    id?: string
  }
> = async (props) => {
  const { id, categories, introContent, limit: limitFromProps, populateBy, selectedDocs } = props

  const limit = limitFromProps || 3

  let posts: Post[] = []

  if (populateBy === 'collection') {
    const flattenedCategories = (categories ?? []).map((category) =>
      typeof category === 'object' ? category.id : category,
    )

    posts = await getPostsByCategories(flattenedCategories, limit, await linguaRichiesta())
  } else {
    if (selectedDocs?.length) {
      const filteredSelectedPosts = selectedDocs.map((post) => {
        if (typeof post.value === 'object') return post.value
      }) as Post[]

      posts = filteredSelectedPosts
    }
  }

  return (
    <div className="my-16" id={`block-${id}`}>
      {introContent && (
        <div className="container mb-16">
          <RichText className="ms-0 max-w-[48rem]" data={introContent} enableGutter={false} />
        </div>
      )}
      <CollectionArchive posts={posts} />
    </div>
  )
}
