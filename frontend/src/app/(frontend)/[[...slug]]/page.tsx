import type { Metadata } from 'next'

import { PayloadRedirects } from '@/components/PayloadRedirects'
import { draftMode } from 'next/headers'
import { redirect } from 'next/navigation'
import React, { cache } from 'react'

import { RenderBlocks } from '@/blocks/RenderBlocks'
import { DatiStrutturati } from '@/components/DatiStrutturati'
import { briciole } from '@/utilities/datiStrutturati'
import { RenderHero } from '@/heros/RenderHero'
import { getAlternative, getPageBySlug, slugItaliano } from '@/lib/content'
import { AlternativeLingua } from '@/providers/Lingua'
import { LINGUA_PRINCIPALE, percorsoDoc } from '@/utilities/lingue'
import { linguaRichiesta } from '@/utilities/linguaRichiesta'
import { generateMeta } from '@/utilities/generateMeta'

// Disegnata a ogni richiesta (lingua dall'intestazione x-lingua); dati in cache con i tag del CMS
export const dynamic = 'force-dynamic'

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

// In anteprima (draftMode) legge la bozza, senza cache; altrimenti la versione pubblicata.
// Nelle altre lingue solo le pagine tradotte, pubblicate e non nascoste
const queryPageBySlug = cache(async (slug: string, lingua: string) =>
  getPageBySlug(slug, (await draftMode()).isEnabled, lingua),
)

export default async function Page({ params: paramsPromise }: Args) {
  const { slug: segments } = await paramsPromise
  const { slug, url } = parse(segments)

  // Vecchi indirizzi a più livelli (es. /index.php/contatti): redirect del CMS, altrimenti 404
  if (!slug) return <PayloadRedirects url={url} />

  const lingua = await linguaRichiesta()
  const page = await queryPageBySlug(slug, lingua)

  if (!page) {
    // Traduzione mancante o non pubblicata: la pagina in italiano
    if (lingua !== LINGUA_PRINCIPALE) {
      const it = await slugItaliano('pages', slug, lingua)
      if (it) redirect(percorsoDoc(LINGUA_PRINCIPALE, it))
    }
    return <PayloadRedirects url={url} />
  }
  const alternative = await getAlternative('pages', page.id)

  const { hero, layout } = page

  return (
    <article className="pt-16 pb-24">
      {/* Allows redirects for valid pages too */}
      <PayloadRedirects disableNotFound url={url} />

      {slug !== 'home' && (
        <DatiStrutturati
          dati={briciole([{ nome: page.title, percorso: percorsoDoc(lingua, slug) }])}
        />
      )}
      <AlternativeLingua raccolta="pages" slug={alternative} />
      <RenderHero {...hero} />
      <RenderBlocks blocks={layout} />
    </article>
  )
}

export async function generateMetadata({ params: paramsPromise }: Args): Promise<Metadata> {
  const { slug: segments } = await paramsPromise
  const { slug } = parse(segments)
  if (!slug) return {}
  const lingua = await linguaRichiesta()
  const page = await queryPageBySlug(slug, lingua)

  return generateMeta({
    doc: page,
    percorso: percorsoDoc(lingua, slug),
    lingua,
    alternative: page ? { raccolta: 'pages', slug: await getAlternative('pages', page.id) } : undefined,
  })
}
