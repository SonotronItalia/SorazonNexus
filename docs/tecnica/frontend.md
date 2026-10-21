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
- **Header** fisso: trasparente in cima, in vetro e più basso dopo 24 px di scorrimento; sotto `md` fulmine e menu a comparsa.
- **Sezioni**: `utilities/sezione.ts` (nero, bianco, grigio chiarissimo) e `components/SezioneSfondo` (fascia a tutta larghezza per Modulo e Mappa).
- **Colori**: solo dalla tavolozza del CMS; il layout scrive le variabili `--colore-ID`; `utilities/sfondo.ts` sceglie il testo chiaro o scuro.
- **Tema chiaro/scuro** con `ThemeSelector`; l'hero Sorazon resta scuro (`data-theme="dark"`).
- **Logo** (`components/Logo`): immagine di sfondo, così il browser scarica solo la versione mostrata; `logo_sorazon_neg.svg` (fornito dall'azienda, 388 KB perché contiene un'immagine) con il tema scuro, sotto un hero scuro e sempre nel piè di pagina nero (`scuro`). Nel pannello lo stesso con `.marchio-sorazon` in `custom.scss`.

## Animazioni

Libreria **Motion**.

- `providers/Movimento.tsx`: `MotionConfig reducedMotion` su "always" con gli effetti spenti dal visitatore, altrimenti "user" (vale "riduci movimento" del sistema).
- `components/Rivela`: comparsa morbida dei blocchi all'ingresso nello schermo (tranne quelli che si animano da sé, elenco `ANIMATI` in `RenderBlocks`).
- `components/Parallasse`, numeri con conteggio, carosello, prodotto guidato dallo scorrimento (versione statica con il movimento ridotto).

Regole: i punti di `useTransform` legati allo scorrimento devono stare tra 0 e 1 e non decrescere (Motion li passa alle animazioni native del browser, che altrimenti vanno in errore); un `useScroll` con `target` deve stare in un componente che rende sempre quell'elemento.

## Effetti animati

`components/Effetti`: alone pulsante, scarica di Tesla, particelle, onde, bagliore, più i tipi personalizzati.

- Un effetto si vede se è **attivo nel CMS**, il visitatore **non li ha spenti** (fulmine, `localStorage` `sorazon-effetti`) e **non** ha "riduci movimento".
- Fotosensibilità: le scariche sfumano in 0,3-0,5 s, al massimo una ogni 0,7-2 s, nessun lampeggio; animazione ferma fuori schermo.
- I tipi personalizzati girano in un **iframe sandbox senza `allow-same-origin`** con CSP `default-src 'none'` (`Personalizzato.tsx`): niente accesso a pagina, cookie, storage o rete. Non indebolire queste protezioni.

## Consenso ai cookie

`providers/Consenso` + `components/Consenso`: banner, preferenze per categoria (statistiche, marketing, contenuti esterni), scelta in `localStorage` per 6 mesi, **Consent Mode v2**. Google Tag Manager o gtag.js si caricano dopo il consenso (modalità base) o subito con tutto negato (modalità avanzata); ID e modalità dalle Impostazioni del sito, con `GA_MEASUREMENT_ID` e `GOOGLE_ADS_ID` come riserva. YouTube e Google Maps si caricano solo con `useConsenso().scelte.esterni`.

## SEO e motori di risposta AI (GEO)

Tutto configurabile in **Avanzate › SEO e motori AI** (`getSeo()`; regole in `utilities/seo.ts`, con valori di riserva nel codice):

- **Metadati** (`utilities/generateMeta.ts`): titolo dal modello `{pagina} | {sito}`, descrizione della pagina o del sito, canonico, Open Graph e Twitter; immagine SEO della pagina, poi quella predefinita, poi quella generata in `app/og`.
- **robots.txt** (`app/robots.ts`): pagine tecniche e pagine escluse in `Disallow`; assistenti AI ammessi in modo esplicito o bloccati (`CRAWLER_AI`); "nascondi sito" blocca tutto.
- **`noindex`** sulle pagine escluse e su tutto il sito nascosto; pagine escluse anche fuori dalle sitemap.
- **Verifiche** di Google Search Console e Bing nei meta del layout.
- **`/llms.txt`**: sommario del sito per gli assistenti (nome, descrizione, presentazione, azienda, pagine, centri per regione, notizie a scelta).
- **Dati strutturati JSON-LD** (`utilities/datiStrutturati.ts`): azienda (dati da SEO, riserva dal Piè di pagina), sito con ricerca, percorso, notizie, prodotti, centri come `MedicalClinic`. Solo fatti dal CMS, **mai affermazioni sanitarie**.
- Sitemap delle pagine e delle notizie generate a ogni richiesta.
