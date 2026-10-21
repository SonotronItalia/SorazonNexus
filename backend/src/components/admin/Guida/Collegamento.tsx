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
      className="nav__link"
      id="nav-guida"
      style={{ marginTop: 'calc(var(--base) * 0.5)', fontWeight: attiva ? 600 : undefined }}
    >
      <span className="nav__link-label">📖 Guida</span>
    </Link>
  )
}
