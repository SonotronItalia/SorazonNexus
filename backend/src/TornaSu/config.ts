import type { GlobalConfig } from 'payload'
import { nascostaSenzaPermesso, permesso } from '@/access/ruoli'

import { notifyFrontend } from '@/hooks/notifyFrontend'

/**
 * Pulsante "torna su": compare in basso quando si scorre la pagina e riporta in cima.
 * Solo scelte a elenco: l'aspetto preciso (misure, ombre, animazione) lo decide il codice
 * del frontend (components/TornaSu).
 */
export const TornaSu: GlobalConfig = {
  slug: 'torna-su',
  label: 'Pulsante torna su',
  admin: {
    group: 'Aspetto del sito',
    hidden: nascostaSenzaPermesso('torna-su'),
    description: 'Il pulsante che compare scorrendo la pagina e riporta in cima.',
  },
  access: {
    read: () => true,
    update: permesso('torna-su', 'modifica'),
  },
  fields: [
    {
      type: 'row',
      fields: [
        {
          name: 'attivo',
          label: 'Attivo',
          type: 'checkbox',
          defaultValue: true,
          admin: { description: 'Spento: il pulsante non compare in nessuna pagina' },
        },
        {
          name: 'telefono',
          label: 'Anche su telefono',
          type: 'checkbox',
          defaultValue: true,
          admin: { description: 'Spento: solo su schermi larghi (tablet e computer)' },
        },
      ],
    },
    {
      type: 'row',
      fields: [
        {
          name: 'icona',
          label: 'Icona',
          type: 'select',
          defaultValue: 'freccia',
          options: [
            { label: 'Freccia', value: 'freccia' },
            { label: 'Punta', value: 'punta' },
            { label: 'Doppia punta', value: 'doppia' },
            { label: 'Freccia verso la riga', value: 'riga' },
          ],
        },
        {
          name: 'posizione',
          label: 'Posizione',
          type: 'select',
          defaultValue: 'destra',
          options: [
            { label: 'In basso a destra', value: 'destra' },
            { label: 'In basso a sinistra', value: 'sinistra' },
            { label: 'In basso al centro', value: 'centro' },
          ],
        },
      ],
    },
    {
      type: 'row',
      fields: [
        {
          name: 'forma',
          label: 'Forma',
          type: 'select',
          defaultValue: 'cerchio',
          options: [
            { label: 'Cerchio', value: 'cerchio' },
            { label: 'Quadrato arrotondato', value: 'quadrato' },
          ],
        },
        {
          name: 'dimensione',
          label: 'Dimensione',
          type: 'select',
          defaultValue: 'media',
          options: [
            { label: 'Piccola', value: 'piccola' },
            { label: 'Media', value: 'media' },
            { label: 'Grande', value: 'grande' },
          ],
        },
        {
          name: 'comparsa',
          label: 'Compare dopo',
          type: 'select',
          defaultValue: 'schermo',
          options: [
            { label: 'Un breve scorrimento', value: 'breve' },
            { label: 'Mezzo schermo', value: 'mezzo' },
            { label: 'Uno schermo intero', value: 'schermo' },
          ],
        },
      ],
    },
    {
      name: 'colore',
      label: 'Colore',
      type: 'relationship',
      relationTo: 'colori',
      admin: {
        description:
          'Vuoto: il colore principale del sito (scuro nel tema chiaro, chiaro nel tema scuro). Si aggiunge o si modifica in "Colori del sito".',
      },
    },
  ],
  hooks: {
    afterChange: [notifyFrontend('globals')],
  },
}
