import type { Metadata } from 'next'

import { RelatedPosts } from '@/blocks/RelatedPosts/Component'
import { PayloadRedirects } from '@/components/PayloadRedirects'
import { draftMode } from 'next/headers'
import React, { cache } from 'react'
import RichText from '@/components/RichText'

import { PostHero, heroAPienoSchermo } from '@/heros/PostHero'
import { getPostBySlug } from '@/lib/content'
import { generateMeta } from '@/utilities/generateMeta'
import PageClient from './page.client'
import { DatiStrutturati } from '@/components/DatiStrutturati'
import { briciole, datiNotizia } from '@/utilities/datiStrutturati'

// Nessuna notizia pre-generata in build: si costruiscono alla prima richiesta
export async function generateStaticParams() {
  return []
}

type Args = {
  params: Promise<{
    slug?: string
  }>
}

// In anteprima (draftMode) legge la bozza, senza cache; altrimenti la versione pubblicata
const queryPostBySlug = cache(async (slug: string) =>
  getPostBySlug(slug, (await draftMode()).isEnabled),
)

export default async function Post({ params: paramsPromise }: Args) {
  const { slug = '' } = await paramsPromise
  // Decode to support slugs with special characters
  const decodedSlug = decodeURIComponent(slug)
  const url = '/posts/' + decodedSlug
  const post = await queryPostBySlug(decodedSlug)

  if (!post) return <PayloadRedirects url={url} />

  return (
    <article className="pt-16 pb-16">
      <PageClient scuro={heroAPienoSchermo(post)} />

      {/* Allows redirects for valid pages too */}
      <PayloadRedirects disableNotFound url={url} />

      <DatiStrutturati
        dati={[
          datiNotizia(post),
          briciole([
            { nome: 'Notizie', percorso: '/posts' },
            { nome: post.title, percorso: url },
          ]),
        ]}
      />
      <PostHero post={post} />

      <div className="flex flex-col items-center gap-4 pt-8">
        <div className="container">
          <RichText className="max-w-[48rem] mx-auto" data={post.content} enableGutter={false} />
          {post.relatedPosts && post.relatedPosts.length > 0 && (
            <RelatedPosts
              className="mt-12 max-w-[52rem] lg:grid lg:grid-cols-subgrid col-start-1 col-span-3 grid-rows-[2fr]"
              docs={post.relatedPosts.filter((post) => typeof post === 'object')}
            />
          )}
        </div>
      </div>
    </article>
  )
}

export async function generateMetadata({ params: paramsPromise }: Args): Promise<Metadata> {
  const { slug = '' } = await paramsPromise
  const post = await queryPostBySlug(decodeURIComponent(slug))

  return generateMeta({ doc: post, percorso: `/posts/${slug}`, tipo: 'article' })
}
