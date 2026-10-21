'use client'

import { useConfig } from '@payloadcms/ui'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import React from 'react'

// Voce "Cestino" nel menu laterale, subito dopo il gruppo Avanzate (l'ultimo: ordineMenu)
export const CollegamentoCestino: React.FC = () => {
  const {
    config: {
      routes: { admin },
    },
  } = useConfig()
  const attiva = usePathname()?.startsWith(`${admin}/cestino`)
  return (
    <Link
      href={`${admin}/cestino`}
      className={attiva ? 'nav__link active' : 'nav__link'}
      id="nav-cestino"
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: 8,
        fontWeight: attiva ? 600 : undefined,
      }}
    >
      {/* Cestino (tratto che segue il colore del testo) */}
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
        <path d="M3 6h18" />
        <path d="M8 6V4h8v2" />
        <path d="M19 6l-1 14H6L5 6" />
      </svg>
      <span className="nav__link-label">Cestino</span>
    </Link>
  )
}
