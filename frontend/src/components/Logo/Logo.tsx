import React from 'react'

import { cn } from '@/utilities/ui'

interface Props {
  /** Altezza (classe Tailwind scritta per intero), es. "h-[44px]" nell'header compatto */
  altezza?: string
  /** Sempre la versione per sfondo scuro (es. piè di pagina nero) */
  scuro?: boolean
}

/**
 * Logo come immagine di sfondo: il browser scarica solo la versione che mostra. La versione
 * negativa (logo_sorazon_neg.svg, 388 KB perché contiene un'immagine) vale con il tema scuro
 * e sotto un hero scuro (data-theme="dark" sull'header), oppure sempre con "scuro".
 */
export const Logo = ({ altezza = 'h-[76px]', scuro = false }: Props) => (
  <span
    role="img"
    aria-label="Sorazon"
    className={cn(
      // Larghezza dalle proporzioni del disegno (842 x 254): niente spazio vuoto accanto
      'block aspect-[842/254] max-w-full shrink-0 bg-contain bg-left bg-no-repeat transition-[height] duration-300',
      altezza,
      scuro
        ? 'bg-[url(/logo_sorazon_neg.svg)]'
        : 'bg-[url(/logo_sorazon.svg)] dark:bg-[url(/logo_sorazon_neg.svg)]',
    )}
  />
)
