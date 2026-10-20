import { APIError, type Access, type CollectionConfig, type FieldAccess } from 'payload'

import { authenticated } from '../../access/authenticated'
import { haAccessoCompleto, nascostaSenzaPermesso, permesso, può } from '../../access/ruoli'

// Chi ha "Vede" sugli utenti li vede tutti; gli altri solo il proprio account
const tuttiOSeStesso =
  (azione: 'vede' | 'modifica'): Access =>
  ({ req }) =>
    può(req.user, 'users', azione) || (req.user ? { id: { equals: req.user.id } } : false)

// Il ruolo lo assegna chi può modificare gli utenti; il proprio solo chi ha l'accesso completo
// (un utente non si promuove da solo)
const assegnaRuolo: FieldAccess = ({ req, id }) =>
  può(req.user, 'users', 'modifica') && (id !== req.user?.id || haAccessoCompleto(req.user))

const idRuolo = (v: unknown) => (v && typeof v === 'object' ? (v as { id: number }).id : v)

export const Users: CollectionConfig = {
  slug: 'users',
  labels: { singular: 'Utente', plural: 'Utenti' },
  access: {
    admin: authenticated,
    create: permesso('users', 'crea'),
    delete: permesso('users', 'elimina'),
    read: tuttiOSeStesso('vede'),
    update: tuttiOSeStesso('modifica'),
  },
  admin: {
    defaultColumns: ['name', 'email', 'profilo'],
    useAsTitle: 'name',
    group: 'Avanzate',
    hidden: nascostaSenzaPermesso('users'),
  },
  auth: {
    // L'utente arriva nelle richieste con il suo ruolo già caricato (per i controlli d'accesso)
    depth: 1,
    // Dopo 5 tentativi sbagliati l'account resta bloccato 15 minuti (contro chi prova password)
    maxLoginAttempts: 5,
    lockTime: 15 * 60 * 1000,
    // Sessione di 8 ore, cookie solo in HTTPS quando il CMS è pubblicato in HTTPS
    tokenExpiration: 8 * 60 * 60,
    cookies: {
      secure: (process.env.BACKEND_PUBLIC_URL ?? '').startsWith('https://'),
      sameSite: 'Lax',
    },
  },
  fields: [
    {
      name: 'name',
      label: 'Nome',
      type: 'text',
    },
    {
      name: 'profilo',
      label: 'Ruolo',
      type: 'relationship',
      relationTo: 'ruoli',
      required: true,
      admin: { description: 'I permessi di ogni ruolo si decidono in "Ruoli e permessi".' },
      access: { create: assegnaRuolo, update: assegnaRuolo },
    },
  ],
  hooks: {
    beforeValidate: [
      // Il primo utente creato (dalla pagina di primo accesso) ha sempre l'accesso completo
      async ({ data, operation, req }) => {
        if (operation !== 'create') return data
        const { totalDocs } = await req.payload.count({ collection: 'users', req, overrideAccess: true })
        if (totalDocs > 0) return data
        const { docs } = await req.payload.find({
          collection: 'ruoli',
          where: { completo: { equals: true } },
          limit: 1,
          req,
          overrideAccess: true,
        })
        const ruolo =
          docs[0] ??
          (await req.payload.create({
            collection: 'ruoli',
            data: { nome: 'Amministratore', completo: true },
            req,
            overrideAccess: true,
          }))
        return { ...data, profilo: ruolo.id }
      },
    ],
    beforeChange: [
      // Non si toglie l'accesso completo all'ultimo utente che ce l'ha
      async ({ data, originalDoc, operation, req }) => {
        if (operation !== 'update' || !originalDoc || data.profilo === undefined) return data
        const prima = idRuolo(originalDoc.profilo)
        const dopo = idRuolo(data.profilo)
        if (prima === dopo) return data
        const ruoloPrima = prima
          ? await req.payload.findByID({ collection: 'ruoli', id: prima as number, req, overrideAccess: true }).catch(() => null)
          : null
        if (!ruoloPrima?.completo) return data
        const ruoloDopo = dopo
          ? await req.payload.findByID({ collection: 'ruoli', id: dopo as number, req, overrideAccess: true }).catch(() => null)
          : null
        if (ruoloDopo?.completo) return data
        const { totalDocs } = await req.payload.count({
          collection: 'users',
          where: { and: [{ 'profilo.completo': { equals: true } }, { id: { not_equals: originalDoc.id } }] },
          req,
          overrideAccess: true,
        })
        if (totalDocs === 0)
          throw new APIError("È l'ultimo utente con accesso completo: assegnalo prima a un altro.", 400, null, true)
        return data
      },
    ],
  },
  timestamps: true,
}
