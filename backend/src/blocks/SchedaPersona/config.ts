import type { Block } from 'payload'

import { sfondoSezione } from '@/fields/sfondoSezione'

// Scheda di una persona (es. il medico che ha condotto uno studio): foto grande e, a fianco,
// ruolo, nome e testo formattato con qualifiche e incarichi
export const SchedaPersona: Block = {
  slug: 'schedaPersona',
  interfaceName: 'SchedaPersonaBlock',
  labels: { singular: 'Scheda persona', plural: 'Schede persona' },
  fields: [
    {
      type: 'row',
      fields: [
        {
          name: 'ruolo',
          label: 'Ruolo',
          type: 'text',
          admin: { description: 'Riga piccola sopra il nome, es. Direttore Sanitario' },
        },
        { name: 'nome', label: 'Nome', type: 'text', required: true },
      ],
    },
    { name: 'richText', label: 'Testo', type: 'richText' },
    {
      name: 'foto',
      label: 'Foto',
      type: 'upload',
      relationTo: 'media',
      admin: { description: 'Meglio verticale (proporzione 4:5): viene ritagliata al centro.' },
    },
    {
      type: 'row',
      fields: [
        {
          name: 'posizioneFoto',
          label: 'Posizione della foto',
          type: 'select',
          defaultValue: 'sinistra',
          options: [
            { label: 'Foto a sinistra', value: 'sinistra' },
            { label: 'Foto a destra', value: 'destra' },
          ],
        },
        sfondoSezione('nessuno'),
      ],
    },
  ],
}
