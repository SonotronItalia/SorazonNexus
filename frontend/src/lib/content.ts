// Funzioni di lettura dei contenuti. Sostituiscono le chiamate alla Local API di Payload.
import type { Config, Footer, Header, Page, Post, Redirect, Search } from '@/payload-types'

import { api, apiDraft } from './api'

export type List<T> = {
  docs: T[]
  totalDocs: number
  totalPages: number
  page?: number
  hasNextPage?: boolean
}
type Centro = Config['collections']['centri']

const qs = (params: Record<string, string | number>) =>
  new URLSearchParams(Object.entries(params).map(([k, v]) => [k, String(v)])).toString()

// Campi minimi per le schede delle notizie (CardPostData)
const CARD_SELECT = {
  'select[title]': 'true',
  'select[slug]': 'true',
  'select[categories]': 'true',
  'select[meta]': 'true',
}

// --- Globali ---

export const getHeader = () => api<Header>('/globals/header?depth=1', { tags: ['globals'] })
export const getFooter = () => api<Footer>('/globals/footer?depth=1', { tags: ['globals'] })

// --- Pagine ---

// draft = true solo in modalità anteprima (draftMode di Next): legge l'ultima bozza
export async function getPageBySlug(slug: string, draft = false): Promise<Page | null> {
  if (draft) return apiDraft<Page>(`/pages/anteprima/${encodeURIComponent(slug)}`)
  const q = qs({ 'where[slug][equals]': slug, limit: 1, depth: 2 })
  const { docs } = await api<List<Page>>(`/pages?${q}`, { tags: ['pages', `page_${slug}`] })
  return docs[0] ?? null
}

// Per la sitemap: solo slug e data di modifica delle pagine pubblicate
export async function getPagesForSitemap() {
  const q = qs({
    'where[_status][equals]': 'published',
    pagination: 'false',
    depth: 0,
    'select[slug]': 'true',
    'select[updatedAt]': 'true',
  })
  const { docs } = await api<List<Pick<Page, 'slug' | 'updatedAt'>>>(`/pages?${q}`, {
    tags: ['pages-sitemap'],
  })
  return docs
}

// --- Notizie ---

export async function getPosts(page = 1, limit = 12): Promise<List<Post>> {
  const q = qs({ depth: 1, limit, page, sort: '-publishedAt', ...CARD_SELECT })
  return api<List<Post>>(`/posts?${q}`, { tags: ['posts'] })
}

export async function getPostBySlug(slug: string, draft = false): Promise<Post | null> {
  if (draft) return apiDraft<Post>(`/posts/anteprima/${encodeURIComponent(slug)}`)
  const q = qs({ 'where[slug][equals]': slug, limit: 1, depth: 2 })
  const { docs } = await api<List<Post>>(`/posts?${q}`, { tags: ['posts', `post_${slug}`] })
  return docs[0] ?? null
}

// Blocco Archivio: ultime notizie, eventualmente filtrate per categoria
export async function getPostsByCategories(categories: number[], limit: number): Promise<Post[]> {
  const q = qs({
    depth: 1,
    limit,
    sort: '-publishedAt',
    ...(categories.length ? { 'where[categories][in]': categories.join(',') } : {}),
  })
  const { docs } = await api<List<Post>>(`/posts?${q}`, { tags: ['posts'] })
  return docs
}

export async function getPostsForSitemap() {
  const q = qs({
    'where[_status][equals]': 'published',
    pagination: 'false',
    depth: 0,
    'select[slug]': 'true',
    'select[updatedAt]': 'true',
  })
  const { docs } = await api<List<Pick<Post, 'slug' | 'updatedAt'>>>(`/posts?${q}`, {
    tags: ['posts-sitemap'],
  })
  return docs
}

// --- Ricerca (collezione "search" del plugin, sincronizzata con le notizie) ---

export async function searchPosts(query?: string): Promise<Search[]> {
  const params: Record<string, string | number> = { depth: 1, limit: 12, ...CARD_SELECT }
  if (query) {
    ;['title', 'meta.description', 'meta.title', 'slug'].forEach((field, i) => {
      params[`where[or][${i}][${field}][like]`] = query
    })
  }
  const { docs } = await api<List<Search>>(`/search?${qs(params)}`, { tags: ['posts'] })
  return docs
}

// --- Redirect del CMS ---

export async function getRedirects(): Promise<Redirect[]> {
  const { docs } = await api<List<Redirect>>('/redirects?pagination=false&depth=1', {
    tags: ['redirects'],
  })
  return docs
}

// Documento per id (redirect che puntano a una pagina o notizia non popolata)
export const getDocumentById = (collection: 'pages' | 'posts', id: number | string) =>
  api<Page | Post>(`/${collection}/${id}?depth=0`, { tags: [collection] })

// --- Centri ---

export async function getCentri(): Promise<Centro[]> {
  const { docs } = await api<List<Centro>>('/centri?pagination=false&depth=0', { tags: ['centri'] })
  return docs
}
