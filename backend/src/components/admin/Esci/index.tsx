'use client'

import { LogOutIcon, useConfig } from '@payloadcms/ui'
import Link from 'next/link'
import React from 'react'

// Pulsante di uscita in fondo al menu laterale, con il testo (Payload mostra solo un'icona)
export const Esci: React.FC = () => {
  const {
    config: {
      admin: {
        routes: { logout },
      },
      routes: { admin },
    },
  } = useConfig()
  return (
    <Link
      href={`${admin}${logout}`}
      className="nav__log-out"
      style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', width: 'auto' }}
    >
      <LogOutIcon />
      <span>Esci</span>
    </Link>
  )
}
