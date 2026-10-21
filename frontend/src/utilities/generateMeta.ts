import type { Metadata } from 'next'

import type { Media, Page, Post, Config } from '../payload-types'

import { mediaSrc } from '@/lib/api'
import { immagineOg, mergeOpenGraph } from './mergeOpenGraph'
import { getServerSideURL } from './getURL'
import { getLingue, getSeo } from '@/lib/content'
import { LINGUA_PRINCIPALE, LINGUE, percorsoDoc } from './lingue'
import { lingueAttive } from './lingueAttive'
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
  /** Lingua della pagina e slug nelle altre lingue (per hreflang) */
  lingua?: string
  alternative?: { raccolta: 'pages' | 'posts'; slug: Record<string, string> }
}): Promise<Metadata> => {
  const { doc, percorso, tipo = 'website', lingua = LINGUA_PRINCIPALE, alternative } = args
  // Nome, descrizione, modello del titolo e immagine predefinita: Avanzate > SEO e motori AI
  const [seo, lingue] = await Promise.all([getSeo(lingua), alternative ? getLingue() : null])
  // Versioni della pagina nelle lingue attive in cui è tradotta (hreflang); x-default = italiano
  const attive = new Set(lingueAttive(lingue).map((l) => l.codice))
  const lingueAlternative = alternative
    ? Object.fromEntries(
        Object.entries(alternative.slug)
          .filter(([l]) => attive.has(l))
          .map(([l, s]) => [l, percorsoDoc(l, s, alternative.raccolta)]),
      )
    : {}
  if (lingueAlternative[LINGUA_PRINCIPALE]) lingueAlternative['x-default'] = lingueAlternative[LINGUA_PRINCIPALE]
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
    alternates: {
      canonical: percorso,
      ...(Object.keys(lingueAlternative).length > 2 ? { languages: lingueAlternative } : {}),
    },
    // Pagine escluse o sito nascosto (SEO e motori AI): fuori dagli indici
    ...(nonIndicizzare(percorso, seo) ? { robots: { index: false, follow: true } } : {}),
    openGraph: mergeOpenGraph({
      type: tipo,
      title,
      description,
      url: percorso,
      // Le misure si dichiarano solo per l'immagine generata (le altre possono variare)
      siteName: sito,
      locale: LINGUE.find((l) => l.codice === lingua)?.locale,
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
