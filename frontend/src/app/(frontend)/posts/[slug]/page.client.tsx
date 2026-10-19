'use client'
import { useHeaderScuro } from '@/providers/HeaderTheme'
import React from 'react'

// Con l'immagine a tutto schermo l'header le sta sopra: header scuro finché si resta qui
const PageClient: React.FC<{ scuro: boolean }> = ({ scuro }) => {
  useHeaderScuro(scuro)
  return <React.Fragment />
}

export default PageClient
