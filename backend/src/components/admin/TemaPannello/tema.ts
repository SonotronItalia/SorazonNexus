/**
 * Regole del tema Sorazon del pannello. Payload mette i suoi stili nel livello CSS
 * "payload-default": queste regole, fuori da ogni livello, hanno la precedenza.
 * Celeste Sorazon (#00a3b7) per azioni, collegamenti e voce attiva; il rosso resta agli errori.
 * In tema chiaro i pulsanti usano un celeste più scuro (testo bianco leggibile, contrasto AA).
 */

// Scala del celeste Sorazon (500 = #00a3b7), al posto del blu di Payload
const CELESTE = {
  50: '#e6f8fa',
  100: '#ccf1f5',
  150: '#b3eaf0',
  200: '#99e3eb',
  250: '#80dce6',
  300: '#66d5e1',
  350: '#4dcedc',
  400: '#33c7d7',
  450: '#1ab1c4',
  500: '#00a3b7',
  550: '#0094a6',
  600: '#008596',
  650: '#007685',
  700: '#006775',
  750: '#005864',
  800: '#004954',
  850: '#003a43',
  900: '#002b32',
  950: '#001c21',
} as const

const scala = (nome: string) =>
  Object.entries(CELESTE)
    .map(([k, v]) => `--color-${nome}-${k}: ${v};`)
    .join('')

export const CSS_TEMA = (carattere: string) => `
:root {
  ${scala('success')}
  ${scala('blue')}
  --font-body: ${carattere}, system-ui, -apple-system, 'Segoe UI', sans-serif;
  --style-radius-s: 6px;
  --style-radius-m: 10px;
  --style-radius-l: 16px;
  --sorazon-azione: #007685;
  --sorazon-azione-hover: #005864;
  --sorazon-testo-azione: #ffffff;
  --sorazon-accento: #00a3b7;
  --accessibility-outline: 2px solid var(--sorazon-accento);
}
html[data-theme='dark'] {
  --sorazon-azione: #1ab1c4;
  --sorazon-azione-hover: #4dcedc;
  --sorazon-testo-azione: #001c21;
  --sorazon-accento: #33c7d7;
}

/* Pulsanti principali (Salva, Pubblica, Crea nuovo) */
.btn--style-primary:not(.btn--disabled) {
  --bg-color: var(--sorazon-azione);
  --hover-bg: var(--sorazon-azione-hover);
  --color: var(--sorazon-testo-azione);
  --hover-color: var(--sorazon-testo-azione);
}

/* Menu laterale: voce attiva e indicatore */
.nav__link-indicator { background: var(--sorazon-accento); width: 3px; }
.nav__link.active, .nav__link:has(.nav__link-indicator) { color: var(--sorazon-accento); }

/* Schede dei documenti: sottolineatura della scheda attiva */
.tabs-field__tab-button--active:after { background: var(--sorazon-accento); height: 3px; }

/* Collegamenti nel testo delle descrizioni e della guida */
.field-description a, .guida a { color: var(--sorazon-accento); }

/* Caselle spuntate */
.checkbox-input--checked .checkbox-input__input {
  background: var(--sorazon-azione);
  border-color: var(--sorazon-azione);
  color: var(--sorazon-testo-azione);
}
`
