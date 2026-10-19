import Link from 'next/link'
import React from 'react'

import { Button } from '@/components/ui/button'

export default function NotFound() {
  return (
    <div className="container py-28">
      <div className="prose max-w-none dark:prose-invert">
        <h1 style={{ marginBottom: 0 }}>Pagina non trovata</h1>
        <p className="mb-4">
          L&apos;indirizzo potrebbe essere cambiato con il nuovo sito. Puoi ripartire dalla home,
          cercare un centro Sorazon o scriverci.
        </p>
      </div>
      <div className="flex flex-wrap gap-3">
        <Button asChild variant="default">
          <Link href="/">Vai alla home</Link>
        </Button>
        <Button asChild variant="outline">
          <Link href="/centri">Trova un centro</Link>
        </Button>
        <Button asChild variant="outline">
          <Link href="/contatti">Contatti</Link>
        </Button>
      </div>
    </div>
  )
}
