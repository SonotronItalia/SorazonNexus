import type { Metadata } from 'next'

import type { Media, Page, Post, Config } from '../payload-types'

import { mediaSrc } from '@/lib/api'
import { mergeOpenGraph, SITE_NAME } from './mergeOpenGraph'
import { getServerSideURL } from './getURL'

const getImageURL = (image?: Media | Config['db']['defaultIDType'] | null) => {
  const serverUrl = getServerSideURL()

  if (image && typeof image === 'object' && 'url' in image) {
    const ogUrl = image.sizes?.og?.url
    return serverUrl + mediaSrc(ogUrl || image.url)
  }

  return serverUrl + '/website-template-OG.webp'
}

export const generateMeta = async (args: {
  doc: Partial<Page> | Partial<Post> | null
}): Promise<Metadata> => {
  const { doc } = args

  const ogImage = getImageURL(doc?.meta?.image)

  // Titolo SEO se c'è, altrimenti il titolo della pagina o della notizia (in home solo il nome del sito)
  const nome = doc?.meta?.title || (doc?.slug === 'home' ? undefined : doc?.title)
  const title = nome ? `${nome} | ${SITE_NAME}` : SITE_NAME

  return {
    description: doc?.meta?.description,
    openGraph: mergeOpenGraph({
      description: doc?.meta?.description || '',
      images: ogImage
        ? [
            {
              url: ogImage,
            },
          ]
        : undefined,
      title,
      url: Array.isArray(doc?.slug) ? doc?.slug.join('/') : '/',
    }),
    title,
  }
}
