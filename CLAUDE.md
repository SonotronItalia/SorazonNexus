# Progetto Sorazon

Lingua: italiano per le risposte e per i commenti nel codice.

## 1. Cosa stiamo costruendo

Sorazon è una piccola azienda con **una terapia brevettata** (apparecchio elettromedicale CE classe 2a: unità base con generatore di radiofrequenza e onde soniche, manipolo con camera di ionizzazione e generatore di ozono) e una **rete di centri di riferimento** in Italia (oggi 10 regioni). Il sito attuale è un Joomla con tema base, tecnologicamente molto arretrato (copyright 2015, notizie del 2016, elenco centri scritto a mano).

Obiettivo: una piattaforma digitale come **strumento di lancio della terapia e della rete dei centri**, realizzata **a fasi**:

| Fase | Contenuto | Stato |
|---|---|---|
| 1 | Sito vetrina + CMS usabile da utenti non tecnici + elenco centri + migrazione contenuti | **In corso** |
| 2 | Formazione: Moodle con un corso pilota (attestato di idoneità per gli operatori) | Da fare |
| 3 | Portale/CRM centri (servizi **Python**, con integrazione AI) | Da fare |
| 4 | Community tra i centri | Solo se c'è domanda |
| Extra | Visualizzatore 3D del dispositivo (vista 3D / vista classica) | Dopo la fase 1; serve un modello 3D |

Chi lavora: lo sviluppatore è anche il responsabile di progetto, ha **carta bianca sulle scelte tecniche** ma ogni **costo** va autorizzato dall'azienda. Il progetto è anche un caso di studio per un profilo da responsabile IT/project manager: quando si prende una decisione architetturale, annotarla in `docs/decisioni.md` (una riga: decisione, alternative, motivo). Niente documentazione superflua oltre a questo.

## 2. Architettura (decisione vincolante)

**Tre container separati e indipendenti per la vetrina**; il frontend parla con il backend **solo via API REST sulla rete interna**, mai con il database.

```
 browser ──► frontend (Next.js, solo rendering) ──REST──► backend (Payload CMS, solo API + admin) ──► db (Postgres/PostGIS)
              rete net_app                                  reti net_app + net_data                    rete net_data
```

- `db`: `postgis/postgis:16-3.4` (serve per il campo `point` della collezione Centri; su Mac arm64 gira in emulazione).
- `backend/`: Payload **3.91.0** dentro un'app **Next 16.3.8** minimale (Payload 3 non gira senza Next). Porta 3001 in sviluppo, 3000 nel container. Solo configurazioni (collezioni, blocchi come campi, hero come campi, globali, plugin, hook). Nessun componente del sito.
- `frontend/`: **Next 16.3.8**, React 19.2, Tailwind 4, shadcn/ui. Solo rendering. Legge i dati **esclusivamente** tramite `frontend/src/lib/api.ts` e `lib/content.ts`.
- Il **frontend NON deve poter raggiungere il database** (reti Docker separate: lo verifica `docker compose exec frontend nc -zv db 5432`, che deve fallire).
- Il frontend non importa mai `getPayload`, `@payload-config` né le collezioni.
- Il pacchetto `payload` resta nel frontend **solo per i tipi** e per il convertitore del rich text (`@payloadcms/richtext-lexical`): accoppiamento sul contratto dei dati, non sul runtime.

**Cache e aggiornamento dei contenuti**

- Il frontend legge con `fetch` + tag (`next: { tags }`).
- Quando un contenuto cambia, il backend avvisa il frontend: hook `notifyFrontend('tag1', 'tag2')` in `backend/src/hooks/notifyFrontend.ts` → `POST {FRONTEND_INTERNAL_URL}/api/revalidate` con header `x-revalidate-secret` → `frontend/src/app/api/revalidate/route.ts` chiama `revalidateTag(tag, { expire: 0 })` (firma di Next 16: il secondo argomento è obbligatorio).
- Tag usati: `pages`, `pages-sitemap`, `posts`, `posts-sitemap`, `globals`, `redirects`, `centri`.
- Gli script di importazione devono passare `context: { disableRevalidate: true }` alle chiamate di creazione.

**Anteprima delle bozze**: il pannello apre `{FRONTEND_PUBLIC_URL}/next/preview?path=...&previewSecret=...` (`generatePreviewPath`); la rotta attiva il `draftMode` di Next. Le bozze le legge il server del frontend da `GET /api/<pages|posts>/anteprima/:slug` (endpoint in `backend/src/endpoints/anteprima.ts`) con l'header `x-internal-secret` = `REVALIDATE_SECRET`. Il frontend **non ha credenziali del CMS** e le richieste normali sono anonime (vedono solo il pubblicato). Live preview: `components/PreviewBar` con `RefreshRouteOnSave` (`BACKEND_PUBLIC_URL`).

**Email**: adattatore nodemailer attivo solo con `SMTP_HOST`; in sviluppo Mailpit (`make db`, casella su http://localhost:8025). Indirizzi: `EMAIL_FROM` = `it@sonotronitalia.com` per le email di sistema (reset password, account); `EMAIL_INFO` = `info@sonotronitalia.com`, destinatario e mittente predefiniti dei moduli del sito.

**Moduli del sito** (plugin form-builder): definiti in `backend/src/seed/dati/moduli/*.yml` e inseriti nelle pagine con il blocco `formBlock` (`form: modulo:Contatti`). Ogni invio passa da `backend/src/hooks/controllaModulo.ts` (campo trappola `_sito`, obbligatori, email valida, lunghezza, solo i campi del modulo): l'API `/api/form-submissions` è pubblica, i controlli del browser non bastano. Gli invii restano nell'admin (Form Submissions); l'email parte solo se c'è `SMTP_HOST`.

**Immagini e moduli**: il browser non conosce l'indirizzo del backend. `frontend/next.config.ts` ha rewrite `/media/:path*` → `{backend}/api/media/file/:path*` e `/api/form-submissions` → backend. La funzione `mediaSrc()` in `lib/api.ts` converte gli URL dei media.

**Build senza backend**: il frontend non deve pre-generare pagine che richiedono il backend. `generateStaticParams` restituisce `[]` e le pagine si costruiscono alla prima richiesta (ISR con tag). Così `next build` e `docker build` non hanno bisogno di backend né database.

**Variabili d'ambiente** (tre file, creati da `scripts/env.sh`, mai committati):

| File | Variabili principali |
|---|---|
| `.env` (radice, per Compose) | `POSTGRES_USER/PASSWORD/DB`, `PAYLOAD_SECRET`, `REVALIDATE_SECRET`, `PREVIEW_SECRET`, `FRONTEND_PUBLIC_URL`, `BACKEND_PUBLIC_URL`, `FRONTEND_HOST`, `BACKEND_HOST` |
| `backend/.env` (sviluppo senza Docker) | `DATABASE_URL`, `PAYLOAD_SECRET`, `REVALIDATE_SECRET`, `PREVIEW_SECRET`, `BACKEND_PUBLIC_URL`, `FRONTEND_PUBLIC_URL`, `FRONTEND_INTERNAL_URL` |
| `frontend/.env` (sviluppo senza Docker) | `PAYLOAD_INTERNAL_URL`, `SITE_URL`, `REVALIDATE_SECRET`, `PREVIEW_SECRET`, `BACKEND_PUBLIC_URL` |

Gli indirizzi interni in Docker sono costanti nel compose (`http://backend:3000`, `http://frontend:3000`). Le variabili vanno lette **a runtime** (non `NEXT_PUBLIC_*`, che verrebbero fissate in build): una sola immagine per ogni ambiente.

**CORS/CSRF**: le chiamate server-to-server del frontend non passano da CORS. `cors` e `csrf` del backend elencano comunque `FRONTEND_PUBLIC_URL` e `BACKEND_PUBLIC_URL`.

## 3. Struttura del repository (monorepo, git alla radice `SorazonNexus/`)

```
SorazonNexus/
├── Makefile                 # comandi del progetto (ricette con TAB!)
├── docker-compose.yml       # db, migrate (job), backend, frontend, nginx + certbot (profilo "proxy")
├── docker-compose.dev.yml   # solo sviluppo: porta 5432 del db sul Mac (make db); mai con lo stack
├── nginx/                 # proxy: modello di configurazione, script dei certificati (certbot)
├── .env.example  requisiti.txt  README.md
├── scripts/
│   ├── fx.sh                # effetti da terminale (spinner, banner, conferme); EFFECTS=0 li disattiva
│   ├── dev.sh               # backend + frontend insieme con output prefissato; Ctrl+C li ferma
│   ├── env.sh               # crea .env (radice, backend, frontend) con segreti casuali coerenti
│   ├── setup.sh             # verifica/installa strumenti e prepara il progetto (DA AGGIORNARE, vedi sotto)
│   └── split-vetrina.sh     # script una tantum già usato per dividere vetrina/ (ora solo nel tag monolite-v1)
├── backend/                 # SOLO Payload
└── frontend/                # SOLO Next.js
# Il vecchio monolite vetrina/ è stato eliminato: si recupera dal tag git monolite-v1.
```

Contenuti di partenza (`make seed`): dati in `backend/src/seed/dati/` (tabelle CSV e pagine in Markdown con intestazione YAML, formato spiegato in `seed/pagine.ts`), immagini in `seed/media/`; `seed/index.ts` contiene solo la logica. Nuovi contenuti di partenza si aggiungono come file, non nel codice. Le notizie stanno in `dati/notizie/*.md` (intestazione con title, slug, publishedAt, categorie, heroImage, meta; sotto il testo in Markdown; `bozza: true` per non pubblicarle); i PDF si caricano come media e si collegano con `/media/nomefile.pdf`. Il menu (`dati/menu.csv`) può già elencare pagine in bozza: il sito le mostra solo quando sono pubblicate (il collegamento a una bozza resta vuoto e non viene disegnato) e la pubblicazione di una pagina rinfresca anche la cache del menu.

Nel backend: `src/{access,collections,fields,hooks,plugins,search,Header,Footer,heros,blocks,utilities}`, `src/app/(payload)`, `src/payload.config.ts`, `src/payload-types.ts` (generato). I blocchi e l'hero nel backend contengono **solo `config.ts`**.

Nel frontend: `src/{app,blocks,components,heros,Header,Footer,providers,lib,utilities}`; i blocchi hanno solo `Component.tsx`.

**Contratto tra le due metà**: il campo `layout` delle pagine è un array di blocchi con `blockType`; il frontend li disegna in `RenderBlocks.tsx` con una mappa `slug → componente`. Ogni nuovo blocco richiede: `config.ts` nel backend + registrazione in `backend/src/blocks/blocchiPagina.ts` (finisce in `config.blocks`, le pagine lo usano per nome) e in `BLOCCHI_INTERNI` del Contenitore + migrazione + `Component.tsx` nel frontend + voce in `RenderBlocks.tsx` + `make types`. La disposizione interna di un blocco (colonne, affiancamenti) usa le **container query** (`@container` sul `.container` del blocco, varianti `@xl:`/`@2xl:`/`@4xl:` al posto di `sm:`/`md:`/`lg:`), così il blocco si adatta anche dentro una colonna del Contenitore.

I tipi si generano nel backend e si copiano nel frontend: `make types`.

## 4. Principio di prodotto: stile WordPress, ma il design resta nel codice

> L'utente sceglie **cosa** mettere e **quale variante** usare. Il codice decide **come appare**.

Ogni blocco espone poche opzioni a elenco (es. 2 o 3 colonne, immagine a destra o sinistra, sfondo nessuno/tenue/scuro), mappate su classi Tailwind **scritte per intero** (Tailwind non vede le classi costruite al volo). Mai font o dimensioni liberi; i **colori** solo dalla tavolozza del sito (collezione "Colori del sito": nome + codice esadecimale, salvati una volta e scelti dai blocchi con sfondo; il testo chiaro o scuro lo decide il sito in base al colore, `frontend/src/utilities/sfondo.ts`). L'editor di testo ha titoli, grassetto, corsivo, sottolineato, link, elenchi puntati e numerati, allineamento e **"Stile testo"** (pulsante A±): dimensione a scelta fissa e responsiva (piccolo, grande, molto grande, enorme, sottotitolo; variabili `--testo-*` in `globals.css`) e colore dalla tavolozza, con aggiunta e modifica dei colori dall'editor. Nel testo si salva `var(--colore-ID, #codice)`: il layout scrive le variabili `--colore-ID` dalla tavolozza, quindi un codice cambiato vale subito ovunque. Il sito applica solo gli stili ammessi (`frontend/src/utilities/stileTesto.ts`). Funzionalità in `backend/src/components/admin/StileTesto`, registrata in `fields/defaultLexical.ts` (tutti i campi la ereditano).

## 5. Funzioni già realizzate (da verificare dopo la migrazione)

**Blocchi** (config nel backend, componente nel frontend): `CallToAction`, `Content`, `MediaBlock`, `ArchiveBlock`, `FormBlock` (dal template), più i nostri:

- `CentriList` ("Elenco centri"): legge `getCentri()` da `lib/content.ts`, raggruppa per regione, indice delle regioni, 2 o 3 colonne. Titoli: il blocco usa `h2` (l'`h1` lo dà l'hero).
- `GalleriaRisultati`: griglia di immagini (radiografie) con etichetta in sovraimpressione e descrizione facoltativa; opzioni colonne / sfondo. Pagina Risultati non ancora popolata: mancano le immagini e i testi clinici vanno rivisti.
- `SchedaProdotto`: titolo, descrizione, immagine, gruppi di caratteristiche con voci, componenti con foto e parti; opzioni posizione immagine / sfondo / colonne. Il campo annidato `composto_da` ha `dbName: 'parti'` per non superare i **63 caratteri** degli identificatori Postgres (con il nome lungo erano 68 e venivano troncati in silenzio).

**Contenitore** (`contenitore`, `contenitore2`, `contenitore3`): colonne (1-4, larghezza automatica o 25/33/50/66/75%) con dentro qualsiasi blocco, spazio tra le colonne e sopra/sotto, allineamento verticale, larghezza 30-100% centrata, sfondo dalla tavolozza. Annidabile su **3 livelli**: Payload 3 va in ciclo infinito con un blocco che contiene se stesso, quindi ogni livello è un blocco a sé (stesso componente nel frontend). Dentro una colonna la classe `.container` dei blocchi perde margini e larghezza massima (`globals.css`).

**Hero Banner e High Impact**: sfondo immagine o video (libreria Media, URL, YouTube solo con consenso), sovrapposizione (intensità + colore della tavolozza), posizione del titolo (9), proporzione del Banner; componente comune `frontend/src/heros/comune/SfondoHero.tsx`.

**Effetti animati** (sezione "Effetti" dell'admin, collezione `effetti`, gruppo "Aspetto del sito"): ogni effetto è un tipo scritto nel codice (`frontend/src/components/Effetti`: alone pulsante, scarica di Tesla, particelle, onde, bagliore) con colore dalla tavolozza, intensità, velocità, punto di partenza (9 posizioni come il titolo degli hero, `fields/posizioni.ts`) e "Attivo" (spento = sparisce ovunque). Si scelgono negli hero Banner, High Impact, Sorazon e nel Contenitore (campo `effetti`, `fields/effetti.ts`) con "Attivo qui" per spegnerli in un punto senza toglierli. Nuovi *effetti* si creano dall'admin; nuovi *tipi* si scrivono nel codice oppure nella sezione **"Tipi di effetto"** (collezione `tipi-effetto`, CSS + JavaScript con l'editor di codice, dichiarazione obbligatoria sulla fotosensibilità) e si usano con il tipo "Personalizzato". Il codice dei tipi personalizzati gira in un **iframe sandbox senza allow-same-origin** con CSP `default-src 'none'` (`frontend/src/components/Effetti/Personalizzato.tsx`): niente accesso a pagina, cookie, storage, rete; riceve `<canvas id="effetto">` e `window.EFFETTO` (colore, intensita, velocita, puntoX, puntoY). Non indebolire queste protezioni.

**Hero "Sorazon"** (tipo `sorazon` in `heros/config.ts`): `SorazonHero` con gli effetti della sezione Effetti (prima erano le caselle `effetto_pulsazione` ed `effetto_scarica`, convertite dalla migrazione `effetti`). Regola: un effetto si vede se è attivo nel CMS **e** il visitatore non li ha disattivati **e** non ha "riduci movimento" nel sistema. Scelta del visitatore in `localStorage` (chiave `sorazon-effetti`) tramite `EffectsProvider` / `EffectsToggle` (pulsante a fulmine in header). Vincoli di sicurezza (fotosensibilità): le scariche sfumano in 0,3-0,5 s, al massimo una ogni 0,7-2 s, nessun lampeggio; l'animazione si ferma fuori schermo. L'hero resta sempre scuro in entrambi i temi. Casella "Bordo attorno all'immagine" (`bordoImmagine`, predefinita accesa).

**Consenso ai cookie**: `frontend/src/providers/Consenso` (scelta in `localStorage`, 6 mesi) + `components/Consenso` (banner, Consent Mode v2, gtag.js solo dopo il consenso). Categorie: statistiche (`GA_MEASUREMENT_ID`), marketing (`GOOGLE_ADS_ID`), contenuti esterni (YouTube, Google Maps: usare `useConsenso().scelte.esterni` prima di caricarli). Pagine `/cookie-policy` e `/privacy-policy` nel seed **in bozza, da far redigere a un consulente**.

**Pulsante "torna su"** (globale `torna-su`, nell'admin "Pulsante torna su" nel gruppo "Aspetto del sito"): attivo, anche su telefono, icona (4), posizione (destra/sinistra/centro in basso), forma, dimensione, dopo quanto scorrimento compare, colore dalla tavolozza. Componente `frontend/src/components/TornaSu` (classi scritte per intero; "riduci movimento" rispettato; il banner dei cookie gli sta sopra).

**SEO e motori di risposta AI (GEO)**: metadati in `frontend/src/utilities/generateMeta.ts` (titolo e descrizione SEO dal CMS o di riserva `DESCRIZIONE_SITO`, canonico, Open Graph); immagine di condivisione generata in `app/og/route.tsx` quando manca un'immagine SEO larga almeno 600 px; dati strutturati JSON-LD (`components/DatiStrutturati` + `utilities/datiStrutturati.ts`: azienda dal Footer, sito, percorso, notizie, prodotti nella Scheda prodotto, centri come MedicalClinic nell'Elenco centri), solo fatti presi dal CMS, mai affermazioni sanitarie; `robots.ts` con i crawler AI permessi in modo esplicito; `/llms.txt` generato dal CMS. Titoli e descrizioni delle pagine nel seed (`meta:` nelle pagine Markdown).

**Tema chiaro/scuro**: `ThemeSelector` del template, ora anche nell'header; `InitTheme` usa un normale `<script>` (non `next/script`, che dava un avviso in console).

**Header responsive**: sotto `md` compaiono fulmine e menu a comparsa (navigazione + selettore tema).

**Collezioni**: `Pages`, `Posts` (etichetta "Notizie"), `Colori` ("Colori del sito", tavolozza per gli sfondi dei blocchi: Galleria risultati, Scheda prodotto, Invito all'azione), `Centri` (etichetta "Centro/Centri"; campi: `nome_struttura`, `regione` (testo libero), `provincia`, `citta`, `indirizzo`, `telefoni`, `email`, `sito`, `professionisti` (textarea), `coordinate` (`point`, richiede PostGIS)), `Media` (`staticDir` da `MEDIA_DIR`), `Categories`, `Users`. Globali: `Header`, `Footer`. Plugin: redirects, nested-docs, SEO, form-builder, search.

## 6. Comandi del progetto (Makefile)

`make seed` sceglie da solo dove girare: con lo stack Docker acceso usa il servizio `seed` (profilo "strumenti", immagine di build) e salva i media nel volume del backend; altrimenti gira sul Mac e li salva in `backend/public/media` (quelli che legge `make dev`). I due modi condividono il database ma **non** i file dei media: dopo il seed nello stack `scripts/allinea-media.sh` copia i file mancanti nei due sensi (anche `make allinea-media`). `make dev` con lo stack acceso avvisa e chiede di fermarne backend, frontend e proxy (stesse porte 3000/3001).

`make help` · `make doctor` · `make db` · `make dev` (db + backend :3001 + frontend :3000) · `make dev-backend` · `make dev-frontend` · `make types` · `make migrate-create NAME=...` · `make stack` (tre container) · `make stack-proxy` (con nginx, simula la produzione) · `make tunnel` (stack acceso visibile da internet con Cloudflare quick tunnel, indirizzi nuovi a ogni avvio; Ctrl+C rimette quelli locali) · `make backup` · `make backup-media` · `make restore FILE=...` · `make reset-db` · `make stop` · `make down` · `make logs SERVICE=...` · `make ps`.

Le ricette del Makefile devono iniziare con **TAB**. `EFFECTS=0` disattiva le animazioni da terminale.

**Test** (girano anche nella CI): `make test` (unitari Vitest di backend e frontend, nessun servizio: `backend/tests/unit`, `frontend/tests/unit`) · `make test-int` (Payload vero su un PostGIS usa e getta in memoria, `scripts/test-int.sh`: permessi, caricamenti, moduli; `vitest.setup.ts` rifiuta di partire senza `TEST_DATABASE_URL` e non carica mai `backend/.env`) · `make test-e2e` (Playwright, desktop e telefono, sul sito acceso: `BASE_URL=...` per un altro indirizzo, anche quello online; `E2E_SCRITTURA=1` per inviare davvero il modulo; `frontend/tests/e2e`) · `make test-api` (Playwright, le API REST del CMS via HTTP su `BACKEND_URL`: permessi da anonimo, bozze, moduli, CORS, GraphQL spento, anteprima; con `E2E_EMAIL`/`E2E_PASSWORD` di un utente di prova anche cookie e CSRF, con `E2E_BLOCCO=1` il blocco dopo 5 tentativi; `frontend/tests/api`) · `make audit` (vulnerabilità delle dipendenze). Limite noto di Payload: un corpo JSON che non è un oggetto (es. `"ciao"`) dà 500 generico, senza dettagli interni. Nuove funzioni: aggiungere il test accanto.

**Sicurezza** (non indebolire): caricamenti solo immagini/PDF/video (`Media.upload.mimeTypes`, niente SVG o HTML); login bloccato dopo 5 tentativi, cookie `secure` in HTTPS, niente chiavi API; GraphQL spento; il backend in produzione non parte con segreti deboli (`payload.config.ts`); nginx con HSTS, CSP `frame-ancestors`, limiti di frequenza su login e moduli, `/api/revalidate` e l'endpoint delle bozze bloccati da fuori; container Node con `cap_drop: ALL` e `no-new-privileges`; redirect del CMS in `frontend/src/proxy.ts` (una sola risposta 308). Override di sicurezza delle dipendenze in `pnpm-workspace.yaml`.

## 7. Regole di lavoro (importanti)

1. **MAI `docker compose down -v`** né `docker volume rm` fuori da `make reset-db`: in passato ha cancellato i dati locali. Il reset ha conferma e backup automatico.
2. **Non acquistare né attivare servizi a pagamento** (hosting, domini, SaaS) senza approvazione dei costi. Sviluppo in locale fino ad autorizzazione.
3. Chiedere conferma prima di comandi distruttivi (`rm -rf` fuori da `node_modules`/`.next`, `git reset --hard`, riscritture della cronologia).
4. Niente segreti nei file committati. `.env`, `backup/`, `node_modules/`, `.next/` fuori da git.
5. Preferenza dell'utente: **soluzioni minimali**; un file di requisiti più uno script che verifica e installa; niente file di documentazione superflui.
6. Procedere a passi piccoli e verificabili; dopo ogni passo eseguire i controlli (typecheck, build, avvio) e riferire cosa è stato **davvero verificato** e cosa no.
7. Non nascondere un errore per far passare un controllo: segnalarlo.
8. Sui testi sanitari (indicazioni, "assolutamente innocue", assenza di effetti collaterali) non riscrivere le affermazioni mediche: vanno **riviste da chi è competente** nell'azienda prima della pubblicazione. Segnalare, non decidere.

## 8. Contesto non tecnico utile

- Società: **SONOTRON ITALIA S.R.L.S.** (produce e vende Sorazon), Strada Nazionale Adriatica Sud 44, 61032 Fano (PS), P.IVA/C.F. 02654710413, REA 199122, PEC sonotron@legalmail.it (dati nel footer, `seed/dati/footer.yml`). Dispositivi: **Sorazon Studio** e **Sorazon Maxi** (portatile a valigia, ex "Speedy"), stesso manipolo trasduttore; dati ufficiali da sonotronitalia.com. Costi del server approvati (19/10/2026). Sede legale: Fano (PU). Email (deciso il 2026-10-19, aggiornato lo stesso giorno): per il pubblico **entrambe**, `info@sorazon.it` per la terapia Sorazon e `info@sonotronitalia.com` per il produttore e distributore del dispositivo (pagina Contatti); `info@sonotronitalia.com` resta il destinatario dei moduli del sito (`EMAIL_INFO`); `it@sonotronitalia.com` per le questioni IT.
- Il sito attuale ha un frammento di codice visibile nella pagina Contatti (residuo del plugin anti-spam di Joomla) che nel nuovo sito sparisce.
- Pagine del vecchio sito: Home, Dispositivo, Terapia, Indicazioni, Risultati, Notizie, Contatti, Distribuzione. Redirect 301 dai vecchi indirizzi (plugin redirects) per non perdere posizionamento.
- Elenco centri attuale per regione: Marche, Piemonte, Liguria, Lombardia, Emilia-Romagna, Lazio, Puglia, Campania, Basilicata, Abruzzo. I dati, estratti dal PDF del vecchio sito (`contatti.pdf`), stanno in `backend/src/seed/dati/centri.csv` (separatore `;`, UTF-8 con BOM, si apre con Excel); `make seed` li importa e li aggiorna senza creare doppioni (chiave: città + indirizzo, o città + nome).
- Hosting attuale: Aruba (probabile hosting condiviso: **non disdirlo** finché le caselle email non sono migrate). Obiettivo di rilascio: **Aruba Cloud Server** (OpenStack, fatturazione anche oraria), una VPS con Docker Compose. Prezzi letti a ottobre 2026: 4 GB a 10,05 € (promo) / 20,10 € (listino) al mese, 8 GB a 15,60 € / 31,20 €, IVA esclusa. Il budget si fa a prezzo di listino.
- Esistono due documenti di budget già prodotti (proposta di progetto in formato documento e foglio `Budget_Progetto_Sorazon.xlsx`) per l'approvazione dei costi dell'azienda.

## 9. Roadmap tecnica successiva (non ora)

- **CI/CD con GitHub Actions**: la CI c'è (`.github/workflows/ci.yml`: typecheck, lint non bloccante finché restano gli errori react-hooks del frontend, build, migrazioni su PostGIS vuoto e controllo delle migrazioni dimenticate, build delle immagini su `main`). Da fare: CD (immagini su GHCR, SSH sul server, `docker compose pull && up -d`, migrazioni prima dell'avvio). Limiti del piano gratuito: 2.000 minuti/mese e 500 MB di Packages per repository privato.
- **Altri servizi** come container con lo stesso schema (rete interna, database separato): Moodle (immagine da costruire, PHP), Keycloak/Authentik per SSO quando i servizi riservati sono almeno due, servizi **Python** (FastAPI) per CRM/portale con AI, Discourse (ha un proprio launcher Docker).
- **Visualizzatore 3D** (dopo la vetrina): React Three Fiber, file GLB con parti separate e nome chiaro; vista esplosa generica (ogni parte si sposta dal centro del modello), involucro trasparente per prefisso nel nome (`case_`), hotspot agganciati al nome della parte; vista 3D caricata in differita con immagine di anteprima; fallback alla vista classica. I dati del prodotto andranno in una collezione `Prodotti` condivisa tra le due viste.
- **Modulo "diventa centro"** e mappa delle regioni scoperte.

