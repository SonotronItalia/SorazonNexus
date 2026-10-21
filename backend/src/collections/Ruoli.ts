import { APIError, type CollectionConfig, type Field } from 'payload'

import { authenticated } from '@/access/authenticated'
import { RISORSE, type Azione } from '@/access/risorse'
import { nascostaSenzaPermesso, permesso } from '@/access/ruoli'
import { LINGUE_TRADUCIBILI } from '@/lingue'

const ETICHETTE: Record<Azione, string> = {
  vede: 'Vede',
  crea: 'Crea',
  modifica: 'Modifica',
  elimina: 'Elimina',
}

// Una riga di caselle per ogni voce dell'admin (elenco in access/risorse.ts)
const campiPermessi: Field[] = RISORSE.map((r) => ({
  name: r.chiave,
  label: r.etichetta,
  type: 'group',
  fields: [
    {
      type: 'row',
      fields: r.azioni.map((a) => ({
        name: a,
        label: ETICHETTE[a],
        type: 'checkbox',
        defaultValue: false,
      })),
    },
  ],
}))

/**
 * Ruoli degli utenti con i loro permessi. "Accesso completo" vale come amministratore.
 * Protezioni: un ruolo assegnato non si elimina e nessuno toglie l'accesso completo al proprio
 * ruolo (così non si resta chiusi fuori dall'admin).
 */
export const Ruoli: CollectionConfig = {
  slug: 'ruoli',
  labels: { singular: 'Ruolo', plural: 'Ruoli e permessi' },
  admin: {
    group: 'Avanzate',
    useAsTitle: 'nome',
    defaultColumns: ['nome', 'completo', 'descrizione'],
    hidden: nascostaSenzaPermesso('ruoli'),
    description:
      'Cosa può fare chi ha ciascun ruolo. "Vede" mostra la voce nel menu; le altre caselle permettono di creare, modificare ed eliminare.',
  },
  access: {
    // I nomi dei ruoli non sono riservati: servono anche per mostrare il ruolo di ogni utente
    read: authenticated,
    create: permesso('ruoli', 'crea'),
    update: permesso('ruoli', 'modifica'),
    delete: permesso('ruoli', 'elimina'),
  },
  fields: [
    { name: 'nome', label: 'Nome', type: 'text', required: true, unique: true },
    { name: 'descrizione', label: 'Descrizione', type: 'textarea' },
    {
      name: 'completo',
      label: 'Accesso completo (amministratore)',
      type: 'checkbox',
      defaultValue: false,
      admin: { description: 'Vede e può modificare tutto, compresi utenti e ruoli.' },
    },
    {
      // Permessi a sé, oltre a quelli voce per voce: tradurre pagine, notizie, menu, moduli…
      // in una lingua. L'accesso completo li comprende tutti
      name: 'traduzioni',
      label: 'Traduzioni',
      type: 'group',
      admin: {
        condition: (_, s) => !s?.completo,
        description:
          'Lingue in cui chi ha questo ruolo può tradurre. Per tradurre una voce serve anche "Vede" su quella voce; per l\'italiano vale "Modifica".',
      },
      fields: [
        {
          type: 'row',
          fields: LINGUE_TRADUCIBILI.map((l) => ({
            name: l.codice,
            label: `Traduce in ${l.etichetta.toLowerCase()}`,
            type: 'checkbox' as const,
            defaultValue: false,
          })),
        },
      ],
    },
    {
      name: 'permessi',
      label: 'Permessi voce per voce',
      type: 'group',
      admin: { condition: (_, s) => !s?.completo },
      fields: campiPermessi,
    },
  ],
  hooks: {
    beforeChange: [
      ({ data, originalDoc, req, operation }) => {
        const mio = (req.user as { profilo?: unknown } | null)?.profilo
        const mioId = mio && typeof mio === 'object' ? (mio as { id: unknown }).id : mio
        if (operation === 'update' && originalDoc?.completo && data.completo === false && originalDoc.id === mioId)
          throw new APIError("Non puoi togliere l'accesso completo al tuo stesso ruolo.", 400, null, true)
        return data
      },
    ],
    beforeDelete: [
      async ({ id, req }) => {
        const { totalDocs } = await req.payload.count({
          collection: 'users',
          where: { profilo: { equals: id } },
          req,
          overrideAccess: true,
        })
        if (totalDocs > 0)
          throw new APIError(
            `Questo ruolo è assegnato a ${totalDocs} utent${totalDocs === 1 ? 'e' : 'i'}: cambia prima il loro ruolo.`,
            400,
            null,
            true,
          )
      },
    ],
  },
  timestamps: true,
}
