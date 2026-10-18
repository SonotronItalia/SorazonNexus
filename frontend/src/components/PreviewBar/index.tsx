import { draftMode } from 'next/headers'
import React from 'react'

import { LivePreviewListener } from './LivePreviewListener'

// Barra visibile solo in anteprima: ricorda che si vedono le bozze e permette di uscire
export async function PreviewBar() {
  const { isEnabled } = await draftMode()
  if (!isEnabled) return null

  return (
    <div className="sticky top-0 z-50 flex items-center justify-center gap-4 bg-amber-400 px-4 py-2 text-sm text-black">
      <span>Anteprima: stai vedendo le bozze non pubblicate.</span>
      {/* <a> e non <Link>: il prefetch cancellerebbe il cookie dell'anteprima */}
      {/* eslint-disable-next-line @next/next/no-html-link-for-pages -- voluto, vedi sopra */}
      <a className="font-medium underline" href="/next/exit-preview">
        Esci dall&apos;anteprima
      </a>
      <LivePreviewListener serverURL={process.env.BACKEND_PUBLIC_URL || 'http://localhost:3001'} />
    </div>
  )
}
