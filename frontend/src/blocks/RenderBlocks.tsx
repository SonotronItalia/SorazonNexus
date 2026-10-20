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
import { Rivela } from '@/components/Rivela'
import { NumeriEvidenzaBlock } from '@/blocks/NumeriEvidenza/Component'
import { CaroselloBlock } from '@/blocks/Carosello/Component'
import { ProdottoScorrimentoBlock } from '@/blocks/ProdottoScorrimento/Component'
import { BarraProdottoBlock } from '@/blocks/BarraProdotto/Component'
import { SchedeBlock } from '@/blocks/Schede/Component'
import { conSfondo } from '@/components/SezioneSfondo'

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
  numeriEvidenza: NumeriEvidenzaBlock,
  carosello: CaroselloBlock,
  prodottoScorrimento: ProdottoScorrimentoBlock,
  barraProdotto: BarraProdottoBlock,
  schede: SchedeBlock,
}

// Blocchi con un'animazione propria (o fissi in alto): niente comparsa morbida attorno
const ANIMATI = new Set([
  'numeriEvidenza',
  'prodottoScorrimento',
  'carosello',
  'barraProdotto',
  'schede',
])

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
      // Blocchi con uno sfondo proprio (fascia a tutta larghezza): niente margini attorno
      const classe = annidato || conSfondo(block) ? undefined : 'my-16'

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
          // @ts-expect-error there may be some mismatch between the expected types here
          const blocco = <Block {...block} disableInnerContainer />
          // Comparsa morbida quando il blocco entra nello schermo (non dentro le colonne)
          return annidato || ANIMATI.has(blockType) ? (
            // Sezioni a tutta larghezza senza margini; la barra prodotto "contents" per restare fissa
            <div
              className={
                blockType === 'barraProdotto'
                  ? 'contents'
                  : ANIMATI.has(blockType)
                    ? undefined
                    : classe
              }
              key={index}
            >
              {blocco}
            </div>
          ) : (
            <Rivela className={classe} key={index}>
              {blocco}
            </Rivela>
          )
        }
      }
      return null
    })

    return annidato ? (
      <div className="space-y-8">{contenuto}</div>
    ) : (
      <Fragment>{contenuto}</Fragment>
    )
  }

  return null
}
