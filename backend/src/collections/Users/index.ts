import type { Access, CollectionConfig } from 'payload'

import { authenticated } from '../../access/authenticated'
import { eAmministratore, nascostoAiRedattori, soloAmministratori } from '../../access/ruoli'

// Un amministratore vede e modifica tutti; un redattore solo il proprio account
const amministratoreOSeStesso: Access = (args) =>
  eAmministratore(args) || (args.req.user ? { id: { equals: args.req.user.id } } : false)

export const Users: CollectionConfig = {
  slug: 'users',
  labels: { singular: 'Utente', plural: 'Utenti' },
  access: {
    admin: authenticated,
    create: soloAmministratori,
    delete: soloAmministratori,
    read: amministratoreOSeStesso,
    update: amministratoreOSeStesso,
  },
  admin: {
    defaultColumns: ['name', 'email', 'ruolo'],
    useAsTitle: 'name',
    group: 'Avanzate',
    hidden: nascostoAiRedattori,
  },
  auth: {
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
      name: 'ruolo',
      label: 'Ruolo',
      type: 'select',
      required: true,
      defaultValue: 'redattore',
      // Nel token di accesso: i controlli dei permessi non devono rileggere l'utente
      saveToJWT: true,
      options: [
        { label: 'Amministratore', value: 'amministratore' },
        { label: 'Redattore', value: 'redattore' },
      ],
      admin: {
        description:
          'Redattore: contenuti, contatti, aspetto e impostazioni generali. Amministratore: anche utenti, reindirizzamenti, tipi di effetto e la scheda "Analisi e pubblicità".',
      },
      // Solo un amministratore assegna i ruoli (un redattore non può promuoversi)
      access: { create: ({ req }) => eAmministratore({ req }), update: ({ req }) => eAmministratore({ req }) },
    },
  ],
  hooks: {
    beforeChange: [
      // Il primo utente creato (dalla pagina di primo accesso) è sempre amministratore
      async ({ data, operation, req }) => {
        if (operation === 'create') {
          const { totalDocs } = await req.payload.count({ collection: 'users', req, overrideAccess: true })
          if (totalDocs === 0) return { ...data, ruolo: 'amministratore' }
        }
        return data
      },
    ],
  },
  timestamps: true,
}
