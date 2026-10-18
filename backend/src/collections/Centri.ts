import type { CollectionConfig } from 'payload'

import { notifyFrontend } from '@/hooks/notifyFrontend'

export const Centri: CollectionConfig = {
  slug: 'centri',
  labels: { singular: 'Centro', plural: 'Centri' },
  admin: {
    useAsTitle: 'nome_struttura', // Il nome che comparirà nella lista dell'admin
  },
  access: {
    read: () => true, // I dati dei centri sono pubblici
  },
  fields: [
    {
      name: 'nome_struttura',
      type: 'text',
      required: true,
    },
    {
      type: 'row', // Raggruppa i campi visivamente nel pannello di controllo
      fields: [
        { name: 'regione', type: 'text', required: true },
        { name: 'provincia', type: 'text' },
        { name: 'citta', type: 'text', required: true },
      ],
    },
    {
      name: 'indirizzo',
      type: 'text',
    },
    {
      type: 'row',
      fields: [
        { name: 'telefoni', type: 'text' },
        { name: 'email', type: 'email' },
        { name: 'sito', type: 'text' },
      ],
    },
    {
      name: 'professionisti',
      type: 'textarea',
    },
    {
      name: 'coordinate',
      type: 'point',
      label: 'Coordinate (Longitudine, Latitudine)',
      admin: {
        description: 'Utile per mostrare il centro sulla mappa',
      },
    },
  ],
  hooks: {
    afterChange: [notifyFrontend('centri')],
    afterDelete: [notifyFrontend('centri')],
  },
}
