import { HeaderClient } from './Component.client'
import type { Header as HeaderType } from '@/payload-types'
import { getHeader } from '@/lib/content'
import React from 'react'

export async function Header() {
  // Se il backend non risponde il sito resta in piedi, con la navigazione vuota
  const headerData = await getHeader().catch((e): HeaderType => {
    console.error('Header non disponibile:', e)
    return { id: 0, navItems: [] }
  })

  return <HeaderClient data={headerData} />
}
