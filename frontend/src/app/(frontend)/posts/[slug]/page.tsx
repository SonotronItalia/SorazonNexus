import type { Metadata } from 'next'

import { RelatedPosts } from '@/blocks/RelatedPosts/Component'
import { PayloadRedirects } from '@/components/PayloadRedirects'
import { draftMode } from 'next/headers'
import { redirect } from 'next/navigation'
import React, { cache } from 'react'
import RichText from '@/components/RichText'

import { PostHero, heroAPienoSchermo } from '@/heros/PostHero'
import { getAlternative, getPostBySlug, slugItaliano } from '@/lib/content'
import { AlternativeLingua } from '@/providers/Lingua'
import { conPrefisso, LINGUA_PRINCIPALE, percorsoDoc } from '@/utilities/lingue'
import { linguaRichiesta } from '@/utilities/linguaRichiesta'
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
const queryPostBySlug = cache(async (slug: string, lingua: string) =>
  getPostBySlug(slug, (await draftMode()).isEnabled, lingua),
)

export default async function Post({ params: paramsPromise }: Args) {
  const { slug = '' } = await paramsPromise
  // Decode to support slugs with special characters
  const decodedSlug = decodeURIComponent(slug)
  const url = '/posts/' + decodedSlug
  const lingua = await linguaRichiesta()
  const post = await queryPostBySlug(decodedSlug, lingua)

  if (!post) {
    // Notizia non tradotta: la versione italiana
    if (lingua !== LINGUA_PRINCIPALE) {
      const it = await slugItaliano('posts', decodedSlug, lingua)
      if (it) redirect(percorsoDoc(LINGUA_PRINCIPALE, it, 'posts'))
    }
    return <PayloadRedirects url={url} />
  }
  const alternative = await getAlternative('posts', post.id)

  return (
    <article className="pt-16 pb-16">
      <PageClient scuro={heroAPienoSchermo(post)} />

      {/* Allows redirects for valid pages too */}
      <PayloadRedirects disableNotFound url={url} />

      <DatiStrutturati
        dati={[
          datiNotizia(post),
          briciole([
            { nome: 'Notizie', percorso: conPrefisso(lingua, '/posts') },
            { nome: post.title, percorso: url },
          ]),
        ]}
      />
      <AlternativeLingua raccolta="posts" slug={alternative} />
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
  const lingua = await linguaRichiesta()
  const post = await queryPostBySlug(decodeURIComponent(slug), lingua)

  return generateMeta({
    doc: post,
    percorso: percorsoDoc(lingua, slug, 'posts'),
    tipo: 'article',
    lingua,
    alternative: post ? { raccolta: 'posts', slug: await getAlternative('posts', post.id) } : undefined,
  })
}
