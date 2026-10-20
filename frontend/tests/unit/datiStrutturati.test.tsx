import { renderToStaticMarkup } from 'react-dom/server'
import { describe, expect, it } from 'vitest'

import { DatiStrutturati } from '@/components/DatiStrutturati'
import type { Footer, Post } from '@/payload-types'
import { briciole, datiAziendaESito, datiNotizia } from '@/utilities/datiStrutturati'

// Oggetti JSON-LD letti nei test (struttura libera)
// eslint-disable-next-line @typescript-eslint/no-explicit-any
type Json = Record<string, any>

const FOOTER = {
  id: 1,
  datiLegali: {
    ragioneSociale: 'SONOTRON ITALIA S.R.L.S.',
    indirizzo: 'Strada Nazionale Adriatica Sud 44 - 61032 Fano (PS)',
    partitaIva: '02654710413',
    codiceFiscale: '02654710413',
    telefono: '+39 0721 808759',
    email: 'info@sonotronitalia.com',
  },
  social: [{ piattaforma: 'facebook', url: 'https://facebook.com/sorazon' }],
} as unknown as Footer

describe('dati strutturati (schema.org)', () => {
  it('azienda: dati legali, indirizzo scomposto, contatti e social', () => {
    const {
      '@graph': [azienda, sito],
    } = datiAziendaESito(FOOTER) as { '@graph': Json[] }
    expect(azienda['@type']).toBe('Organization')
    expect(azienda.vatID).toBe('IT02654710413')
    expect(azienda.address).toMatchObject({
      streetAddress: 'Strada Nazionale Adriatica Sud 44',
      postalCode: '61032',
      addressLocality: 'Fano',
      addressRegion: 'PS',
      addressCountry: 'IT',
    })
    expect(azienda.contactPoint).toMatchObject({
      telephone: '+39 0721 808759',
      email: 'info@sonotronitalia.com',
    })
    expect(azienda.sameAs).toEqual(['https://facebook.com/sorazon'])
    expect(sito.url).toBe('https://www.sorazon.it/')
  })

  it('funziona anche senza Footer (backend non raggiungibile)', () => {
    const {
      '@graph': [azienda],
    } = datiAziendaESito(null) as { '@graph': Json[] }
    expect(azienda.name).toBe('SONOTRON ITALIA S.R.L.S.')
    expect(azienda).not.toHaveProperty('vatID')
  })

  it('percorso di navigazione con URL assoluti, a partire dalla home', () => {
    const b = briciole([{ nome: 'Notizie', percorso: '/posts' }]) as {
      itemListElement: Record<string, unknown>[]
    }
    expect(b.itemListElement).toEqual([
      { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://www.sorazon.it/' },
      { '@type': 'ListItem', position: 2, name: 'Notizie', item: 'https://www.sorazon.it/posts' },
    ])
  })

  it('notizia con data, immagine assoluta ed editore', () => {
    const n = datiNotizia({
      id: 1,
      title: 'Il gomito',
      slug: 'il-gomito',
      publishedAt: '2016-03-01T00:00:00.000Z',
      updatedAt: '2026-10-20T00:00:00.000Z',
      meta: { image: { id: 2, url: '/api/media/file/copertina.jpg' } },
    } as unknown as Post) as Json
    expect(n['@type']).toBe('NewsArticle')
    expect(n.image).toEqual(['https://www.sorazon.it/media/copertina.jpg'])
    expect(n.mainEntityOfPage).toBe('https://www.sorazon.it/posts/il-gomito')
    expect(n.publisher['@id']).toBe('https://www.sorazon.it/#azienda')
  })

  it('un testo del CMS non può chiudere lo <script> e iniettare codice', () => {
    const html = renderToStaticMarkup(
      <DatiStrutturati dati={{ name: '</script><script>alert(1)</script>' }} />,
    )
    expect(html).not.toContain('</script><script>')
    expect(html.match(/<\/script>/g)).toHaveLength(1)
    const json = html.replace(/^<script[^>]*>/, '').replace(/<\/script>$/, '')
    expect(JSON.parse(json).name).toBe('</script><script>alert(1)</script>')
  })
})
