import type { CollectionConfig } from 'payload'

import { nascostoAiRedattori, soloAmministratori } from '../access/ruoli'
import { notifyFrontend } from '@/hooks/notifyFrontend'

// Esempio proposto a ogni nuovo tipo: stelle che si accendono e spengono lentamente
const ESEMPIO_JS = `// Disegna sul canvas "effetto". Parametri in window.EFFETTO:
//   colore ("#rrggbb"), intensita (0.5 / 1 / 1.4), velocita (0.6 / 1 / 1.5), puntoX e puntoY (0-1)
// Usa requestAnimationFrame e movimenti lenti: niente lampeggi.
const { colore, intensita, velocita } = window.EFFETTO
const canvas = document.getElementById('effetto')
const ctx = canvas.getContext('2d')
let stelle = []

function ridimensiona() {
  canvas.width = canvas.clientWidth * devicePixelRatio
  canvas.height = canvas.clientHeight * devicePixelRatio
  ctx.setTransform(devicePixelRatio, 0, 0, devicePixelRatio, 0, 0)
  stelle = Array.from({ length: Math.round(50 * intensita) }, () => ({
    x: Math.random() * canvas.clientWidth,
    y: Math.random() * canvas.clientHeight,
    r: 0.5 + Math.random() * 1.5,
    fase: Math.random() * Math.PI * 2,
  }))
}

function disegna(t) {
  ctx.clearRect(0, 0, canvas.clientWidth, canvas.clientHeight)
  ctx.fillStyle = colore
  for (const s of stelle) {
    // Luminosità che varia in alcuni secondi (lenta, mai a scatti)
    ctx.globalAlpha = 0.3 + 0.7 * (0.5 + 0.5 * Math.sin(s.fase + (t / 1500) * velocita))
    ctx.beginPath()
    ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2)
    ctx.fill()
  }
  requestAnimationFrame(disegna)
}

addEventListener('resize', ridimensiona)
ridimensiona()
requestAnimationFrame(disegna)
`

/**
 * Tipi di effetto personalizzati: codice CSS e JavaScript scritto nell'admin.
 * Sul sito il codice gira in un iframe "sandbox" senza accesso alla pagina, ai cookie o ai dati
 * del visitatore, e una Content Security Policy blocca qualsiasi richiesta in rete: può solo
 * disegnare nel suo riquadro (frontend/src/components/Effetti/Personalizzato.tsx).
 * La fotosensibilità non si può verificare in automatico: serve la dichiarazione di chi lo salva.
 */
export const TipiEffetto: CollectionConfig = {
  slug: 'tipi-effetto',
  labels: { singular: 'Tipo di effetto', plural: 'Tipi di effetto' },
  admin: {
    useAsTitle: 'nome',
    defaultColumns: ['nome', 'updatedAt'],
    // Si scrive codice: solo amministratori (i redattori usano gli effetti già pronti)
    group: 'Avanzate',
    hidden: nascostoAiRedattori,
    description:
      'Nuovi tipi di animazione scritti in CSS e JavaScript. Si usano dalla sezione "Effetti" scegliendo il tipo "Personalizzato".',
  },
  access: {
    read: () => true,
    create: soloAmministratori,
    update: soloAmministratori,
    delete: soloAmministratori,
  },
  fields: [
    {
      name: 'nome',
      type: 'text',
      required: true,
      unique: true,
      admin: { description: 'Es. Stelle' },
    },
    { name: 'descrizione', type: 'textarea' },
    {
      name: 'javascript',
      label: 'JavaScript',
      type: 'code',
      defaultValue: ESEMPIO_JS,
      admin: {
        language: 'javascript',
        description:
          'Disegna su <canvas id="effetto"> (occupa tutto il riquadro). Parametri in window.EFFETTO: colore, intensita, velocita, puntoX, puntoY (punto di partenza, da 0 a 1). Niente rete, niente accesso alla pagina: il codice gira isolato.',
      },
    },
    {
      name: 'css',
      label: 'CSS',
      type: 'code',
      admin: {
        language: 'css',
        description:
          "Facoltativo: stili e animazioni dentro il riquadro dell'effetto (es. @keyframes). Lo sfondo resta trasparente.",
      },
    },
    {
      name: 'verificato',
      label:
        "Ho verificato che l'effetto non lampeggia (al massimo 3 variazioni forti di luce al secondo) e si muove lentamente",
      type: 'checkbox',
      required: true,
      admin: {
        description:
          'Obbligatorio: i lampeggi possono provocare crisi in persone fotosensibili. Il sito non può controllarlo da solo.',
      },
      validate: (valore: unknown) =>
        valore === true || "Conferma di aver verificato che l'effetto non lampeggia",
    },
  ],
  hooks: {
    afterChange: [notifyFrontend('pages', 'globals')],
    afterDelete: [notifyFrontend('pages', 'globals')],
  },
}
