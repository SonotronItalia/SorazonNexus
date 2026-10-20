import type { CollectionConfig } from 'payload'

import { anyone } from '../access/anyone'
import { nascostaSenzaPermesso, permesso } from '../access/ruoli'
import { slugField } from 'payload'

export const Categories: CollectionConfig = {
  slug: 'categories',
  labels: { singular: 'Categoria', plural: 'Categorie' },
  // Categorie delle notizie: si scelgono nelle notizie, si creano tra le voci avanzate
  access: {
    create: permesso('categories', 'crea'),
    delete: permesso('categories', 'elimina'),
    read: anyone,
    update: permesso('categories', 'modifica'),
  },
  admin: {
    useAsTitle: 'title',
    group: 'Avanzate',
    hidden: nascostaSenzaPermesso('categories'),
  },
  fields: [
    {
      name: 'title',
      label: 'Nome',
      type: 'text',
      required: true,
    },
    slugField({
      position: undefined,
    }),
  ],
}
