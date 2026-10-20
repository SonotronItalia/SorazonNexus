import type { Field } from 'payload'

// Profili social dell'azienda (Impostazioni del sito > Social): logo della piattaforma in fondo a
// ogni pagina e "sameAs" nei dati strutturati per Google
export const campoSocial: Field = {
  // Profili social: compaiono in fondo a ogni pagina con il logo ufficiale della piattaforma
  name: 'social',
  label: 'Social',
  type: 'array',
  labels: { singular: 'Profilo social', plural: 'Profili social' },
  admin: {
    initCollapsed: false,
    description:
      'Il logo della piattaforma compare in fondo a ogni pagina e apre il profilo in una nuova scheda.',
  },
  fields: [
    {
      type: 'row',
      fields: [
        {
          name: 'piattaforma',
          type: 'select',
          required: true,
          options: [
            { label: 'Facebook', value: 'facebook' },
            { label: 'Instagram', value: 'instagram' },
            { label: 'LinkedIn', value: 'linkedin' },
            { label: 'YouTube', value: 'youtube' },
            { label: 'X (Twitter)', value: 'x' },
            { label: 'TikTok', value: 'tiktok' },
            { label: 'WhatsApp', value: 'whatsapp' },
            { label: 'Threads', value: 'threads' },
            { label: 'Telegram', value: 'telegram' },
            { label: 'Pinterest', value: 'pinterest' },
          ],
        },
        {
          name: 'url',
          label: 'Indirizzo del profilo',
          type: 'text',
          required: true,
          admin: {
            description: 'Es. https://www.facebook.com/sorazon (WhatsApp: https://wa.me/39...)',
          },
          validate: (valore: string | null | undefined) =>
            (typeof valore === 'string' && /^https:\/\/\S+$/i.test(valore)) ||
            "Incolla l'indirizzo completo che inizia con https://",
        },
      ],
    },
  ],
}
