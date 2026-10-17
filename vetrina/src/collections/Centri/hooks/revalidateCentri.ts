import { revalidateTag } from 'next/cache'
import type { CollectionAfterChangeHook, CollectionAfterDeleteHook } from 'payload'

import { CENTRI_TAG } from '@/utilities/cacheTags'

export const revalidateCentri: CollectionAfterChangeHook = ({ doc, req: { payload, context } }) => {
  if (!context.disableRevalidate) {
    payload.logger.info('Cache dei centri aggiornata')
    revalidateTag(CENTRI_TAG, { expire: 0 })
  }
  return doc
}

export const revalidateCentriDopoCancellazione: CollectionAfterDeleteHook = ({
  doc,
  req: { payload, context },
}) => {
  if (!context.disableRevalidate) {
    payload.logger.info('Cache dei centri aggiornata')
    revalidateTag(CENTRI_TAG, { expire: 0 })
  }
  return doc
}