import React from 'react'

// Dati strutturati schema.org (JSON-LD) per motori di ricerca e assistenti AI.
// "<" diventa <: un testo del CMS non può chiudere lo <script> e iniettare codice.
export const DatiStrutturati: React.FC<{ dati: object | object[] }> = ({ dati }) => (
  <script
    type="application/ld+json"
    dangerouslySetInnerHTML={{ __html: JSON.stringify(dati).replace(/</g, '\\u003c') }}
  />
)
