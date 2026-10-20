import { getCentri, getFooter, getImpostazioni, getPagineSommario, getPosts } from '@/lib/content'
import { getServerSideURL } from '@/utilities/getURL'
import { DESCRIZIONE_SITO, SITE_NAME } from '@/utilities/mergeOpenGraph'

// /llms.txt (llmstxt.org): sommario del sito in Markdown per assistenti e motori di risposta
// AI. Generato dai contenuti del CMS a ogni richiesta (dati in cache con i soliti tag).
export const dynamic = 'force-dynamic'

// Pagine legali in fondo, il resto nell'ordine del menu del vecchio sito
const ORDINE = ['home', 'dispositivo', 'terapia', 'indicazioni', 'risultati', 'centri', 'distribuzione', 'contatti']

export async function GET() {
  const SITE = getServerSideURL()
  const [pagine, notizie, centri, footer, impostazioni] = await Promise.all([
    getPagineSommario().catch(() => []),
    getPosts(1, 100).catch(() => ({ docs: [] })),
    getCentri().catch(() => []),
    getFooter().catch(() => null),
    getImpostazioni(),
  ])

  const url = (slug: string) => (slug === 'home' ? `${SITE}/` : `${SITE}/${slug}`)
  const voce = (titolo: string, link: string, descrizione?: string | null) =>
    `- [${titolo}](${link})${descrizione ? `: ${descrizione.replace(/\s+/g, ' ').trim()}` : ''}`

  const ordinate = [...pagine].sort((a, b) => {
    const ia = ORDINE.indexOf(a.slug ?? ''), ib = ORDINE.indexOf(b.slug ?? '')
    return (ia < 0 ? 99 : ia) - (ib < 0 ? 99 : ib)
  })

  const perRegione = new Map<string, string[]>()
  for (const c of centri) {
    const r = c.regione?.trim() || 'Altre'
    perRegione.set(r, [...(perRegione.get(r) ?? []), c.citta?.trim() || c.nome_struttura])
  }

  const d = footer?.datiLegali
  const righe = [
    `# ${impostazioni?.nomeSito?.trim() || SITE_NAME}`,
    '',
    `> ${impostazioni?.descrizioneSito?.trim() || DESCRIZIONE_SITO}`,
    '',
    d?.ragioneSociale
      ? `Produttore: ${d.ragioneSociale}${d.indirizzo ? `, ${d.indirizzo}` : ''}${d.partitaIva ? `, P.IVA ${d.partitaIva}` : ''}.` +
        (d.telefono ? ` Telefono ${d.telefono}.` : '') +
        (d.email ? ` Email ${d.email}.` : '')
      : '',
    '',
    '## Pagine',
    '',
    ...ordinate.filter((p) => p.slug).map((p) => voce(p.meta?.title || p.title, url(p.slug!), p.meta?.description)),
    '',
    '## Centri di riferimento',
    '',
    `${centri.length} centri in ${perRegione.size} regioni italiane. Elenco completo con indirizzi e telefoni: ${SITE}/centri`,
    '',
    ...[...perRegione.entries()]
      .sort(([a], [b]) => a.localeCompare(b, 'it'))
      .map(([r, citta]) => `- ${r}: ${[...new Set(citta)].join(', ')}`),
    '',
    '## Notizie',
    '',
    ...notizie.docs.map((n) =>
      voce(
        `${n.title}${n.publishedAt ? ` (${new Date(n.publishedAt).toLocaleDateString('it-IT', { month: 'long', year: 'numeric' })})` : ''}`,
        `${SITE}/posts/${n.slug}`,
        n.meta?.description,
      ),
    ),
    '',
  ]

  return new Response(righe.join('\n').replace(/\n{3,}/g, '\n\n'), {
    headers: { 'Content-Type': 'text/markdown; charset=utf-8' },
  })
}
