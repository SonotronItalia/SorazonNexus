// Più numeri nello stesso campo ("089 303004 - 347 1722920"): uno per pulsante, da chiamare col
// dito. Il collegamento tel: usa il formato internazionale (+39 se manca il prefisso)
export const telefoni = (campo: string | null | undefined) =>
  (campo ?? '')
    .split(/\s*[/,;]\s*|\s+-\s+/)
    .map((t) => t.trim())
    .filter((t) => t.replace(/\D/g, '').length >= 6)
    .map((t) => {
      const cifre = t.replace(/[^\d+]/g, '')
      const internazionale = cifre.startsWith('+')
        ? cifre
        : cifre.startsWith('00')
          ? `+${cifre.slice(2)}`
          : `+39${cifre}`
      return { testo: t, href: `tel:${internazionale}` }
    })
