import React from 'react'

// Marchio Sorazon al posto di quello di Payload: grande nella pagina di accesso, piccolo nel menu.
// Logo come sfondo (custom.scss): con il tema scuro del pannello la versione negativa
export const Logo: React.FC = () => <span role="img" aria-label="Sorazon" className="marchio-sorazon" />

export const Icona: React.FC = () => (
  // eslint-disable-next-line @next/next/no-img-element
  <img src="/favicon.svg" alt="Sorazon" style={{ width: 24, height: 24 }} />
)
