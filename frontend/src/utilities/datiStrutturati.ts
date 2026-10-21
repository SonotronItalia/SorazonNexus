import type { Footer, Impostazioni, Media, Post, Seo } from '@/payload-types'

import { mediaSrc } from '@/lib/api'
import { getServerSideURL } from './getURL'
import { loghi } from './marchio'
import { descrizioneSito, nomeSito as nomeDelSito } from './seo'

/**
 * Dati strutturati schema.org. Solo fatti verificabili presi dal CMS (nomi, indirizzi, date,
 * immagini): nessuna affermazione sanitaria, che resta nei testi rivisti dall'azienda.
 * Gli oggetti si collegano tra loro con "@id" (es. ogni notizia ha come editore l'azienda).
 */
const sito = () => getServerSideURL()
export const ID_AZIENDA = () => `${sito()}/#azienda`
const ID_SITO = () => `${sito()}/#sito`

export const urlAssoluto = (percorso: string) =>
  /^https?:\/\//.test(percorso)
    ? percorso
    : `${sito()}${percorso.startsWith('/') ? '' : '/'}${percorso}`

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

// Azienda (SEO e motori AI > Dati dell'azienda, con il Piè di pagina come riserva; social dalle
// Impostazioni) e sito: in ogni pagina
export function datiAziendaESito(
  footer: Footer | null,
  impostazioni: Impostazioni | null = null,
  seo: Seo | null = null,
) {
  const d = footer?.datiLegali
  const a = seo?.azienda
  const social = (impostazioni?.social ?? []).map((s) => s.url).filter(Boolean)
  const nomeSito = nomeDelSito(seo)
  const telefono = a?.telefono || d?.telefono
  const email = a?.email || d?.email
  const partitaIva = a?.partitaIva || d?.partitaIva
  const indirizzo = a?.via
    ? {
        '@type': 'PostalAddress',
        streetAddress: a.via,
        ...(a.cap ? { postalCode: a.cap } : {}),
        ...(a.citta ? { addressLocality: a.citta } : {}),
        ...(a.provincia ? { addressRegion: a.provincia } : {}),
        addressCountry: 'IT',
      }
    : indirizzoPostale(d?.indirizzo)
  const azienda = {
    '@type': 'Organization',
    '@id': ID_AZIENDA(),
    name: a?.ragioneSociale || d?.ragioneSociale || 'SONOTRON ITALIA S.R.L.S.',
    brand: { '@type': 'Brand', name: nomeSito },
    url: `${sito()}/`,
    // Logo di SEO > Dati dell'azienda, altrimenti quello di Impostazioni > Marchio (o Sorazon)
    logo: urlImmagine(a?.logo) ?? `${sito()}${loghi(impostazioni).barra.chiaro.url}`,
    ...(partitaIva
      ? { vatID: `IT${partitaIva}`, taxID: a?.codiceFiscale || d?.codiceFiscale || partitaIva }
      : {}),
    ...(indirizzo ? { address: indirizzo } : {}),
    ...(telefono || email
      ? {
          contactPoint: {
            '@type': 'ContactPoint',
            contactType: 'customer service',
            availableLanguage: 'Italian',
            ...(telefono ? { telephone: telefono } : {}),
            ...(email ? { email } : {}),
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
    description: descrizioneSito(seo),
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
