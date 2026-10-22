import type { Block } from 'payload'

import { Archive } from './ArchiveBlock/config'
import { CallToAction } from './CallToAction/config'
import { CentriList } from './CentriList/config'
import { CONTENITORI } from './Contenitore/config'
import { Content } from './Content/config'
import { FormBlock } from './Form/config'
import { GalleriaRisultati } from './GalleriaRisultati/config'
import { Mappa } from './Mappa/config'
import { MediaBlock } from './MediaBlock/config'
import { SchedaProdotto } from './SchedaProdotto/config'
import { NumeriEvidenza } from './NumeriEvidenza/config'
import { Carosello } from './Carosello/config'
import { ProdottoScorrimento } from './ProdottoScorrimento/config'
import { BarraProdotto } from './BarraProdotto/config'
import { Schede } from './Schede/config'
import { SchedaPersona } from './SchedaPersona/config'

// Blocchi delle pagine, registrati in config.blocks: le pagine e il Contenitore li usano per nome.
// Un nuovo blocco va aggiunto qui e in BLOCCHI_INTERNI del Contenitore.
export const BLOCCHI_PAGINA: Block[] = [
  CallToAction,
  Content,
  MediaBlock,
  Archive,
  FormBlock,
  CentriList,
  SchedaProdotto,
  GalleriaRisultati,
  Mappa,
  NumeriEvidenza,
  Carosello,
  ProdottoScorrimento,
  BarraProdotto,
  Schede,
  SchedaPersona,
  ...CONTENITORI,
]
