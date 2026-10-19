import type { Metadata } from 'next'

import type { Media, Page, Post, Config } from '../payload-types'

import { mediaSrc } from '@/lib/api'
import { DESCRIZIONE_SITO, immagineOg, mergeOpenGraph, SITE_NAME } from './mergeOpenGraph'
import { getServerSideURL } from './getURL'

// Immagine SEO solo se abbastanza grande per le anteprime dei social (es. non le copertine da 200 px)
const LARGHEZZA_MINIMA = 600
const getImageURL = (image?: Media | Config['db']['defaultIDType'] | null) =>
  image && typeof image === 'object' && 'url' in image && (image.width ?? 0) >= LARGHEZZA_MINIMA
    ? getServerSideURL() + mediaSrc(image.sizes?.og?.url || image.url)
    : undefined

/**
 * Metadati di una pagina o notizia: titolo e descrizione SEO (o il titolo del documento e la
 * descrizione del sito), indirizzo canonico, Open Graph e Twitter. Senza immagine SEO si usa
 * quella generata con il titolo (app/og).
 */
export const generateMeta = async (args: {
  doc: Partial<Page> | Partial<Post> | null
  /** Percorso della pagina, es. "/terapia" o "/posts/slug" */
  percorso: string
  tipo?: 'website' | 'article'
}): Promise<Metadata> => {
  const { doc, percorso, tipo = 'website' } = args

  const nome = doc?.meta?.title || (doc?.slug === 'home' ? undefined : doc?.title)
  // Il nome del sito in coda, se il titolo non lo contiene già
  const title = !nome ? SITE_NAME : nome.includes(SITE_NAME) ? nome : `${nome} | ${SITE_NAME}`
  const description = doc?.meta?.description || DESCRIZIONE_SITO
  const caricata = getImageURL(doc?.meta?.image)
  const immagine = caricata ?? immagineOg(nome ?? undefined)
  const post = tipo === 'article' ? (doc as Partial<Post>) : null

  return {
    title,
    description,
    alternates: { canonical: percorso },
    openGraph: mergeOpenGraph({
      type: tipo,
      title,
      description,
      url: percorso,
      // Le misure si dichiarano solo per l'immagine generata (le altre possono variare)
      images: [caricata ? { url: immagine } : { url: immagine, width: 1200, height: 630, alt: nome ?? SITE_NAME }],
      ...(post?.publishedAt ? { publishedTime: post.publishedAt } : {}),
      ...(post?.updatedAt ? { modifiedTime: post.updatedAt } : {}),
    }),
    twitter: { card: 'summary_large_image', title, description, images: [immagine] },
  }
}
