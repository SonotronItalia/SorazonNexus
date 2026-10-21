import fs from 'fs'
import path from 'path'
import type { Payload } from 'payload'

/**
 * Marchio di partenza (Impostazioni del sito > Marchio): loghi Sorazon e icona dai file in
 * seed/media/marchio. Solo se la scheda è ancora tutta vuota: non sovrascrive mai i file scelti
 * dall'admin. Usato da seed/index.ts.
 */
const FILE = {
  positivo: ['logo_sorazon.svg', 'Logo Sorazon'],
  negativo: ['logo_sorazon_neg.svg', 'Logo Sorazon per sfondo scuro'],
  icona: ['icona_sorazon.svg', 'Icona Sorazon'],
} as const

export async function seedMarchio(payload: Payload, cartella: string) {
  const { marchio } = await payload.findGlobal({ slug: 'impostazioni', depth: 0 })
  if (marchio && Object.values(marchio).some(Boolean)) return 'già impostato: non toccato'

  const data: Record<string, number> = {}
  for (const [campo, [file, alt]] of Object.entries(FILE)) {
    const { docs } = await payload.find({
      collection: 'marchio',
      where: { filename: { equals: file } },
      limit: 1,
    })
    const doc =
      docs[0] ??
      (await payload.create({
        collection: 'marchio',
        data: { alt },
        filePath: path.join(cartella, file),
      }))
    data[campo] = doc.id
  }
  await payload.updateGlobal({
    slug: 'impostazioni',
    data: { marchio: data },
    context: { disableRevalidate: true },
  })
  return `impostati ${Object.keys(data).join(', ')}`
}

export const cartellaMarchio = (dirSeed: string) => {
  const c = path.join(dirSeed, 'media', 'marchio')
  if (!fs.existsSync(c)) throw new Error(`manca la cartella ${c}`)
  return c
}
