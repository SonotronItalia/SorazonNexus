import fs from 'fs'
import path from 'path'
import { APIError, type CollectionConfig } from 'payload'
import { fileURLToPath } from 'url'

import { nascostaSenzaPermesso, permesso } from '@/access/ruoli'
import { soloAdminEliminaDefinitivo } from '@/hooks/cestino'
import { notifyFrontend } from '@/hooks/notifyFrontend'
import { CACHE_MEDIA } from '@/utilities/cacheMedia'

const dirname = path.dirname(fileURLToPath(import.meta.url))

// Riferimenti a indirizzi esterni dentro un SVG (href, src, url(...)): un logo non ne ha bisogno e
// aperto da solo il file potrebbe caricare risorse di altri siti. Le immagini incorporate (data:)
// restano ammesse
export const RIFERIMENTO_ESTERNO = /(?:href|src)\s*=\s*["']\s*(?:https?:)?\/\/|url\(\s*["']?\s*(?:https?:)?\/\//i

/**
 * File del marchio: loghi e icona del sito, scelti in Impostazioni del sito > Marchio.
 * È l'unico posto del pannello che accetta SVG (i loghi lo sono quasi sempre), con tre difese:
 * 1. Payload rifiuta gli SVG con script, gestori di eventi, foreignObject, link javascript:,
 *    entità XML (controllo integrato sugli upload);
 * 2. qui si rifiutano anche i riferimenti a indirizzi esterni;
 * 3. i file si servono con una Content-Security-Policy "sandbox" che non lascia eseguire nulla
 *    nemmeno aprendo il file da solo nel browser.
 * Un file pericoloso viene rifiutato, non modificato: il logo che compare è quello caricato.
 */
export const Marchio: CollectionConfig = {
  slug: 'marchio',
  labels: { singular: 'File del marchio', plural: 'File del marchio' },
  // Si sceglie dalla scheda Marchio delle Impostazioni; l'elenco nel menu serve per vedere ed
  // eliminare i file caricati (un file eliminato e ancora in uso lascia il campo vuoto: il sito
  // torna al logo Sorazon predefinito)
  admin: {
    group: 'Impostazioni',
    hidden: nascostaSenzaPermesso('impostazioni'),
    useAsTitle: 'filename',
    defaultColumns: ['filename', 'alt', 'mimeType', 'updatedAt'],
    description:
      'Loghi e icone caricati dalla scheda Marchio delle Impostazioni del sito. Qui puoi eliminare quelli che non servono più: se elimini un file ancora scelto, il sito torna al logo Sorazon predefinito.',
  },
  // Cestino come le altre voci: eliminazione definitiva solo amministratori (hooks/cestino.ts).
  // Un file nel cestino non si usa più: il sito torna al logo predefinito finché non lo si ripristina
  trash: true,
  access: {
    read: () => true,
    create: permesso('impostazioni', 'modifica'),
    update: permesso('impostazioni', 'modifica'),
    delete: permesso('impostazioni', 'modifica'),
  },
  fields: [{ name: 'alt', label: 'Descrizione (testo alternativo)', type: 'text' }],
  upload: {
    mimeTypes: ['image/svg+xml', 'image/png', 'image/webp'],
    staticDir: process.env.MEDIA_DIR
      ? path.join(process.env.MEDIA_DIR, 'marchio')
      : path.resolve(dirname, '../../public/marchio'),
    modifyResponseHeaders: ({ headers }) => {
      headers.set(
        'Content-Security-Policy',
        "default-src 'none'; img-src data:; style-src 'unsafe-inline'; sandbox",
      )
      headers.set('X-Content-Type-Options', 'nosniff')
      headers.set('Cache-Control', CACHE_MEDIA)
      return headers
    },
  },
  hooks: {
    // Il sito legge i loghi dalle Impostazioni (tag "globals"): file sostituito o eliminato = cache da rinnovare
    afterChange: [notifyFrontend('globals')],
    afterDelete: [notifyFrontend('globals')],
    beforeDelete: [soloAdminEliminaDefinitivo],
    beforeValidate: [
      ({ req }) => {
        const file = req.file
        if (!file || !/svg/i.test(file.mimetype ?? '') && !/\.svg$/i.test(file.name ?? '')) return
        const contenuto =
          file.data && file.data.length > 0
            ? file.data.toString('utf8')
            : file.tempFilePath
              ? fs.readFileSync(file.tempFilePath, 'utf8')
              : ''
        if (RIFERIMENTO_ESTERNO.test(contenuto)) {
          throw new APIError(
            "L'SVG contiene collegamenti a indirizzi esterni: esportalo di nuovo con le immagini incorporate.",
            400,
            null,
            true,
          )
        }
      },
    ],
  },
}
