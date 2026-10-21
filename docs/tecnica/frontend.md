# Sito (frontend)

Next.js **16** (App Router), React **19.2**, Tailwind **4**, shadcn/ui, Motion (`motion/react`). Solo rendering: i dati arrivano **esclusivamente** da `src/lib/api.ts` e `src/lib/content.ts`.

## Struttura

```
frontend/src/
├── app/(frontend)/      layout, pagine ([[...slug]]), notizie, ricerca, anteprima, sitemap, llms.txt
├── app/api/revalidate   invalidazione della cache su richiesta del backend
├── app/og               immagine di condivisione generata
├── app/robots.ts        robots.txt dalle scelte di "SEO e motori AI"
├── blocks/              un Component.tsx per blocco + RenderBlocks.tsx (mappa slug → componente)
├── heros/               aperture delle pagine (Semplice, Media, Grande, Banner, Sorazon)
├── components/          Effetti, Consenso, TornaSu, AvvisoSito, DatiStrutturati, Rivela, Parallasse, Card…
├── providers/           tema, effetti, consenso, movimento (Motion)
├── utilities/           metadati, SEO, dati strutturati, sfondi, stile del testo, telefoni…
└── proxy.ts             reindirizzamenti del CMS (una sola risposta 308)
```

## Rendering e cache

- Pagine costruite alla prima richiesta e tenute in cache con i tag (ISR); invalidazione da `/api/revalidate` (`revalidateTag(tag, { expire: 0 })`).
- Nessuna pagina pre-generata in build: il build non ha bisogno del backend.
- Anteprima delle bozze con il `draftMode` di Next e l'endpoint `anteprima` del backend.

## Design

Ispirato alle pagine prodotto di Apple: alternanza di sezioni chiare e nere con accento celeste, titoli molto grandi, molto spazio.

- **Tipografia**: Inter Tight (`next/font`, servita dal sito: nessuna richiesta a Google dal browser). Scala dei titoli in `globals.css` (`--titolo-1/2/3/display`), usata anche da `prose` (`tailwind.config.mjs`); testo editoriale a 46rem.
- **Header** fisso: trasparente in cima, in vetro e più basso dopo 24 px di scorrimento; sotto `xl` (1280 px) fulmine e menu a comparsa: con meno spazio le voci non ci stanno. Tema con tre icone (`ThemeSelector`, senza librerie). Lo spazio occupato nella pagina resta quello della barra grande (124/140 px): se si accorciasse, il browser correggerebbe lo scorrimento riportandolo sotto la soglia e la barra si ingrandirebbe e ridurrebbe di continuo. La parte che avanza è trasparente e lascia passare i clic.
- **Sezioni**: `utilities/sezione.ts` (nero, bianco, grigio chiarissimo) e `components/SezioneSfondo` (fascia a tutta larghezza per Modulo e Mappa).
- **Colori**: solo dalla tavolozza del CMS; il layout scrive le variabili `--colore-ID`; `utilities/sfondo.ts` sceglie il testo chiaro o scuro.
- **Tema chiaro/scuro** con `ThemeSelector`; l'hero Sorazon resta scuro (`data-theme="dark"`).
- **Logo** (`components/Logo`): immagine di sfondo, così il browser scarica solo la versione mostrata; `logo_sorazon_neg.svg` (fornito dall'azienda; contiene un'immagine, ridotta a 1008 px senza perdita: 130 KB invece di 388) con il tema scuro, sotto un hero scuro e sempre nel piè di pagina nero (`scuro`). Nel pannello lo stesso con `.marchio-sorazon` in `custom.scss`.

## Animazioni

Libreria **Motion**, caricata in forma ridotta: `LazyMotion` con `domAnimation` in `providers/Movimento.tsx` (modalità `strict`) e componenti `m.div` invece di `motion.div` (un `motion.div` riporterebbe tutto il pacchetto e in sviluppo dà errore).

- `providers/Movimento.tsx`: `MotionConfig reducedMotion` su "always" con gli effetti spenti dal visitatore, altrimenti "user" (vale "riduci movimento" del sistema).
- **Entrata dell'apertura** (hero Low Impact e Sorazon): animazione CSS `.entrata` in `globals.css`, che parte con il primo disegno senza aspettare il JavaScript (con Motion il titolo restava invisibile fino al caricamento: oltre 1 s sui telefoni lenti). Spenta con "riduci movimento" e con il fulmine spento (`html[data-effetti='off']`, impostato da `InitTheme` e da `EffectsProvider`).
- `components/Rivela`: comparsa morbida dei blocchi all'ingresso nello schermo, tranne il primo blocco della pagina (già visibile all'apertura) e quelli che si animano da sé (elenco `ANIMATI` in `RenderBlocks`).
- `components/Parallasse`, numeri con conteggio, carosello, prodotto guidato dallo scorrimento (versione statica con il movimento ridotto).

Regole: animare solo `transform` e `opacity` (mai larghezza, altezza, `left`/`top`: ricalcolano la pagina a ogni fotogramma); i canvas fermano il ciclo di disegno fuori schermo e con la scheda nascosta e non usano `shadowBlur` a ogni fotogramma (l'alone delle particelle è uno sprite disegnato una volta); i punti di `useTransform` legati allo scorrimento devono stare tra 0 e 1 e non decrescere (Motion li passa alle animazioni native del browser, che altrimenti vanno in errore); un `useScroll` con `target` deve stare in un componente che rende sempre quell'elemento.

## Effetti animati

`components/Effetti`: alone pulsante, scarica di Tesla, particelle, onde, bagliore, più i tipi personalizzati.

- Un effetto si vede se è **attivo nel CMS**, il visitatore **non li ha spenti** (fulmine, `localStorage` `sorazon-effetti`) e **non** ha "riduci movimento".
- Fotosensibilità: le scariche sfumano in 0,3-0,5 s, al massimo una ogni 0,7-2 s, nessun lampeggio; animazione ferma fuori schermo.
- I tipi personalizzati girano in un **iframe sandbox senza `allow-same-origin`** con CSP `default-src 'none'` (`Personalizzato.tsx`): niente accesso a pagina, cookie, storage o rete. Non indebolire queste protezioni.

## Consenso ai cookie

`providers/Consenso` + `components/Consenso`: banner, preferenze per categoria (statistiche, marketing, contenuti esterni), scelta in `localStorage` per 6 mesi, **Consent Mode v2**. Google Tag Manager o gtag.js si caricano dopo il consenso (modalità base) o subito con tutto negato (modalità avanzata); ID e modalità dalle Impostazioni del sito, con `GA_MEASUREMENT_ID` e `GOOGLE_ADS_ID` come riserva. YouTube e Google Maps si caricano solo con `useConsenso().scelte.esterni`.

**Microsoft Clarity** (heatmap e registrazioni) si aggiunge in Tag Manager con la condizione di consenso `analytics_storage` (passi nel manuale per amministratori). Il sito, in `GoogleTag`, gli passa ogni scelta del visitatore con `clarity('consentv2', …)` (statistiche → `analytics_Storage`, marketing → `ad_Storage`), usando la stessa coda del codice ufficiale se Clarity arriva dopo, e al rifiuto delle statistiche cancella `_clck`/`_clsk` insieme ai cookie di Analytics (`utilities/clarity.ts`). Scelta e alternative in `docs/decisioni.md`.

## SEO e motori di risposta AI (GEO)

Tutto configurabile in **Avanzate › SEO e motori AI** (`getSeo()`; regole in `utilities/seo.ts`, con valori di riserva nel codice):

- **Metadati** (`utilities/generateMeta.ts`): titolo dal modello `{pagina} | {sito}`, descrizione della pagina o del sito, canonico, Open Graph e Twitter; immagine SEO della pagina, poi quella predefinita, poi quella generata in `app/og`.
- **robots.txt** (`app/robots.ts`): pagine tecniche e pagine escluse in `Disallow`; assistenti AI ammessi in modo esplicito o bloccati (`CRAWLER_AI`); "nascondi sito" blocca tutto.
- **`noindex`** sulle pagine escluse e su tutto il sito nascosto; pagine escluse anche fuori dalle sitemap.
- **Verifiche** di Google Search Console e Bing nei meta del layout.
- **`/llms.txt`**: sommario del sito per gli assistenti (nome, descrizione, presentazione, azienda, pagine, centri per regione, notizie a scelta).
- **Dati strutturati JSON-LD** (`utilities/datiStrutturati.ts`): azienda (dati da SEO, riserva dal Piè di pagina), sito con ricerca, percorso, notizie, prodotti, centri come `MedicalClinic`. Solo fatti dal CMS, **mai affermazioni sanitarie**.
- Sitemap delle pagine e delle notizie generate a ogni richiesta.

## Velocità

- **JavaScript per pagina**: Next carica su ogni pagina il codice di tutti i componenti client che quella pagina *potrebbe* mostrare. I componenti pesanti e rari passano da un piccolo file `Pigro.tsx` (`'use client'` + `next/dynamic`): `blocks/Form` (modulo, con Radix e react-hook-form), `heros/HighImpact`, `blocks/Code` (Prism). Un `dynamic()` scritto in un componente server **non** divide il codice (limite di Next): va sempre in un file client. Il server disegna comunque l'HTML; il codice arriva solo dove serve.
- Misure (ottobre 2026, telefono con CPU rallentata 4 volte, sito in produzione): JavaScript iniziale da 304 a 223 KB compressi; contenuto principale visibile in 0,13-0,24 s invece di 1,2-1,6 s su Terapia, Dispositivo, Distribuzione; immagini fisse per pagina da 411 a 152 KB (logo negativo alleggerito).
- **Immagini**: `quality={100}` per scelta dell'azienda (massima qualità); formato WebP. AVIF non è attivo: a qualità 100 pesa circa il doppio del WebP (prova su radiografie e foto del dispositivo).
- Le immagini in cima alla pagina (hero) hanno `priority`; le altre si caricano quando servono.
