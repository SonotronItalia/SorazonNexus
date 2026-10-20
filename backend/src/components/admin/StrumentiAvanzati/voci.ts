// Voci tecniche raccolte nella pagina "Strumenti avanzati" (fuori dal menu laterale):
// le usa solo un amministratore, e di rado
export const VOCI_AVANZATE = [
  { slug: 'users', nome: 'Utenti', descrizione: 'Chi può entrare nel CMS e con quale ruolo.' },
  {
    slug: 'redirects',
    nome: 'Reindirizzamenti',
    descrizione: 'Vecchi indirizzi del sito che portano a quelli nuovi.',
  },
  {
    slug: 'categories',
    nome: 'Categorie',
    descrizione: 'Categorie delle notizie (es. Rassegna stampa).',
  },
  {
    slug: 'tipi-effetto',
    nome: 'Tipi di effetto',
    descrizione: 'Nuove animazioni scritte in codice, usate dalla sezione Effetti.',
  },
  {
    slug: 'search',
    nome: 'Indice di ricerca',
    descrizione: 'Si aggiorna da solo quando si salvano le notizie: di solito non serve aprirlo.',
  },
] as const

export const PERCORSO_STRUMENTI = '/strumenti-avanzati'
