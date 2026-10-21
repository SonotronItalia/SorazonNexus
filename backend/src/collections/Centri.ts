import type { CollectionConfig } from 'payload'
import { accessoPubblico, nascostaSenzaPermesso } from '@/access/ruoli'

import { soloAdminEliminaDefinitivo } from '@/hooks/cestino'
import { notifyFrontend } from '@/hooks/notifyFrontend'

export const REGIONI = [
  'Abruzzo',
  'Basilicata',
  'Calabria',
  'Campania',
  'Emilia-Romagna',
  'Friuli-Venezia Giulia',
  'Lazio',
  'Liguria',
  'Lombardia',
  'Marche',
  'Molise',
  'Piemonte',
  'Puglia',
  'Sardegna',
  'Sicilia',
  'Toscana',
  'Trentino-Alto Adige',
  'Umbria',
  'Valle d’Aosta',
  'Veneto',
] as const

export const Centri: CollectionConfig = {
  slug: 'centri',
  labels: { singular: 'Centro', plural: 'Centri' },
  admin: {
    group: 'Contenuti',
    hidden: nascostaSenzaPermesso('centri'),
    useAsTitle: 'nome_struttura', // Il nome che comparirà nella lista dell'admin
  },
  // I dati dei centri sono pubblici; creare, modificare, eliminare secondo il ruolo
  // Cestino: "Elimina" sposta nel cestino; eliminazione definitiva solo amministratori (hooks/cestino.ts)
  trash: true,
  access: accessoPubblico('centri'),
  fields: [
    {
      name: 'nome_struttura',
      type: 'text',
      required: true,
    },
    {
      type: 'row', // Raggruppa i campi visivamente nel pannello di controllo
      fields: [
        {
          name: 'regione',
          type: 'select',
          required: true,
          // Il valore è il nome stesso: il frontend lo mostra così com'è.
          // Apostrofo tipografico in "Valle d’Aosta": il valore finisce in un enum di Postgres.
          options: REGIONI.map((r) => ({ label: r, value: r })),
        },
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
    beforeDelete: [soloAdminEliminaDefinitivo],
  },
}
