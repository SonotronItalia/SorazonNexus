'use client'

import React from 'react'

// Il browser apre la stampa: da lì si sceglie "Salva come PDF"
export const Stampa: React.FC = () => (
  <button type="button" className="btn btn--style-secondary btn--size-small" onClick={() => window.print()}>
    Stampa o salva in PDF
  </button>
)
