// Test delle API REST del CMS (Payload), via HTTP come le chiamerebbe chiunque da internet.
// BACKEND_URL: indirizzo del CMS (predefinito il backend locale su :3001).
// Credenziali di un utente DI PROVA (mai quello vero: il test di blocco lo blocca 15 minuti):
//   E2E_EMAIL, E2E_PASSWORD -> abilitano i test di cookie, CSRF e blocco del login
// REVALIDATE_SECRET -> abilita il test dell'endpoint delle bozze con il segreto giusto
export const CON_UTENTE = Boolean(process.env.E2E_EMAIL && process.env.E2E_PASSWORD)
export const UTENTE = {
  email: process.env.E2E_EMAIL ?? '',
  password: process.env.E2E_PASSWORD ?? '',
}

// Un sito qualsiasi che non è il nostro
export const ALTRO_SITO = 'https://sito-malevolo.example'

// Email che non esiste: i tentativi di login sbagliati non bloccano nessun account vero
export const EMAIL_INESISTENTE = 'nessuno-esiste@esempio.invalid'

type Doc = { _status?: string; [k: string]: unknown }
export type Elenco = { docs: Doc[]; totalDocs: number }
