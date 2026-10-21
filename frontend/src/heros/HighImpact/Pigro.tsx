'use client'

// Caricamento in differita: Next carica su ogni pagina il JavaScript di tutti i componenti che la
// pagina potrebbe mostrare. Un import dinamico divide il codice solo se fatto da un componente
// client (con un componente server non funziona), quindi passa da questo piccolo file.
// La parte server (HTML) resta uguale: il codice arriva solo nelle pagine che lo usano.
import dynamic from 'next/dynamic'

export const HighImpactHero = dynamic(() => import('./index').then((m) => m.HighImpactHero))
