import React from 'react'

import type { BarraProdottoBlock as Props } from '@/payload-types'
import { CMSLink } from '@/components/Link'

/**
 * Barra del prodotto, fissa sotto l'header mentre si scorre (stile pagine prodotto): nome a
 * sinistra, pulsante a destra. Si mette come primo blocco della pagina; il suo contenitore in
 * RenderBlocks è "contents", così resta fissa per tutta la pagina.
 */
export const BarraProdottoBlock: React.FC<Props> = ({ nome, sottotitolo, link }) => (
  <div className="sticky top-[60px] z-30 border-b border-border/60 bg-background/75 backdrop-blur-xl backdrop-saturate-150 md:top-[68px]">
    <div className="container flex h-14 items-center justify-between gap-4">
      <p className="truncate">
        <span className="text-lg font-semibold tracking-tight">{nome}</span>
        {sottotitolo && (
          <span className="ml-3 text-sm text-muted-foreground max-sm:hidden">{sottotitolo}</span>
        )}
      </p>
      {link && (
        <CMSLink
          {...link}
          appearance="inline"
          className="shrink-0 rounded-full bg-cyan-600 px-4 py-1.5 text-sm font-medium text-white transition-colors hover:bg-cyan-500"
        />
      )}
    </div>
  </div>
)
