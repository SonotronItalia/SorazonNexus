import { Marked } from 'marked'

// "Come si crea una pagina" -> "come-si-crea-una-pagina" (ancore dell'indice)
export const ancora = (testo: string) =>
  testo
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '')

/**
 * Markdown dei manuali (file nostri, non contenuti degli utenti) in HTML, con un'ancora per ogni
 * titolo e l'indice dei capitoli (titoli di secondo livello).
 */
export const markdownInHtml = (testo: string) => {
  // Il titolo (prima riga "# …") si mostra a parte, sopra l'indice
  const titolo = testo.match(/^#\s+(.+)$/m)?.[1]?.trim() ?? ''
  const corpo = testo.replace(/^#\s+.+$/m, '')
  const indice: { id: string; testo: string }[] = []
  const marked = new Marked({
    renderer: {
      heading({ tokens, depth, text }) {
        const id = ancora(text)
        if (depth === 2) indice.push({ id, testo: text })
        return `<h${depth} id="${id}">${this.parser.parseInline(tokens)}</h${depth}>\n`
      },
      image({ href, text }) {
        return `<figure><img src="${href}" alt="${text}" loading="lazy" /><figcaption>${text}</figcaption></figure>`
      },
    },
  })
  const html = marked.parse(corpo, { async: false })
  return { titolo, html, indice }
}
