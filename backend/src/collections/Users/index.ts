import type { CollectionConfig } from 'payload'

import { authenticated } from '../../access/authenticated'

export const Users: CollectionConfig = {
  slug: 'users',
  access: {
    admin: authenticated,
    create: authenticated,
    delete: authenticated,
    read: authenticated,
    update: authenticated,
  },
  admin: {
    defaultColumns: ['name', 'email'],
    useAsTitle: 'name',
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
      type: 'text',
    },
  ],
  timestamps: true,
}
