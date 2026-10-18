'use client'
import { RefreshRouteOnSave } from '@payloadcms/live-preview-react'
import { useRouter } from 'next/navigation'
import React from 'react'

// Ricarica la pagina quando l'editor salva nel pannello (live preview).
// serverURL è l'indirizzo pubblico del pannello: i messaggi da altre origini vengono ignorati.
export const LivePreviewListener: React.FC<{ serverURL: string }> = ({ serverURL }) => {
  const router = useRouter()
  return <RefreshRouteOnSave refresh={router.refresh} serverURL={serverURL} />
}
