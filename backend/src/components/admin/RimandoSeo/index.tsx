'use client'

import { useConfig } from '@payloadcms/ui'
import Link from 'next/link'
import React from 'react'

// In cima a "Impostazioni del sito": nome, descrizione, Google e assistenti AI stanno in SEO
export const RimandoSeo: React.FC = () => {
  const {
    config: {
      routes: { admin },
    },
  } = useConfig()
  return (
    <div
      style={{
        border: '1px solid var(--theme-elevation-150)',
        borderRadius: 'var(--style-radius-m)',
        padding: 'calc(var(--base) * 0.75) var(--base)',
        marginBottom: 'var(--base)',
      }}
    >
      Nome e descrizione del sito, titolo su Google, assistenti AI e dati dell&apos;azienda sono in{' '}
      <Link href={`${admin}/globals/seo`} style={{ textDecoration: 'underline' }}>
        Avanzate › SEO e motori AI
      </Link>
      .
    </div>
  )
}
