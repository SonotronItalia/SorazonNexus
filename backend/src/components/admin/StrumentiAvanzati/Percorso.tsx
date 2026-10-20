'use client'

import { useStepNav } from '@payloadcms/ui'
import { useEffect } from 'react'

// Percorso in cima alla pagina dell'admin ("/ Strumenti avanzati")
export const Percorso: React.FC = () => {
  const { setStepNav } = useStepNav()
  useEffect(() => {
    setStepNav([{ label: 'Strumenti avanzati' }])
  }, [setStepNav])
  return null
}
