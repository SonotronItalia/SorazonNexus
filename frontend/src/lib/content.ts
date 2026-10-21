// Funzioni di lettura dei contenuti. Sostituiscono le chiamate alla Local API di Payload.
import type {
  Colori,
  Config,
  Footer,
  Header,
  Impostazioni,
  Lingue,
  Page,
  Post,
  Redirect,
  Search,
  Seo,
  TornaSu,
} from '@/payload-types'

import { LINGUA_PRINCIPALE } from '@/utilities/lingue'

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
  'select[publishedAt]': 'true',
}

// --- Globali ---
// "lingua": i testi tradotti di menu, piè di pagina, avviso e SEO (con l'italiano come riserva)

export const getHeader = (lingua = LINGUA_PRINCIPALE) =>
  api<Header>(`/globals/header?depth=1&locale=${lingua}`, { tags: ['globals'] })
export const getFooter = (lingua = LINGUA_PRINCIPALE) =>
  api<Footer>(`/globals/footer?depth=1&locale=${lingua}`, { tags: ['globals'] })
export const getTornaSu = () => api<TornaSu>('/globals/torna-su?depth=1', { tags: ['globals'] })
// Impostazioni del sito (nome, descrizione, Google, avviso, social); null se il backend non risponde
// Nelle altre lingue senza ripiego sull'italiano: l'avviso compare solo se è stato tradotto
export const getImpostazioni = (lingua = LINGUA_PRINCIPALE) =>
  api<Impostazioni>(
    `/globals/impostazioni?depth=1&locale=${lingua}${lingua === LINGUA_PRINCIPALE ? '' : '&fallback-locale=none'}`,
    { tags: ['globals'] },
  ).catch(() => null)

// SEO e motori AI (nome e descrizione del sito, assistenti AI, dati dell'azienda); null se il
// backend non risponde: si usano i valori di riserva nel codice
export const getSeo = (lingua = LINGUA_PRINCIPALE) =>
  api<Seo>(`/globals/seo?depth=1&locale=${lingua}`, { tags: ['globals'] }).catch(() => null)

// Lingue attive e stile del selettore ("Lingue e selettore"); null se il backend non risponde
export const getLingue = () =>
  api<Lingue>('/globals/lingue?depth=0', { tags: ['globals'] }).catch(() => null)

// Tavolozza "Colori del sito": il layout la scrive come variabili CSS (--colore-ID)
export const getColori = async () => {
  const { docs } = await api<List<Colori>>('/colori?limit=200&depth=0', { tags: ['globals'] })
  return docs
}

// --- Pagine ---

// Documento tradotto: nelle lingue diverse dall'italiano si mostra se la traduzione è pubblicata
// (slug in quella lingua, senza ripiego sull'italiano) e non è nascosta ("Nascondi in questa lingua")
async function idTradotto(raccolta: 'pages' | 'posts', slug: string, lingua: string) {
  const q = qs({
    'where[slug][equals]': slug,
    // Non nascosta ("Nascondi in questa lingua" spenta o mai impostata)
    'where[or][0][nascosta][equals]': 'false',
    'where[or][1][nascosta][exists]': 'false',
    locale: lingua,
    'fallback-locale': 'none',
    limit: 1,
    depth: 0,
    'select[slug]': 'true',
  })
  const { docs } = await api<List<{ id: number }>>(`/${raccolta}?${q}`, { tags: [raccolta] })
  return docs[0]?.id ?? null
}

// draft = true solo in modalità anteprima (draftMode di Next): legge l'ultima bozza
export async function getPageBySlug(
  slug: string,
  draft = false,
  lingua = LINGUA_PRINCIPALE,
): Promise<Page | null> {
  if (draft) return apiDraft<Page>(`/pages/anteprima/${encodeURIComponent(slug)}?locale=${lingua}`)
  if (lingua !== LINGUA_PRINCIPALE) {
    const id = await idTradotto('pages', slug, lingua)
    return id
      ? api<Page>(`/pages/${id}?depth=2&locale=${lingua}`, { tags: ['pages'] }).catch(() => null)
      : null
  }
  const q = qs({ 'where[slug][equals]': slug, limit: 1, depth: 2, locale: lingua })
  const { docs } = await api<List<Page>>(`/pages?${q}`, { tags: ['pages', `page_${slug}`] })
  return docs[0] ?? null
}

// Slug in tutte le lingue in cui il documento è pubblicato: per il selettore di lingua e hreflang
export async function getAlternative(
  raccolta: 'pages' | 'posts',
  id: number | string,
): Promise<Record<string, string>> {
  const doc = await api<{
    slug?: Record<string, string | null> | null
    nascosta?: Record<string, boolean | null> | null
  }>(`/${raccolta}/${id}?depth=0&locale=all&select[slug]=true&select[nascosta]=true`, {
    tags: [raccolta],
  }).catch(() => null)
  const esito: Record<string, string> = {}
  for (const [lingua, slug] of Object.entries(doc?.slug ?? {})) {
    if (!slug) continue
    if (lingua === LINGUA_PRINCIPALE || !doc?.nascosta?.[lingua]) esito[lingua] = slug
  }
  return esito
}

// Traduzione mancante: slug italiano del documento che ha questo slug nella lingua (traduzione non
// ancora pubblicata) o in italiano (indirizzo italiano con il prefisso di un'altra lingua)
export async function slugItaliano(raccolta: 'pages' | 'posts', slug: string, lingua: string) {
  for (const locale of [lingua, LINGUA_PRINCIPALE]) {
    const q = qs({
      'where[slug][equals]': slug,
      locale,
      'fallback-locale': 'none',
      limit: 1,
      depth: 0,
      'select[slug]': 'true',
    })
    const { docs } = await api<List<{ id: number }>>(`/${raccolta}?${q}`, { tags: [raccolta] }).catch(
      () => ({ docs: [] as { id: number }[] }),
    )
    if (docs[0]) return (await getAlternative(raccolta, docs[0].id))[LINGUA_PRINCIPALE] ?? null
  }
  return null
}

// Per llms.txt: titolo, slug e descrizione SEO delle pagine pubblicate
export async function getPagineSommario() {
  const q = qs({
    'where[_status][equals]': 'published',
    pagination: 'false',
    depth: 0,
    'select[title]': 'true',
    'select[slug]': 'true',
    'select[meta]': 'true',
  })
  const { docs } = await api<List<Pick<Page, 'title' | 'slug' | 'meta'>>>(`/pages?${q}`, {
    tags: ['pages'],
  })
  return docs
}

// Per la sitemap: slug (in tutte le lingue), traduzioni pubblicate e data di modifica
export type VoceSitemap = {
  updatedAt?: string
  slug?: Record<string, string | null> | null
  nascosta?: Record<string, boolean | null> | null
}
export async function getPagesForSitemap() {
  const q = qs({
    'where[_status][equals]': 'published',
    pagination: 'false',
    depth: 0,
    locale: 'all',
    'select[slug]': 'true',
    'select[nascosta]': 'true',
    'select[updatedAt]': 'true',
  })
  const { docs } = await api<List<VoceSitemap>>(`/pages?${q}`, { tags: ['pages-sitemap'] })
  return docs
}

// --- Notizie ---

// Nelle altre lingue solo le notizie tradotte e non nascoste
const soloTradotte = (lingua: string): Record<string, string> =>
  lingua === LINGUA_PRINCIPALE
    ? {}
    : {
        'where[slug][exists]': 'true',
        'where[or][0][nascosta][equals]': 'false',
        'where[or][1][nascosta][exists]': 'false',
        'fallback-locale': 'none',
      }

export async function getPosts(
  page = 1,
  limit = 12,
  lingua = LINGUA_PRINCIPALE,
): Promise<List<Post>> {
  const q = qs({
    depth: 1,
    limit,
    page,
    sort: '-publishedAt',
    locale: lingua,
    ...soloTradotte(lingua),
    ...CARD_SELECT,
  })
  return api<List<Post>>(`/posts?${q}`, { tags: ['posts'] })
}

export async function getPostBySlug(
  slug: string,
  draft = false,
  lingua = LINGUA_PRINCIPALE,
): Promise<Post | null> {
  if (draft) return apiDraft<Post>(`/posts/anteprima/${encodeURIComponent(slug)}?locale=${lingua}`)
  if (lingua !== LINGUA_PRINCIPALE) {
    const id = await idTradotto('posts', slug, lingua)
    return id
      ? api<Post>(`/posts/${id}?depth=2&locale=${lingua}`, { tags: ['posts'] }).catch(() => null)
      : null
  }
  const q = qs({ 'where[slug][equals]': slug, limit: 1, depth: 2, locale: lingua })
  const { docs } = await api<List<Post>>(`/posts?${q}`, { tags: ['posts', `post_${slug}`] })
  return docs[0] ?? null
}

// Blocco Archivio: ultime notizie, eventualmente filtrate per categoria
export async function getPostsByCategories(
  categories: number[],
  limit: number,
  lingua = LINGUA_PRINCIPALE,
): Promise<Post[]> {
  const q = qs({
    depth: 1,
    limit,
    sort: '-publishedAt',
    locale: lingua,
    ...soloTradotte(lingua),
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
    locale: 'all',
    'select[slug]': 'true',
    'select[nascosta]': 'true',
    'select[updatedAt]': 'true',
  })
  const { docs } = await api<List<VoceSitemap>>(`/posts?${q}`, { tags: ['posts-sitemap'] })
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
