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
- `backend/`: Payload **3.91.0** dentro un'app **Next 16.3.3** minimale (Payload 3 non gira senza Next). Porta 3001 in sviluppo, 3000 nel container. Solo configurazioni (collezioni, blocchi come campi, hero come campi, globali, plugin, hook). Nessun componente del sito.
- `frontend/`: **Next 16.3.3**, React 19.2, Tailwind 4, shadcn/ui. Solo rendering. Legge i dati **esclusivamente** tramite `frontend/src/lib/api.ts` e `lib/content.ts`.
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

Contenuti di partenza (`make seed`): dati in `backend/src/seed/dati/` (tabelle CSV e pagine in Markdown con intestazione YAML, formato spiegato in `seed/pagine.ts`), immagini in `seed/media/`; `seed/index.ts` contiene solo la logica. Nuovi contenuti di partenza si aggiungono come file, non nel codice.

Nel backend: `src/{access,collections,fields,hooks,plugins,search,Header,Footer,heros,blocks,utilities}`, `src/app/(payload)`, `src/payload.config.ts`, `src/payload-types.ts` (generato). I blocchi e l'hero nel backend contengono **solo `config.ts`**.

Nel frontend: `src/{app,blocks,components,heros,Header,Footer,providers,lib,utilities}`; i blocchi hanno solo `Component.tsx`.

**Contratto tra le due metà**: il campo `layout` delle pagine è un array di blocchi con `blockType`; il frontend li disegna in `RenderBlocks.tsx` con una mappa `slug → componente`. Ogni nuovo blocco richiede: `config.ts` nel backend + registrazione nell'array `blocks` di `collections/Pages/index.ts` + `Component.tsx` nel frontend + voce in `RenderBlocks.tsx` + `make types`.

I tipi si generano nel backend e si copiano nel frontend: `make types`.

## 4. Principio di prodotto: stile WordPress, ma il design resta nel codice

> L'utente sceglie **cosa** mettere e **quale variante** usare. Il codice decide **come appare**.

Ogni blocco espone poche opzioni a elenco (es. 2 o 3 colonne, immagine a destra o sinistra, sfondo nessuno/tenue/scuro), mappate su classi Tailwind **scritte per intero** (Tailwind non vede le classi costruite al volo). Mai colori, font o dimensioni liberi. L'editor di testo è limitato a titoli, grassetto, corsivo, sottolineato, link (più gli elenchi puntati nel blocco Content).

## 5. Funzioni già realizzate (da verificare dopo la migrazione)

**Blocchi** (config nel backend, componente nel frontend): `CallToAction`, `Content`, `MediaBlock`, `ArchiveBlock`, `FormBlock` (dal template), più i nostri:

- `CentriList` ("Elenco centri"): legge `getCentri()` da `lib/content.ts`, raggruppa per regione, indice delle regioni, 2 o 3 colonne. Titoli: il blocco usa `h2` (l'`h1` lo dà l'hero).
- `GalleriaRisultati`: griglia di immagini (radiografie) con etichetta in sovraimpressione e descrizione facoltativa; opzioni colonne / sfondo. Pagina Risultati non ancora popolata: mancano le immagini e i testi clinici vanno rivisti.
- `SchedaProdotto`: titolo, descrizione, immagine, gruppi di caratteristiche con voci, componenti con foto e parti; opzioni posizione immagine / sfondo / colonne. Il campo annidato `composto_da` ha `dbName: 'parti'` per non superare i **63 caratteri** degli identificatori Postgres (con il nome lungo erano 68 e venivano troncati in silenzio).

**Hero "Sorazon"** (tipo `sorazon` in `heros/config.ts`): `SorazonHero` con due effetti attivabili singolarmente dall'admin, `effetto_pulsazione` (alone ciano/blu) e `effetto_scarica` (canvas con fulmini **viola**, componente `TeslaDischarge`). Regola: un effetto si vede se è attivo nel CMS **e** il visitatore non li ha disattivati **e** non ha "riduci movimento" nel sistema. Scelta del visitatore in `localStorage` (chiave `sorazon-effetti`) tramite `EffectsProvider` / `EffectsToggle` (pulsante a fulmine in header). Vincoli di sicurezza (fotosensibilità): le scariche sfumano in 0,3-0,5 s, al massimo una ogni 0,7-2 s, nessun lampeggio; l'animazione si ferma fuori schermo. L'hero resta sempre scuro in entrambi i temi.

**Tema chiaro/scuro**: `ThemeSelector` del template, ora anche nell'header; `InitTheme` usa un normale `<script>` (non `next/script`, che dava un avviso in console).

**Header responsive**: sotto `md` compaiono fulmine e menu a comparsa (navigazione + selettore tema).

**Collezioni**: `Pages`, `Posts` (etichetta "Notizie"), `Centri` (etichetta "Centro/Centri"; campi: `nome_struttura`, `regione` (testo libero), `provincia`, `citta`, `indirizzo`, `telefoni`, `email`, `sito`, `professionisti` (textarea), `coordinate` (`point`, richiede PostGIS)), `Media` (`staticDir` da `MEDIA_DIR`), `Categories`, `Users`. Globali: `Header`, `Footer`. Plugin: redirects, nested-docs, SEO, form-builder, search.

## 6. Comandi del progetto (Makefile)

`make help` · `make doctor` · `make db` · `make dev` (db + backend :3001 + frontend :3000) · `make dev-backend` · `make dev-frontend` · `make types` · `make migrate-create NAME=...` · `make stack` (tre container) · `make stack-proxy` (con nginx, simula la produzione) · `make backup` · `make backup-media` · `make restore FILE=...` · `make reset-db` · `make stop` · `make down` · `make logs SERVICE=...` · `make ps`.

Le ricette del Makefile devono iniziare con **TAB**. `EFFECTS=0` disattiva le animazioni da terminale.

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

- Sede legale: Fano (PU). Email (deciso il 2026-10-19): `info@sonotronitalia.com` per tutto ciò che riguarda il pubblico, `it@sonotronitalia.com` per le questioni IT. Il vecchio `info@sorazon.it` non si usa più nel nuovo sito.
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

