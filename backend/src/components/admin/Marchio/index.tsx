import React from 'react'

// Marchio Sorazon al posto di quello di Payload: grande nella pagina di accesso, piccolo nel menu
export const Logo: React.FC = () => (
  // eslint-disable-next-line @next/next/no-img-element
  <img src="/logo_sorazon.svg" alt="Sorazon" style={{ width: 240, height: 'auto' }} />
)

export const Icona: React.FC = () => (
  // eslint-disable-next-line @next/next/no-img-element
  <img src="/favicon.svg" alt="Sorazon" style={{ width: 24, height: 24 }} />
)
