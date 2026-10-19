import { createServerFeature } from '@payloadcms/richtext-lexical'

/**
 * Stile del testo nell'editor: dimensione responsiva e colore dalla tavolozza "Colori del sito"
 * (con aggiunta e modifica dei colori dall'editor). Il componente è in feature.client.tsx;
 * il sito disegna solo gli stili ammessi (frontend/src/utilities/stileTesto.ts).
 */
export const StileTestoFeature = createServerFeature({
  feature: {
    ClientFeature: '@/components/admin/StileTesto/feature.client#StileTestoFeatureClient',
  },
  key: 'stileTesto',
})
