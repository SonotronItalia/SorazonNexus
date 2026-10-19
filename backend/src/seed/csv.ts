/**
 * Lettore CSV minimale per i file del seed: separatore ";" (quello che usa Excel in italiano),
 * campi tra virgolette con "" per le virgolette interne e a capo ammessi dentro le virgolette.
 * La prima riga sono i nomi delle colonne. Le celle vuote non compaiono nell'oggetto.
 */
export function leggiCsv(testo: string, separatore = ';'): Record<string, string>[] {
  const righe: string[][] = []
  let riga: string[] = []
  let campo = ''
  let traVirgolette = false

  // Excel salva in UTF-8 con BOM: senza toglierlo la prima colonna avrebbe un nome sbagliato
  const s = testo.replace(/^\uFEFF/, '')

  for (let i = 0; i < s.length; i++) {
    const c = s[i]
    if (traVirgolette) {
      if (c === '"' && s[i + 1] === '"') {
        campo += '"'
        i++
      } else if (c === '"') {
        traVirgolette = false
      } else {
        campo += c
      }
    } else if (c === '"') {
      traVirgolette = true
    } else if (c === separatore) {
      riga.push(campo)
      campo = ''
    } else if (c === '\n' || c === '\r') {
      if (c === '\r' && s[i + 1] === '\n') i++
      riga.push(campo)
      righe.push(riga)
      riga = []
      campo = ''
    } else {
      campo += c
    }
  }
  if (campo || riga.length) {
    riga.push(campo)
    righe.push(riga)
  }

  const [intestazione, ...dati] = righe.filter((r) => r.some((v) => v.trim()))
  if (!intestazione) return []
  const colonne = intestazione.map((c) => c.trim())

  return dati.map((r) =>
    Object.fromEntries(
      colonne
        .map((col, i) => [col, (r[i] ?? '').replace(/\r\n/g, '\n').trim()] as const)
        .filter(([, v]) => v !== ''),
    ),
  )
}
