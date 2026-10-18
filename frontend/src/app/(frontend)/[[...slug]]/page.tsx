import type { Metadata } from 'next'

import { PayloadRedirects } from '@/components/PayloadRedirects'
import { notFound } from 'next/navigation'
import React, { cache } from 'react'

import { RenderBlocks } from '@/blocks/RenderBlocks'
import { RenderHero } from '@/heros/RenderHero'
import { getPageBySlug } from '@/lib/content'
import { generateMeta } from '@/utilities/generateMeta'
import PageClient from './page.client'

// Nessuna pagina pre-generata in build (il backend può non esserci):
// ognuna si costruisce alla prima richiesta e resta in cache fino all'avviso del CMS (tag)
export async function generateStaticParams() {
  return []
}

type Args = {
  params: Promise<{
    slug?: string[]
  }>
}

// "/" è la pagina con slug "home"; le pagine del CMS hanno un solo livello
const slugFrom = (segments?: string[]) => {
  if (!segments?.length) return 'home'
  if (segments.length > 1) notFound()
  // Decode to support slugs with special characters
  return decodeURIComponent(segments[0])
}

const queryPageBySlug = cache(getPageBySlug)

export default async function Page({ params: paramsPromise }: Args) {
  const { slug: segments } = await paramsPromise
  const slug = slugFrom(segments)
  const url = slug === 'home' ? '/' : '/' + slug

  const page = await queryPageBySlug(slug)

  if (!page) {
    return <PayloadRedirects url={url} />
  }

  const { hero, layout } = page

  return (
    <article className="pt-16 pb-24">
      <PageClient />
      {/* Allows redirects for valid pages too */}
      <PayloadRedirects disableNotFound url={url} />

      <RenderHero {...hero} />
      <RenderBlocks blocks={layout} />
    </article>
  )
}

export async function generateMetadata({ params: paramsPromise }: Args): Promise<Metadata> {
  const { slug: segments } = await paramsPromise
  const page = await queryPageBySlug(slugFrom(segments))

  return generateMeta({ doc: page })
}
