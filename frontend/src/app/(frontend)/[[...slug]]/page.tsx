import type { Metadata } from 'next'

import { PayloadRedirects } from '@/components/PayloadRedirects'
import { draftMode } from 'next/headers'
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

// "/" è la pagina con slug "home"; le pagine del CMS hanno un solo livello.
// Un percorso a più livelli non è una pagina: può essere solo un vecchio indirizzo da reindirizzare.
const parse = (segments: string[] = []) => {
  // Decode to support slugs with special characters
  const parts = segments.map(decodeURIComponent)
  return {
    url: '/' + parts.join('/'),
    slug: parts.length === 0 ? 'home' : parts.length === 1 ? parts[0] : null,
  }
}

// In anteprima (draftMode) legge la bozza, senza cache; altrimenti la versione pubblicata
const queryPageBySlug = cache(async (slug: string) =>
  getPageBySlug(slug, (await draftMode()).isEnabled),
)

export default async function Page({ params: paramsPromise }: Args) {
  const { slug: segments } = await paramsPromise
  const { slug, url } = parse(segments)

  // Vecchi indirizzi a più livelli (es. /index.php/contatti): redirect del CMS, altrimenti 404
  if (!slug) return <PayloadRedirects url={url} />

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
  const { slug } = parse(segments)
  if (!slug) return {}

  return generateMeta({ doc: await queryPageBySlug(slug) })
}
