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

/* Menu laterale scuro, come l'apertura del sito: blu notte in entrambi i temi */
aside.nav {
  --nav-testo: rgba(226, 232, 240, 0.82);
  background: linear-gradient(180deg, #0b1a3a 0%, #020617 100%);
  color: var(--nav-testo);
  border-inline-end: 0;
}
aside.nav .nav__scroll { background: transparent; }
.nav-group__toggle {
  color: #4dcedc;
  font-size: 11px;
  font-weight: 600;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  margin-top: 6px;
}
.nav-group__toggle:hover, .nav-group__toggle:focus-visible { color: #99e3eb; }
.nav-group__toggle .stroke, .nav-group__toggle:hover .stroke { stroke: currentColor; }
.nav-group__indicator svg .stroke { stroke: currentColor; }
.nav .nav__link, .nav a.nav__link {
  color: var(--nav-testo);
  border-radius: 999px;
  padding: 3px 12px;
  margin-inline-start: -12px;
  transition: background-color 0.15s, color 0.15s;
}
.nav a.nav__link:hover, .nav a.nav__link:focus-visible {
  color: #ffffff;
  background: rgba(255, 255, 255, 0.07);
  text-decoration: none;
}
/* Voce attiva: pillola celeste (al posto della lineetta di Payload) */
.nav .nav__link.active, .nav .nav__link:has(.nav__link-indicator) {
  color: #ffffff;
  background: #00788a;
  font-weight: 600;
}
.nav__link-indicator { display: none; }
.nav .browse-by-folder-button {
  color: var(--nav-testo);
  background: rgba(255, 255, 255, 0.06);
  border-color: rgba(255, 255, 255, 0.12);
}
.nav .browse-by-folder-button:hover { color: #ffffff; background: rgba(255, 255, 255, 0.1); }
.nav .browse-by-folder-button svg .stroke, .nav .browse-by-folder-button svg path { stroke: currentColor; }
.nav__controls a, .nav__log-out { color: var(--nav-testo); }
.nav__controls a:hover, .nav__log-out:hover { color: #ffffff; }
/* Pulsante che chiude il menu, sopra il fondo scuro */
.template-default--nav-open .template-default__nav-toggler { color: #ffffff; }
.template-default--nav-open .template-default__nav-toggler .stroke { stroke: #ffffff; }

/* Home del pannello: schede bianche con bordo sottile, celeste al passaggio del mouse */
.collections__label { font-weight: 600; letter-spacing: -0.02em; }
.collections .card {
  background: var(--theme-elevation-0);
  border: 1px solid var(--theme-elevation-100);
  border-radius: var(--style-radius-l);
  box-shadow: 0 1px 2px rgb(0 0 0 / 0.04);
  transition: border-color 0.15s, box-shadow 0.15s, transform 0.15s;
}
.collections .card:hover {
  border-color: var(--sorazon-accento);
  box-shadow: 0 6px 18px rgb(0 163 183 / 0.14);
}
html[data-theme='dark'] .collections .card { background: var(--theme-elevation-50); }

/* Pallini (Tema Admin e tutte le scelte a pallino) */
.radio-input__styled-radio:before { background-color: var(--sorazon-azione); }
.radio-input--is-selected .radio-input__styled-radio { border-color: var(--sorazon-azione); }

/* Campo attivo con bordo celeste */
.field-type input:focus, .field-type textarea:focus, .rs__control--is-focused {
  border-color: var(--sorazon-accento) !important;
  box-shadow: 0 0 0 3px rgb(0 163 183 / 0.15) !important;
}

/* Barra in alto: selettore della lingua e avatar in tinta */
.localizer-button { background-color: rgb(0 163 183 / 0.1); }
.localizer-button__label { color: var(--sorazon-accento); }
.app-header__account img, .app-header__account svg {
  border-radius: 999px;
  box-shadow: 0 0 0 2px var(--sorazon-accento);
}
`
