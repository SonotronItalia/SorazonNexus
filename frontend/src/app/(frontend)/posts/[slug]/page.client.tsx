'use client'
import { useHeaderScuro } from '@/providers/HeaderTheme'
import React from 'react'

// L'immagine dell'articolo sta sotto l'header: header scuro finché si resta qui
const PageClient: React.FC = () => {
  useHeaderScuro()
  return <React.Fragment />
}

export default PageClient
