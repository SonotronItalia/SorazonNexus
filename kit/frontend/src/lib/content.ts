// Funzioni di lettura dei contenuti. Sostituiscono le chiamate alla Local API di Payload.
import type { Config, Footer, Header, Page, Post } from '@/payload-types'

import { api } from './api'

type List<T> = { docs: T[]; totalDocs: number; totalPages: number; page?: number }
type Centro = Config['collections']['centri']

export const getHeader = () => api<Header>('/globals/header?depth=1', { tags: ['globals'] })
export const getFooter = () => api<Footer>('/globals/footer?depth=1', { tags: ['globals'] })

export async function getPageBySlug(slug: string): Promise<Page | null> {
  const qs = new URLSearchParams({ 'where[slug][equals]': slug, limit: '1', depth: '2' })
  const { docs } = await api<List<Page>>(`/pages?${qs}`, { tags: ['pages', `page_${slug}`] })
  return docs[0] ?? null
}

export async function getPosts(page = 1, limit = 12): Promise<List<Post>> {
  const qs = new URLSearchParams({ depth: '1', limit: String(limit), page: String(page), sort: '-publishedAt' })
  return api<List<Post>>(`/posts?${qs}`, { tags: ['posts'] })
}

export async function getPostBySlug(slug: string): Promise<Post | null> {
  const qs = new URLSearchParams({ 'where[slug][equals]': slug, limit: '1', depth: '2' })
  const { docs } = await api<List<Post>>(`/posts?${qs}`, { tags: ['posts', `post_${slug}`] })
  return docs[0] ?? null
}

export async function getCentri(): Promise<Centro[]> {
  const { docs } = await api<List<Centro>>('/centri?pagination=false&depth=0', { tags: ['centri'] })
  return docs
}
