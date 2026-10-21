import React from 'react'

import type { CoppiaLoghi } from '@/utilities/marchio'
import { cn } from '@/utilities/ui'

interface Props {
  /** Versioni per sfondo chiaro e scuro (Impostazioni del sito > Marchio, utilities/marchio.ts) */
  logo: CoppiaLoghi
  /** Altezza (classe Tailwind scritta per intero), es. "h-[44px]" nell'header compatto */
  altezza?: string
  className?: string
}

/**
 * Logo come immagine di sfondo: il browser scarica solo la versione che mostra. Quella scura vale
 * con il tema scuro e sotto un hero scuro (data-theme="dark" sull'header). La larghezza segue le
 * proporzioni del file caricato.
 */
export const Logo = ({ logo, altezza = 'h-[76px]', className }: Props) => (
  <span
    role="img"
    aria-label="Sorazon"
    className={cn(
      // Niente max-width: con le proporzioni (aspect-ratio) Safari calcolerebbe larghezza 0
      'block shrink-0 bg-contain bg-left bg-no-repeat transition-[height] duration-300',
      'bg-[image:var(--logo)] dark:bg-[image:var(--logo-scuro)]',
      altezza,
      className,
    )}
    style={
      {
        '--logo': `url("${logo.chiaro.url}")`,
        '--logo-scuro': `url("${logo.scuro.url}")`,
        aspectRatio: `${logo.chiaro.larghezza} / ${logo.chiaro.altezza}`,
      } as React.CSSProperties
    }
  />
)
