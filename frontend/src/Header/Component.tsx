import { HeaderClient } from './Component.client'
import type { Header as HeaderType } from '@/payload-types'
import { getHeader, getImpostazioni } from '@/lib/content'
import { loghi } from '@/utilities/marchio'
import React from 'react'

export async function Header({ lingua }: { lingua: string }) {
  // Se il backend non risponde il sito resta in piedi, con la navigazione vuota
  const headerData = await getHeader(lingua).catch((e): HeaderType => {
    console.error('Header non disponibile:', e)
    return { id: 0, navItems: [] }
  })

  // Loghi da Impostazioni del sito > Marchio (stessa richiesta in cache del layout)
  const impostazioni = await getImpostazioni(lingua)

  return <HeaderClient data={headerData} loghi={loghi(impostazioni)} />
}
