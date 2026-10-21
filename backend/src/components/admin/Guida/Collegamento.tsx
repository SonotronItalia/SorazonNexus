'use client'

import { useConfig } from '@payloadcms/ui'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import React from 'react'

// Voce "Guida" nel menu laterale, dopo le altre voci
export const CollegamentoGuida: React.FC = () => {
  const {
    config: {
      routes: { admin },
    },
  } = useConfig()
  const attiva = usePathname()?.startsWith(`${admin}/guida`)
  return (
    <Link
      href={`${admin}/guida`}
      className={attiva ? 'nav__link active' : 'nav__link'}
      id="nav-guida"
      style={{
        marginTop: 'calc(var(--base) * 0.5)',
        fontWeight: attiva ? 600 : undefined,
        display: 'inline-flex',
        alignItems: 'center',
        gap: 8,
      }}
    >
      {/* Libro aperto (come le icone del pannello: tratto che segue il colore del testo) */}
      <svg
        aria-hidden
        width="16"
        height="16"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M2 4h6a4 4 0 0 1 4 4v12a3 3 0 0 0-3-3H2z" />
        <path d="M22 4h-6a4 4 0 0 0-4 4v12a3 3 0 0 1 3-3h7z" />
      </svg>
      <span className="nav__link-label">Guida</span>
    </Link>
  )
}
