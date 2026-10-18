import type React from 'react'

import { getDocumentById, getRedirects } from '@/lib/content'
import { notFound, redirect } from 'next/navigation'

interface Props {
  disableNotFound?: boolean
  url: string
}

/* Redirect gestiti dal CMS (plugin redirects), risolti lato server */
export const PayloadRedirects: React.FC<Props> = async ({ disableNotFound, url }) => {
  const redirects = await getRedirects()

  const redirectItem = redirects.find((r) => r.from === url)

  if (redirectItem) {
    if (redirectItem.to?.url) {
      redirect(redirectItem.to.url)
    }

    const reference = redirectItem.to?.reference
    if (reference) {
      const prefix = reference.relationTo !== 'pages' ? `/${reference.relationTo}` : ''
      // Con depth=1 il riferimento arriva già popolato; altrimenti è un id
      const doc =
        typeof reference.value === 'object'
          ? reference.value
          : await getDocumentById(reference.relationTo, reference.value)

      if (doc?.slug) redirect(`${prefix}/${doc.slug}`)
    }
  }

  if (disableNotFound) return null

  notFound()
}
