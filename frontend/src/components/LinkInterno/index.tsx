'use client'

import Link from 'next/link'
import React from 'react'

import { useLingua } from '@/providers/Lingua'
import { percorsoDoc, urlNellaLingua } from '@/utilities/lingue'

// Collegamento a una pagina o notizia dentro un testo del CMS, nella lingua della pagina
export const LinkInterno: React.FC<{
  raccolta: 'pages' | 'posts'
  slug: string
  nuovaScheda?: boolean | null
  children: React.ReactNode
}> = ({ raccolta, slug, nuovaScheda, children }) => {
  const { lingua } = useLingua()
  return (
    <Link
      href={percorsoDoc(lingua, slug, raccolta)}
      {...(nuovaScheda ? { target: '_blank', rel: 'noopener noreferrer' } : {})}
    >
      {children}
    </Link>
  )
}

// Indirizzo scritto a mano in un testo del CMS (es. "/privacy-policy"): nella lingua della pagina
export const LinkScritto: React.FC<{
  url: string
  nuovaScheda?: boolean | null
  children: React.ReactNode
}> = ({ url, nuovaScheda, children }) => {
  const { lingua } = useLingua()
  return (
    <Link
      href={urlNellaLingua(lingua, url)}
      {...(nuovaScheda ? { target: '_blank', rel: 'noopener noreferrer' } : {})}
    >
      {children}
    </Link>
  )
}
