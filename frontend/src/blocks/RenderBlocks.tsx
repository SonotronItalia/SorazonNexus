import React, { Fragment } from 'react'

import type { Page } from '@/payload-types'

import { ArchiveBlock } from '@/blocks/ArchiveBlock/Component'
import { CallToActionBlock } from '@/blocks/CallToAction/Component'
import { ContentBlock } from '@/blocks/Content/Component'
import { FormBlock } from '@/blocks/Form/Component'
import { MediaBlock } from '@/blocks/MediaBlock/Component'
import { CentriListBlock } from '@/blocks/CentriList/Component'
import { SchedaProdottoBlock } from '@/blocks/SchedaProdotto/Component'
import { GalleriaRisultatiBlock } from '@/blocks/GalleriaRisultati/Component'
import { MappaBlock } from '@/blocks/Mappa/Component'
import { ContenitoreBlock } from '@/blocks/Contenitore/Component'

const blockComponents = {
  archive: ArchiveBlock,
  content: ContentBlock,
  cta: CallToActionBlock,
  formBlock: FormBlock,
  mediaBlock: MediaBlock,
  centriList: CentriListBlock,
  schedaProdotto: SchedaProdottoBlock,
  galleriaRisultati: GalleriaRisultatiBlock,
  mappa: MappaBlock,
}

// Tutti i livelli del Contenitore (contenitore, contenitore2, contenitore3) usano lo stesso componente
const CONTENITORI = new Set(['contenitore', 'contenitore2', 'contenitore3'])

type Blocco = Page['layout'][0] | { blockType: string; id?: string | null }

export const RenderBlocks: React.FC<{
  blocks: Blocco[] | null | undefined
  // Dentro una colonna del Contenitore: blocchi più vicini tra loro
  annidato?: boolean
}> = (props) => {
  const { blocks, annidato = false } = props

  const hasBlocks = blocks && Array.isArray(blocks) && blocks.length > 0

  if (hasBlocks) {
    const contenuto = blocks.map((block, index) => {
      const { blockType } = block
      const classe = annidato ? undefined : 'my-16'

      if (blockType && CONTENITORI.has(blockType)) {
        return (
          <div className={classe} key={index}>
            <ContenitoreBlock
              {...(block as React.ComponentProps<typeof ContenitoreBlock>)}
              renderBlocchi={(blocchi) => <RenderBlocks blocks={blocchi} annidato />}
            />
          </div>
        )
      }

      if (blockType && blockType in blockComponents) {
        const Block = blockComponents[blockType as keyof typeof blockComponents]

        if (Block) {
          return (
            <div className={classe} key={index}>
              {/* @ts-expect-error there may be some mismatch between the expected types here */}
              <Block {...block} disableInnerContainer />
            </div>
          )
        }
      }
      return null
    })

    return annidato ? <div className="space-y-8">{contenuto}</div> : <Fragment>{contenuto}</Fragment>
  }

  return null
}
