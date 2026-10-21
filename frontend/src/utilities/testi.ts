/**
 * Scritte fisse del sito (pulsanti, etichette, banner dei cookie), fuori dal CMS. I testi delle
 * pagine, dei menu e dell'avviso si traducono nel pannello; queste qui nel codice.
 * Le lingue senza traduzione usano l'inglese.
 */
const it = {
  vaiAllaHome: 'Sorazon, vai alla home',
  apriMenu: 'Apri il menu',
  chiudiMenu: 'Chiudi il menu',
  cerca: 'Cerca',
  lingua: 'Lingua',
  sceltaLingua: 'Scegli la lingua',
  disattivaEffetti: 'Disattiva effetti grafici',
  attivaEffetti: 'Attiva effetti grafici',
  tema: 'Tema',
  temaAuto: 'Auto',
  temaChiaro: 'Chiaro',
  temaScuro: 'Scuro',
  tornaSu: 'Torna in cima alla pagina',
  tornaSuBreve: 'Torna in cima',
  avviso: 'Avviso',
  chiudiAvviso: "Chiudi l'avviso",
  // Cookie
  cookieRegione: 'Preferenze sui cookie',
  cookieTitolo: 'Questo sito usa i cookie',
  cookieTesto1: 'Usiamo cookie tecnici, necessari al funzionamento del sito, e, solo con il tuo consenso, cookie facoltativi per',
  cookieTesto2:
    'Puoi accettarli, rifiutarli o scegliere per categoria; chiudendo con la X li rifiuti. Puoi cambiare idea in qualsiasi momento da “Preferenze cookie” in fondo alla pagina. Dettagli nella',
  cookiePolicy: 'cookie policy',
  cookieNecessari: 'Necessari',
  cookieNecessariTesto: 'Tema chiaro/scuro, effetti grafici e questa scelta. Sempre attivi.',
  cookieNecessariSempre: 'Necessari, sempre attivi',
  cookieStatistiche: 'Statistiche',
  cookieStatisticheGtm:
    'Strumenti di misura di Google (Analytics, tramite Google Tag Manager): conteggio delle visite e delle pagine viste, per migliorare il sito.',
  cookieStatisticheGa:
    'Google Analytics: conteggio anonimo delle visite e delle pagine viste, per migliorare il sito.',
  cookieMarketing: 'Marketing',
  cookieMarketingGtm:
    'Strumenti pubblicitari di Google (tramite Google Tag Manager): misura delle campagne e annunci personalizzati.',
  cookieMarketingAds: 'Google Ads: misura dei risultati delle campagne pubblicitarie e annunci personalizzati.',
  cookieEsterni: 'Contenuti esterni',
  cookieEsterniTesto:
    'Video di YouTube e mappe di Google Maps incorporati nelle pagine: questi servizi possono impostare propri cookie.',
  cookieChiudi: 'Chiudi',
  cookieChiudiRifiuta: 'Chiudi e rifiuta i cookie facoltativi',
  cookieSalva: 'Salva le scelte',
  cookiePersonalizza: 'Personalizza',
  cookieRifiuta: 'Rifiuta',
  cookieAccetta: 'Accetta tutti',
  cookiePreferenze: 'Preferenze cookie',
  // Mappa
  mappaMostra: 'Mostra la mappa',
  mappaGoogle: 'La mappa è fornita da Google, che può impostare cookie sul tuo dispositivo.',
  mappaApri: 'Apri in Google Maps',
  mappaTitolo: 'Mappa',
  // Modulo
  moduloInvio: 'Invio in corso...',
  moduloErrore: 'Si è verificato un errore. Riprova.',
  // Centri
  centriNessuno: 'Nessun centro disponibile al momento.',
  centriRegioni: 'Regioni',
  centriSito: 'Sito web',
  // Carosello
  precedente: 'Precedente',
  successivo: 'Successivo',
  // Pagine di sistema
  paginaNonTrovata: 'Pagina non trovata',
  paginaNonTrovataTesto: "La pagina che cerchi non esiste o è stata spostata.",
  tornaAllaHome: 'Torna alla home',
  notizie: 'Notizie',
}

export type Testi = typeof it

const en: Testi = {
  vaiAllaHome: 'Sorazon, go to the home page',
  apriMenu: 'Open the menu',
  chiudiMenu: 'Close the menu',
  cerca: 'Search',
  lingua: 'Language',
  sceltaLingua: 'Choose the language',
  disattivaEffetti: 'Turn off visual effects',
  attivaEffetti: 'Turn on visual effects',
  tema: 'Theme',
  temaAuto: 'Auto',
  temaChiaro: 'Light',
  temaScuro: 'Dark',
  tornaSu: 'Back to the top of the page',
  tornaSuBreve: 'Back to top',
  avviso: 'Notice',
  chiudiAvviso: 'Close the notice',
  cookieRegione: 'Cookie preferences',
  cookieTitolo: 'This website uses cookies',
  cookieTesto1: 'We use technical cookies, needed for the website to work, and, only with your consent, optional cookies for',
  cookieTesto2:
    'You can accept them, refuse them or choose by category; closing with the X refuses them. You can change your mind at any time from “Cookie preferences” at the bottom of the page. Details in the',
  cookiePolicy: 'cookie policy',
  cookieNecessari: 'Necessary',
  cookieNecessariTesto: 'Light/dark theme, visual effects and this choice. Always on.',
  cookieNecessariSempre: 'Necessary, always on',
  cookieStatistiche: 'Statistics',
  cookieStatisticheGtm:
    'Google measurement tools (Analytics, through Google Tag Manager): counting visits and page views, to improve the website.',
  cookieStatisticheGa: 'Google Analytics: anonymous counting of visits and page views, to improve the website.',
  cookieMarketing: 'Marketing',
  cookieMarketingGtm:
    'Google advertising tools (through Google Tag Manager): campaign measurement and personalised ads.',
  cookieMarketingAds: 'Google Ads: measuring advertising campaign results and personalised ads.',
  cookieEsterni: 'External content',
  cookieEsterniTesto:
    'YouTube videos and Google Maps embedded in the pages: these services may set their own cookies.',
  cookieChiudi: 'Close',
  cookieChiudiRifiuta: 'Close and refuse optional cookies',
  cookieSalva: 'Save choices',
  cookiePersonalizza: 'Customise',
  cookieRifiuta: 'Refuse',
  cookieAccetta: 'Accept all',
  cookiePreferenze: 'Cookie preferences',
  mappaMostra: 'Show the map',
  mappaGoogle: 'The map is provided by Google, which may set cookies on your device.',
  mappaApri: 'Open in Google Maps',
  mappaTitolo: 'Map',
  moduloInvio: 'Sending...',
  moduloErrore: 'Something went wrong. Please try again.',
  centriNessuno: 'No centres available at the moment.',
  centriRegioni: 'Regions',
  centriSito: 'Website',
  precedente: 'Previous',
  successivo: 'Next',
  paginaNonTrovata: 'Page not found',
  paginaNonTrovataTesto: 'The page you are looking for does not exist or has been moved.',
  tornaAllaHome: 'Back to the home page',
  notizie: 'News',
}

const DIZIONARI: Record<string, Testi> = { it, en }

export const testi = (lingua: string): Testi => DIZIONARI[lingua] ?? en
