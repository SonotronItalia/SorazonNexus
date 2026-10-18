import { PayloadRequest, CollectionSlug } from 'payload'

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

export const generatePreviewPath = ({ collection, slug }: Props) => {
  if (slug === undefined || slug === null) {
    return null
  }

  // Encode to support slugs with special characters
  const encodedSlug = encodeURIComponent(slug)

  const encodedParams = new URLSearchParams({
    path: `${collectionPrefixMap[collection]}/${encodedSlug}`,
    previewSecret: process.env.PREVIEW_SECRET || '',
  } satisfies PreviewSearchParams)

  // Indirizzo ASSOLUTO: l'anteprima si apre sul frontend, che è un'altra origine
  return `${getServerSideURL()}/next/preview?${encodedParams.toString()}`
}
