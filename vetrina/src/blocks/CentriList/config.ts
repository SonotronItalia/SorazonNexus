import type { Block } from 'payload'

export const CentriList: Block = {
  slug: 'centriList',
  interfaceName: 'CentriListBlock',
  labels: { singular: 'Elenco centri', plural: 'Elenchi centri' },
  fields: [
    { name: 'titolo', type: 'text', defaultValue: 'Centri di riferimento' },
    { name: 'introduzione', type: 'textarea' },
    {
      name: 'mostraIndice',
      type: 'checkbox',
      label: 'Mostra indice delle regioni',
      defaultValue: true,
    },
    {
      name: 'colonne',
      type: 'select',
      defaultValue: '2',
      options: [
        { label: '2 colonne', value: '2' },
        { label: '3 colonne', value: '3' },
      ],
    },
  ],
}