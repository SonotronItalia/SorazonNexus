import { readFile } from 'node:fs/promises'
import path from 'node:path'

import sharp from 'sharp'

import { apiFile } from '@/lib/api'
import { getImpostazioni } from '@/lib/content'
import { type FileIcona, icone, MISURE_ICONA } from '@/utilities/marchio'

/**
 * Icone del sito ricavate dall'icona di Impostazioni del sito > Marchio (o, se manca, da
 * public/favicon.svg): /icone/icona.svg, /icone/32.png (scheda del browser), /icone/180.png
 * (iPhone, su fondo bianco: iOS riempie di nero le parti trasparenti), /icone/192.png e
 * /icone/512.png (Android, manifest), più le versioni "scura-" per il tema scuro del browser.
 * Con ?v=<data di modifica> nell'indirizzo la risposta resta in cache a lungo.
 */
const FILE = /^(scura-)?(icona\.svg|32\.png|180\.png|192\.png|512\.png)$/

const predefinita = () => readFile(path.join(process.cwd(), 'public', 'favicon.svg'))

const sorgente = async (icona: FileIcona | undefined) => {
  if (!icona) return { dati: await predefinita(), svg: true }
  try {
    // /marchio/x.svg -> /api/marchio/file/x.svg sul backend
    const dati = await apiFile(icona.url.replace(/^\/marchio\//, '/marchio/file/'), {
      tags: ['globals'],
    })
    return { dati, svg: icona.svg }
  } catch {
    return { dati: await predefinita(), svg: true }
  }
}

export async function GET(req: Request, { params }: { params: Promise<{ file: string }> }) {
  const { file } = await params
  const voce = FILE.exec(file)
  if (!voce) return new Response('Non trovata', { status: 404 })
  const [, scura, nome] = voce

  const { icona, scura: iconaScura } = icone(await getImpostazioni())
  const { dati, svg } = await sorgente((scura && iconaScura) || icona)

  const cache = new URL(req.url).searchParams.has('v')
    ? 'public, max-age=31536000, immutable'
    : 'public, max-age=3600'

  if (nome === 'icona.svg') {
    if (!svg) return new Response('Non trovata', { status: 404 })
    return new Response(new Uint8Array(dati), {
      headers: {
        'Content-Type': 'image/svg+xml',
        'Cache-Control': cache,
        // Come i file del marchio sul backend: un SVG aperto da solo non esegue nulla
        'Content-Security-Policy':
          "default-src 'none'; img-src data:; style-src 'unsafe-inline'; sandbox",
        'X-Content-Type-Options': 'nosniff',
      },
    })
  }

  const lato = MISURE_ICONA[nome.replace('.png', '') as keyof typeof MISURE_ICONA]
  // Densità alta per gli SVG: rasterizzati grandi e poi ridotti, restano nitidi a ogni misura
  let immagine = sharp(dati, svg ? { density: 300 } : {}).resize(lato, lato, {
    fit: 'contain',
    background: { r: 0, g: 0, b: 0, alpha: 0 },
  })
  if (lato === 180) immagine = immagine.flatten({ background: '#ffffff' })
  const png = await immagine.png().toBuffer()
  return new Response(new Uint8Array(png), {
    headers: { 'Content-Type': 'image/png', 'Cache-Control': cache },
  })
}
