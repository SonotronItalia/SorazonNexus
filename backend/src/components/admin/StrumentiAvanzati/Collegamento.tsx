'use client'

import { useAuth, useConfig } from '@payloadcms/ui'
import Link from 'next/link'
import React from 'react'

import { PERCORSO_STRUMENTI } from './voci'

// Riquadro in cima a "Impostazioni del sito": porta agli Strumenti avanzati (solo amministratori)
export const Collegamento: React.FC = () => {
  const { user } = useAuth<{ ruolo?: string }>()
  const {
    config: {
      routes: { admin },
    },
  } = useConfig()
  if (user?.ruolo !== 'amministratore') return null
  return (
    <div
      style={{
        border: '1px solid var(--theme-elevation-150)',
        borderRadius: 'var(--style-radius-m)',
        padding: 'calc(var(--base) * 0.75) var(--base)',
        marginBottom: 'var(--base)',
      }}
    >
      <strong>Strumenti avanzati</strong> (solo amministratori): utenti, reindirizzamenti,
      categorie, tipi di effetto, indice di ricerca.{' '}
      <Link href={`${admin}${PERCORSO_STRUMENTI}`} style={{ textDecoration: 'underline' }}>
        Apri
      </Link>
    </div>
  )
}
