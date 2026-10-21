import { PayloadRequest, CollectionSlug } from 'payload'

import { LINGUA_PRINCIPALE } from '@/lingue'

import { getServerSideURL } from './getURL'

// Parametri letti dalla rotta /next/preview del frontend (da ricostruire nella fase 6)
type PreviewSearchParams = {
  path: string
  previewSecret: string
}

const collectionPrefixMap: Partial<Record<CollectionSlug, string>> = {
  posts: '/posts',
  pages: '',
}

type Props = {
  collection: keyof typeof collectionPrefixMap
  slug: string
  req: PayloadRequest
}

export const generatePreviewPath = ({ collection, slug, req }: Props) => {
  if (slug === undefined || slug === null) {
    return null
  }

  // Encode to support slugs with special characters
  const encodedSlug = encodeURIComponent(slug)

  // Lingua scelta nel pannello: l'anteprima di una traduzione si apre con il suo prefisso (/en/…)
  const lingua = req?.locale && req.locale !== 'all' && req.locale !== LINGUA_PRINCIPALE ? `/${req.locale}` : ''

  const encodedParams = new URLSearchParams({
    path: `${lingua}${collectionPrefixMap[collection]}/${encodedSlug}`,
    previewSecret: process.env.PREVIEW_SECRET || '',
  } satisfies PreviewSearchParams)

  // Indirizzo ASSOLUTO: l'anteprima si apre sul frontend, che è un'altra origine
  return `${getServerSideURL()}/next/preview?${encodedParams.toString()}`
}
