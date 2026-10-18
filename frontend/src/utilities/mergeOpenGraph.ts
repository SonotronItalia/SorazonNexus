import type { Metadata } from 'next'
import { getServerSideURL } from './getURL'

export const SITE_NAME = 'Sorazon'

const defaultOpenGraph = (): Metadata['openGraph'] => ({
  type: 'website',
  description: 'Sorazon: la terapia e la rete dei centri di riferimento in Italia.',
  images: [
    {
      url: `${getServerSideURL()}/website-template-OG.webp`,
    },
  ],
  siteName: SITE_NAME,
  title: SITE_NAME,
})

export const mergeOpenGraph = (og?: Metadata['openGraph']): Metadata['openGraph'] => {
  const base = defaultOpenGraph()
  return {
    ...base,
    ...og,
    images: og?.images ? og.images : base?.images,
  }
}
