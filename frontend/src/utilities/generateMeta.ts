import type { Metadata } from 'next'

import type { Media, Page, Post, Config } from '../payload-types'

import { mediaSrc } from '@/lib/api'
import { immagineOg, mergeOpenGraph } from './mergeOpenGraph'
import { getServerSideURL } from './getURL'
import { getSeo } from '@/lib/content'
import { descrizioneSito, nomeSito, nonIndicizzare, titoloPagina } from './seo'

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
  // Nome, descrizione, modello del titolo e immagine predefinita: Avanzate > SEO e motori AI
  const seo = await getSeo()
  const sito = nomeSito(seo)

  const nome = doc?.meta?.title || (doc?.slug === 'home' ? undefined : doc?.title)
  const title = titoloPagina(nome, seo)
  const description = doc?.meta?.description || descrizioneSito(seo)
  const caricata = getImageURL(doc?.meta?.image) ?? getImageURL(seo?.immagineCondivisione)
  const immagine = caricata ?? immagineOg(nome ?? undefined)
  const post = tipo === 'article' ? (doc as Partial<Post>) : null

  return {
    title,
    description,
    alternates: { canonical: percorso },
    // Pagine escluse o sito nascosto (SEO e motori AI): fuori dagli indici
    ...(nonIndicizzare(percorso, seo) ? { robots: { index: false, follow: true } } : {}),
    openGraph: mergeOpenGraph({
      type: tipo,
      title,
      description,
      url: percorso,
      // Le misure si dichiarano solo per l'immagine generata (le altre possono variare)
      siteName: sito,
      images: [
        caricata
          ? { url: immagine }
          : { url: immagine, width: 1200, height: 630, alt: nome ?? sito },
      ],
      ...(post?.publishedAt ? { publishedTime: post.publishedAt } : {}),
      ...(post?.updatedAt ? { modifiedTime: post.updatedAt } : {}),
    }),
    twitter: { card: 'summary_large_image', title, description, images: [immagine] },
  }
}
