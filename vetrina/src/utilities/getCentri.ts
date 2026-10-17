import configPromise from '@payload-config'
import { unstable_cache } from 'next/cache'
import { getPayload } from 'payload'

import { CENTRI_TAG } from './cacheTags'

export const getCentri = unstable_cache(
  async () => {
    const payload = await getPayload({ config: configPromise })
    const { docs } = await payload.find({
      collection: 'centri',
      pagination: false,
      depth: 0,
    })
    return docs
  },
  ['centri-elenco'],
  { tags: [CENTRI_TAG] },
)