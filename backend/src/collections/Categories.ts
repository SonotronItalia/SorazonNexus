import type { CollectionConfig } from 'payload'

import { anyone } from '../access/anyone'
import { nascostoAiRedattori, soloAmministratori } from '../access/ruoli'
import { slugField } from 'payload'

export const Categories: CollectionConfig = {
  slug: 'categories',
  labels: { singular: 'Categoria', plural: 'Categorie' },
  // Categorie delle notizie: si scelgono nelle notizie, si creano tra le voci avanzate
  access: {
    create: soloAmministratori,
    delete: soloAmministratori,
    read: anyone,
    update: soloAmministratori,
  },
  admin: {
    useAsTitle: 'title',
    group: 'Avanzate',
    hidden: nascostoAiRedattori,
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
