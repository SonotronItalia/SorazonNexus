import type { Metadata } from 'next'
import { getServerSideURL } from './getURL'

export const SITE_NAME = 'Sorazon'

// Descrizione usata quando una pagina non ne ha una propria (campo SEO nell'admin)
export const DESCRIZIONE_SITO =
  'Sorazon: terapia antinfiammatoria non invasiva con apparecchio elettromedicale brevettato, prodotto da Sonotron Italia a Fano, e rete di centri di riferimento in Italia.'

// Immagine di condivisione generata (app/og): logo e titolo, 1200x630
export const immagineOg = (titolo?: string) =>
  `${getServerSideURL()}/og${titolo ? `?titolo=${encodeURIComponent(titolo)}` : ''}`

const defaultOpenGraph = (): Metadata['openGraph'] => ({
  type: 'website',
  locale: 'it_IT',
  description: DESCRIZIONE_SITO,
  images: [{ url: immagineOg(), width: 1200, height: 630, alt: SITE_NAME }],
  siteName: SITE_NAME,
  title: SITE_NAME,
})

export const mergeOpenGraph = (og?: Metadata['openGraph']): Metadata['openGraph'] => {
  const base = defaultOpenGraph()
  return {
    ...base,
    ...og,
    images: og?.images ? og.images : base?.images,
  } as Metadata['openGraph']
}
