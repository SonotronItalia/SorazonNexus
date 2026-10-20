import type { Footer, Impostazioni, Media, Post } from '@/payload-types'

import { mediaSrc } from '@/lib/api'
import { getServerSideURL } from './getURL'
import { DESCRIZIONE_SITO, SITE_NAME } from './mergeOpenGraph'

/**
 * Dati strutturati schema.org. Solo fatti verificabili presi dal CMS (nomi, indirizzi, date,
 * immagini): nessuna affermazione sanitaria, che resta nei testi rivisti dall'azienda.
 * Gli oggetti si collegano tra loro con "@id" (es. ogni notizia ha come editore l'azienda).
 */
const sito = () => getServerSideURL()
export const ID_AZIENDA = () => `${sito()}/#azienda`
const ID_SITO = () => `${sito()}/#sito`

export const urlAssoluto = (percorso: string) =>
  /^https?:\/\//.test(percorso) ? percorso : `${sito()}${percorso.startsWith('/') ? '' : '/'}${percorso}`

export const urlImmagine = (img: number | Media | null | undefined) =>
  img && typeof img === 'object' && img.url ? urlAssoluto(mediaSrc(img.url)) : undefined

// "Strada Nazionale Adriatica Sud 44 - 61032 Fano (PS)" -> via, CAP, città, provincia
const indirizzoPostale = (testo: string | null | undefined) => {
  if (!testo) return undefined
  const m = testo.match(/^(.*?)\s*[-,]\s*(\d{5})\s+(.+?)\s*\(([A-Z]{2})\)\s*$/)
  return {
    '@type': 'PostalAddress',
    ...(m
      ? { streetAddress: m[1], postalCode: m[2], addressLocality: m[3], addressRegion: m[4] }
      : { streetAddress: testo }),
    addressCountry: 'IT',
  }
}

// Azienda (dati legali dal Piè di pagina, social dalle Impostazioni) e sito: in ogni pagina
export function datiAziendaESito(footer: Footer | null, impostazioni: Impostazioni | null = null) {
  const d = footer?.datiLegali
  const social = (impostazioni?.social ?? []).map((s) => s.url).filter(Boolean)
  const nomeSito = impostazioni?.nomeSito?.trim() || SITE_NAME
  const azienda = {
    '@type': 'Organization',
    '@id': ID_AZIENDA(),
    name: d?.ragioneSociale || 'SONOTRON ITALIA S.R.L.S.',
    brand: { '@type': 'Brand', name: nomeSito },
    url: `${sito()}/`,
    logo: `${sito()}/logo_sorazon.svg`,
    ...(d?.partitaIva ? { vatID: `IT${d.partitaIva}`, taxID: d.codiceFiscale || d.partitaIva } : {}),
    ...(d?.indirizzo ? { address: indirizzoPostale(d.indirizzo) } : {}),
    ...(d?.telefono || d?.email
      ? {
          contactPoint: {
            '@type': 'ContactPoint',
            contactType: 'customer service',
            availableLanguage: 'Italian',
            ...(d.telefono ? { telephone: d.telefono } : {}),
            ...(d.email ? { email: d.email } : {}),
          },
        }
      : {}),
    ...(social.length ? { sameAs: social } : {}),
  }
  const webSite = {
    '@type': 'WebSite',
    '@id': ID_SITO(),
    url: `${sito()}/`,
    name: nomeSito,
    description: impostazioni?.descrizioneSito?.trim() || DESCRIZIONE_SITO,
    inLanguage: 'it-IT',
    publisher: { '@id': ID_AZIENDA() },
    potentialAction: {
      '@type': 'SearchAction',
      target: { '@type': 'EntryPoint', urlTemplate: `${sito()}/search?q={search_term_string}` },
      'query-input': 'required name=search_term_string',
    },
  }
  return { '@context': 'https://schema.org', '@graph': [azienda, webSite] }
}

// Percorso di navigazione: Home > [sezione] > pagina
export function briciole(voci: { nome: string; percorso: string }[]) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [{ nome: 'Home', percorso: '/' }, ...voci].map((v, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      name: v.nome,
      item: urlAssoluto(v.percorso),
    })),
  }
}

// Notizia
export function datiNotizia(post: Post) {
  const percorso = `/posts/${post.slug}`
  const immagine = urlImmagine(post.meta?.image) ?? urlImmagine(post.heroImage)
  return {
    '@context': 'https://schema.org',
    '@type': 'NewsArticle',
    headline: post.title,
    ...(post.meta?.description ? { description: post.meta.description } : {}),
    ...(immagine ? { image: [immagine] } : {}),
    ...(post.publishedAt ? { datePublished: post.publishedAt } : {}),
    dateModified: post.updatedAt,
    inLanguage: 'it-IT',
    mainEntityOfPage: urlAssoluto(percorso),
    author: { '@id': ID_AZIENDA() },
    publisher: { '@id': ID_AZIENDA() },
    ...(post.categories?.length
      ? {
          articleSection: post.categories
            .map((c) => (typeof c === 'object' && c ? c.title : null))
            .filter(Boolean),
        }
      : {}),
  }
}
