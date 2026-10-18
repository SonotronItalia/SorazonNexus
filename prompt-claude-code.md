# Progetto Sorazon: passaggio di consegne a Claude Code

Come usare questo file:

- **Parte A** = contesto stabile. Salvala come `CLAUDE.md` nella radice del repository (`SorazonNexus/`): Claude Code la legge a ogni sessione.
- **Parte B** = prompt per la prima sessione. Incollala come primo messaggio.

Lingua: italiano per le risposte e per i commenti nel codice (i file esistenti hanno commenti in italiano).

---

# PARTE A: contesto del progetto (da salvare come CLAUDE.md)

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

**Immagini e moduli**: il browser non conosce l'indirizzo del backend. `frontend/next.config.ts` ha rewrite `/media/:path*` → `{backend}/api/media/file/:path*` e `/api/form-submissions` → backend. La funzione `mediaSrc()` in `lib/api.ts` converte gli URL dei media.

**Build senza backend**: il frontend non deve pre-generare pagine che richiedono il backend. `generateStaticParams` restituisce `[]` e le pagine si costruiscono alla prima richiesta (ISR con tag). Così `next build` e `docker build` non hanno bisogno di backend né database.

**Variabili d'ambiente** (tre file, creati da `scripts/env.sh`, mai committati):

| File | Variabili principali |
|---|---|
| `.env` (radice, per Compose) | `POSTGRES_USER/PASSWORD/DB`, `PAYLOAD_SECRET`, `REVALIDATE_SECRET`, `PAYLOAD_API_KEY`, `FRONTEND_PUBLIC_URL`, `BACKEND_PUBLIC_URL`, `FRONTEND_HOST`, `BACKEND_HOST` |
| `backend/.env` (sviluppo senza Docker) | `DATABASE_URL`, `PAYLOAD_SECRET`, `REVALIDATE_SECRET`, `BACKEND_PUBLIC_URL`, `FRONTEND_PUBLIC_URL`, `FRONTEND_INTERNAL_URL` |
| `frontend/.env` (sviluppo senza Docker) | `PAYLOAD_INTERNAL_URL`, `SITE_URL`, `REVALIDATE_SECRET`, `PAYLOAD_API_KEY` |

Gli indirizzi interni in Docker sono costanti nel compose (`http://backend:3000`, `http://frontend:3000`). Le variabili vanno lette **a runtime** (non `NEXT_PUBLIC_*`, che verrebbero fissate in build): una sola immagine per ogni ambiente.

**CORS/CSRF**: le chiamate server-to-server del frontend non passano da CORS. `cors` e `csrf` del backend elencano comunque `FRONTEND_PUBLIC_URL` e `BACKEND_PUBLIC_URL`.

## 3. Struttura del repository (monorepo, git alla radice `SorazonNexus/`)

```
SorazonNexus/
├── Makefile                 # comandi del progetto (ricette con TAB!)
├── docker-compose.yml       # db, migrate (job), backend, frontend, caddy (profilo "proxy")
├── Caddyfile  .env.example  requisiti.txt  README.md
├── scripts/
│   ├── fx.sh                # effetti da terminale (spinner, banner, conferme); EFFECTS=0 li disattiva
│   ├── dev.sh               # backend + frontend insieme con output prefissato; Ctrl+C li ferma
│   ├── env.sh               # crea .env (radice, backend, frontend) con segreti casuali coerenti
│   ├── setup.sh             # verifica/installa strumenti e prepara il progetto (DA AGGIORNARE, vedi sotto)
│   └── split-vetrina.sh     # script una tantum già usato per dividere vetrina/ in backend/ e frontend/
├── backend/                 # SOLO Payload
├── frontend/                # SOLO Next.js
└── vetrina/                 # VECCHIO monolite: da eliminare dopo la verifica (tag git: monolite-v1)
```

Nel backend: `src/{access,collections,fields,hooks,plugins,search,Header,Footer,heros,blocks,utilities}`, `src/app/(payload)`, `src/payload.config.ts`, `src/payload-types.ts` (generato). I blocchi e l'hero nel backend contengono **solo `config.ts`**.

Nel frontend: `src/{app,blocks,components,heros,Header,Footer,providers,lib,utilities}`; i blocchi hanno solo `Component.tsx`.

**Contratto tra le due metà**: il campo `layout` delle pagine è un array di blocchi con `blockType`; il frontend li disegna in `RenderBlocks.tsx` con una mappa `slug → componente`. Ogni nuovo blocco richiede: `config.ts` nel backend + registrazione nell'array `blocks` di `collections/Pages/index.ts` + `Component.tsx` nel frontend + voce in `RenderBlocks.tsx` + `make types`.

I tipi si generano nel backend e si copiano nel frontend: `make types`.

## 4. Principio di prodotto: stile WordPress, ma il design resta nel codice

> L'utente sceglie **cosa** mettere e **quale variante** usare. Il codice decide **come appare**.

Ogni blocco espone poche opzioni a elenco (es. 2 o 3 colonne, immagine a destra o sinistra, sfondo nessuno/tenue/scuro), mappate su classi Tailwind **scritte per intero** (Tailwind non vede le classi costruite al volo). Mai colori, font o dimensioni liberi. L'editor di testo è limitato a titoli, grassetto, corsivo, sottolineato, link.

## 5. Funzioni già realizzate (da verificare dopo la migrazione)

**Blocchi** (config nel backend, componente nel frontend): `CallToAction`, `Content`, `MediaBlock`, `ArchiveBlock`, `FormBlock` (dal template), più i due nostri:

- `CentriList` ("Elenco centri"): legge `getCentri()` da `lib/content.ts`, raggruppa per regione, indice delle regioni, 2 o 3 colonne. Titoli: il blocco usa `h2` (l'`h1` lo dà l'hero).
- `SchedaProdotto`: titolo, descrizione, immagine, gruppi di caratteristiche con voci, componenti con foto e parti; opzioni posizione immagine / sfondo / colonne. Il campo annidato `composto_da` ha `dbName: 'parti'` per non superare i **63 caratteri** degli identificatori Postgres (con il nome lungo erano 68 e venivano troncati in silenzio).

**Hero "Sorazon"** (tipo `sorazon` in `heros/config.ts`): `SorazonHero` con due effetti attivabili singolarmente dall'admin, `effetto_pulsazione` (alone ciano/blu) e `effetto_scarica` (canvas con fulmini **viola**, componente `TeslaDischarge`). Regola: un effetto si vede se è attivo nel CMS **e** il visitatore non li ha disattivati **e** non ha "riduci movimento" nel sistema. Scelta del visitatore in `localStorage` (chiave `sorazon-effetti`) tramite `EffectsProvider` / `EffectsToggle` (pulsante a fulmine in header). Vincoli di sicurezza (fotosensibilità): le scariche sfumano in 0,3-0,5 s, al massimo una ogni 0,7-2 s, nessun lampeggio; l'animazione si ferma fuori schermo. L'hero resta sempre scuro in entrambi i temi.

**Tema chiaro/scuro**: `ThemeSelector` del template, ora anche nell'header; `InitTheme` usa un normale `<script>` (non `next/script`, che dava un avviso in console).

**Header responsive**: sotto `md` compaiono fulmine e menu a comparsa (navigazione + selettore tema).

**Collezioni**: `Pages`, `Posts` (etichetta "Notizie"), `Centri` (etichetta "Centro/Centri"; campi: `nome_struttura`, `regione` (testo libero), `provincia`, `citta`, `indirizzo`, `telefoni`, `email`, `sito`, `professionisti` (textarea), `coordinate` (`point`, richiede PostGIS)), `Media` (`staticDir` da `MEDIA_DIR`), `Categories`, `Users`. Globali: `Header`, `Footer`. Plugin: redirects, nested-docs, SEO, form-builder, search.

## 6. Comandi del progetto (Makefile)

`make help` · `make doctor` · `make db` · `make dev` (db + backend :3001 + frontend :3000) · `make dev-backend` · `make dev-frontend` · `make types` · `make migrate-create NAME=...` · `make stack` (tre container) · `make stack-proxy` (con Caddy, simula la produzione) · `make backup` · `make backup-media` · `make restore FILE=...` · `make reset-db` · `make stop` · `make down` · `make logs SERVICE=...` · `make ps`.

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

- Sede legale: Fano (PU). Due indirizzi email nel sito attuale (`info@sorazon.it`, `info@sonotronitalia.com`): da chiarire quale sia corretto e centralizzarlo.
- Il sito attuale ha un frammento di codice visibile nella pagina Contatti (residuo del plugin anti-spam di Joomla) che nel nuovo sito sparisce.
- Pagine del vecchio sito: Home, Dispositivo, Terapia, Indicazioni, Risultati, Notizie, Contatti, Distribuzione. Redirect 301 dai vecchi indirizzi (plugin redirects) per non perdere posizionamento.
- Elenco centri attuale per regione: Marche, Piemonte, Liguria, Lombardia, Emilia-Romagna, Lazio, Puglia, Campania, Basilicata, Abruzzo. I dati stanno in un PDF (`contatti.pdf`, se presente nella cartella): l'importazione va fatta con uno **script**, non a mano.
- Hosting attuale: Aruba (probabile hosting condiviso: **non disdirlo** finché le caselle email non sono migrate). Obiettivo di rilascio: **Aruba Cloud Server** (OpenStack, fatturazione anche oraria), una VPS con Docker Compose. Prezzi letti a ottobre 2026: 4 GB a 10,05 € (promo) / 20,10 € (listino) al mese, 8 GB a 15,60 € / 31,20 €, IVA esclusa. Il budget si fa a prezzo di listino.
- Esistono due documenti di budget già prodotti (proposta di progetto in formato documento e foglio `Budget_Progetto_Sorazon.xlsx`) per l'approvazione dei costi dell'azienda.

## 9. Roadmap tecnica successiva (non ora)

- **CI/CD con GitHub Actions**: CI (lint, typecheck, build, test di build immagini Docker con Postgres di servizio); CD (immagini su GHCR, SSH sul server, `docker compose pull && up -d`, migrazioni prima dell'avvio). Limiti del piano gratuito: 2.000 minuti/mese e 500 MB di Packages per repository privato.
- **Altri servizi** come container con lo stesso schema (rete interna, database separato): Moodle (immagine da costruire, PHP), Keycloak/Authentik per SSO quando i servizi riservati sono almeno due, servizi **Python** (FastAPI) per CRM/portale con AI, Discourse (ha un proprio launcher Docker).
- **Visualizzatore 3D** (dopo la vetrina): React Three Fiber, file GLB con parti separate e nome chiaro; vista esplosa generica (ogni parte si sposta dal centro del modello), involucro trasparente per prefisso nel nome (`case_`), hotspot agganciati al nome della parte; vista 3D caricata in differita con immagine di anteprima; fallback alla vista classica. I dati del prodotto andranno in una collezione `Prodotti` condivisa tra le due viste.
- **Blocco "Galleria risultati"** per la pagina Risultati (radiografie con etichetta).
- **Modulo "diventa centro"** e mappa delle regioni scoperte.

---

# PARTE B: prompt per la prima sessione

Incolla questo come primo messaggio a Claude Code.

> Sei il mio assistente di sviluppo sul progetto Sorazon. Leggi `CLAUDE.md` (contesto, architettura vincolante e regole). Stiamo a metà di una migrazione da un monolite (Next.js + Payload nello stesso processo, cartella `vetrina/`) a tre container separati (db, backend Payload, frontend Next.js). La divisione è stata fatta con uno script, ma **non è mai stata verificata end-to-end**: gran parte del codice è stato scritto senza poterlo eseguire.
>
> Lavora per fasi e **fermati alla fine di ogni fase** con un riepilogo di cosa hai verificato davvero e cosa no. Non eseguire comandi distruttivi (vedi regole). Non toccare `vetrina/` finché non te lo dico.
>
> ## Fase 0: orientamento (solo lettura)
> 1. Esamina il repository e confrontalo con la Parte A di `CLAUDE.md`. Elenca le **differenze** (file attesi che mancano, file che non dovrebbero esserci, import che puntano a cartelle inesistenti).
> 2. Esegui `git status` e dimmi se la radice git è `SorazonNexus/` e se `Makefile`, `scripts/`, `backend/`, `frontend/` sono tracciati.
> 3. Controlla che `.gitignore` escluda `.env`, `.env.*` (tranne `.env.example`), `backup/`, `node_modules/`, `.next/`, `backend/media` o `public/media` dei file caricati.
> 4. Non modificare nulla in questa fase.
>
> ## Fase 1: backend
> Verifica e correggi, nell'ordine:
> 1. `pnpm -C backend exec tsc --noEmit` senza errori.
> 2. Nessun file del backend importa `next/cache` o i vecchi hook `revalidatePage`, `revalidatePost`, `revalidateHeader`, `revalidateFooter`, `revalidateRedirects`, `revalidateCentri` (devono essere sostituiti da `notifyFrontend` e i vecchi file eliminati). Controlla anche `backend/src/hooks`, `Pages`, `Posts`, `Header`, `Footer`, `plugins`, `Centri`.
> 3. `collections/Users/index.ts` deve avere `auth: { useAPIKey: true }` (la chiave serve al frontend per le bozze).
> 4. `payload.config.ts`: `serverURL`, `cors`, `csrf` al livello principale (non dentro `admin.components`), nessun riferimento a `BeforeLogin`/`BeforeDashboard`, nessun blocco `jobs` per Vercel.
> 5. `backend/src/utilities/generatePreviewPath.ts` non deve importare nulla dal frontend; deve restituire l'indirizzo **assoluto** del frontend (`FRONTEND_PUBLIC_URL` + `/next/preview?...`).
> 6. `heros/config.ts` contiene il tipo `sorazon` e i campi `effetto_pulsazione` e `effetto_scarica` (e non più `effetti_attivi`).
> 7. `pnpm -C backend generate:importmap` (il file `importMap.js` va rigenerato, non modificato a mano). Poi `make dev-backend` e controlla: `/admin` si apre, `GET /api/centri` risponde, **nessun avviso** sugli identificatori oltre 63 caratteri (se compare ancora, trova quale identificatore e abbrevialo con `dbName`).
> 8. Solo se tutto sopra è pulito: `make migrate-create NAME=iniziale`, ispeziona la migrazione generata, poi `make types` (copia `payload-types.ts` nel frontend). Spiegami come `payload migrate:create` si comporta su un database già popolato dalla sincronizzazione di sviluppo e se serve ripartire da un DB vuoto (`make reset-db`).
>
> ## Fase 2: frontend (oggi **non compila**)
> L'errore noto è `Can't resolve '@/components/AdminBar'` in `app/(frontend)/layout.tsx`, ma ne seguiranno altri: diversi file leggono ancora i dati con `getPayload`/`@payload-config`/`unstable_cache`/`draftMode`. Trovali con:
> `grep -rnE "getPayload|@payload-config|unstable_cache|draftMode|@/components/AdminBar|getMeUser|generatePreviewPath" frontend/src`
>
> File che mi aspetto da riscrivere: `app/(frontend)/layout.tsx`, `page.tsx` (home), `[slug]/page.tsx` e `page.client.tsx`, `posts/**`, `search/**`, le route delle sitemap, `utilities/getGlobals.ts`, `getDocument.ts`, `getRedirects.ts`, `getURL.ts`, `components/PayloadRedirects`, `blocks/ArchiveBlock/Component.tsx`, `Header/Component.tsx`, `Footer/Component.tsx`, `utilities/generateMeta.ts`, `components/Media` (usa `mediaSrc`).
>
> Regole per la riscrittura:
> - Leggi i dati **solo** con `lib/api.ts` e `lib/content.ts`; aggiungi lì le funzioni mancanti (post, ricerca, redirect, globali). Con `?where[...]`, `depth`, `limit`, `page`, `sort` della REST di Payload.
> - `generateStaticParams` restituisce `[]`; niente pre-generazione che richieda il backend.
> - Rimuovi `AdminBar` e `LivePreviewListener`/`draftMode` per ora (anteprima bozze da ricostruire in una fase successiva, vedi sotto).
> - `getURL.ts` legge `SITE_URL` a runtime.
> - `RenderBlocks.tsx` deve avere `centriList` e `schedaProdotto` oltre ai blocchi del template; `RenderHero.tsx` deve avere `sorazon`. Elimina la cartella duplicata `heros/RenderHero/` (resta solo `RenderHero.tsx`).
> - Verifica che esistano e siano collegati: `providers/Effects` (nel `providers/index.tsx`), `components/EffectsToggle`, `components/TeslaDischarge`, `heros/SorazonHero` con `HeroEffects`, header con menu mobile, `InitTheme` con `<script>` normale.
> - Controlli: `pnpm -C frontend exec tsc --noEmit`; `pnpm -C frontend build` **senza backend acceso** (deve passare); poi `make dev` e apri `localhost:3000`.
>
> ## Fase 3: contenuti di partenza con uno script
> Il database di sviluppo è usa e getta: serve uno script ripetibile (nel backend, con la Local API di Payload) che ricrea: l'utente admin di sviluppo, la pagina Home (hero `sorazon`), la pagina Centri (blocco `centriList`), la pagina Dispositivo (blocco `schedaProdotto` con i dati del vecchio sito: 220 Vac, 200 W, L49 x H30,5 x P49 cm, monitor 10" LCD, 20 kg, marchio CE, classe 2a; componenti "Unità base" e "Manipolo trasduttore"), e importa i centri da un file `data/centri.csv` (o JSON) versionato. Usa `context: { disableRevalidate: true }`. Prima dell'importazione trasforma `regione` in un campo `select` con le 20 regioni italiane. Aggiungi `make seed`.
>
> ## Fase 4: i tre container
> 1. Verifica `backend/Dockerfile` e `frontend/Dockerfile` (confrontali con il Dockerfile del template Payload se serve), `docker-compose.yml`, `Caddyfile`.
> 2. `make stack` deve portare su db, job di migrazione, backend e frontend. Controlla: il job `migrate` termina con codice 0; l'healthcheck del backend (`/api/users/me`) passa; i file caricati vanno nel volume `media` (`MEDIA_DIR=/data/media`); `curl localhost:3000/centri` risponde 200; una modifica fatta nel backend si vede nel frontend (hook di revalidazione).
> 3. Prova di isolamento: `docker compose exec frontend nc -zv db 5432` **deve fallire**.
> 4. Se la build del backend richiede il database, valuta `next build --experimental-build-mode compile`.
> 5. I lockfile (`backend/pnpm-lock.yaml`, `frontend/pnpm-lock.yaml`) devono essere aggiornati e committati, altrimenti `pnpm install --frozen-lockfile` nei Dockerfile fallisce. Se serve, `pnpm install` in ciascuna cartella.
> 6. `make stack-proxy` con `FRONTEND_PUBLIC_URL=https://sorazon.localhost` e `BACKEND_PUBLIC_URL=https://cms.sorazon.localhost` (ricorda che i certificati locali di Caddy richiedono `caddy trust` o un'eccezione nel browser).
>
> ## Fase 5: pulizia e riproducibilità
> 1. Aggiorna `scripts/setup.sh`: la sezione `.env` ora deve chiamare `bash scripts/env.sh`, e l'installazione delle dipendenze deve coprire sia `backend` che `frontend` (`pnpm -C <dir> install --frozen-lockfile`). Il resto dello script (verifica/installa git, Node 22, pnpm, Docker, make su macOS e Linux; su Windows WSL2) resta com'è.
> 2. Aggiorna `README.md` e `requisiti.txt` (nuova struttura, comandi del Makefile).
> 3. Dopo la mia conferma, elimina `vetrina/` (esiste il tag `monolite-v1`).
> 4. Prova da clone pulito in una cartella temporanea: `git clone . /tmp/prova && cd /tmp/prova && make setup && make dev`, con le porte libere.
>
> ## Fase 6 (solo dopo le precedenti)
> - Ricostruire **l'anteprima delle bozze** e il live preview: rotta `/next/preview` e `/next/exit-preview` nel frontend con `draftMode()`, lettura delle bozze via API con la chiave dell'utente di servizio (`PAYLOAD_API_KEY`), e `generatePreviewPath` nel backend.
> - Sitemap, ricerca (`/api/search` del plugin), redirect del CMS, adattatore email (oggi Payload scrive le email in console), `Centri.regione` come select, blocco "Galleria risultati".
> - GitHub Actions (CI poi CD) come in Parte A, sezione 9.
>
> ## Cose che il lavoro precedente NON ha potuto verificare (controllale tu)
> - Build e avvio reali dei Dockerfile e del compose (non sono mai stati eseguiti).
> - Che il `next.config.ts` del backend mantenga le opzioni del template che servono ancora (webpack, `extensionAlias`).
> - Che `payload migrate` funzioni nel job `migrate` con lo stage `build` (usa `pnpm payload migrate`; ci sono valori fittizi per la sola build).
> - Il formato esatto di `url` nei documenti `media` (relativo o assoluto con `serverURL`): `mediaSrc` gestisce entrambi, ma controlla una risposta reale.
> - Il nome corretto dell'interfaccia dei tipi per `centri` (`Config['collections']['centri']` è usato in `lib/content.ts`).
> - L'effettiva rimozione dell'import `./redirects.js` da `frontend/next.config.ts` (causava `Cannot find module`), e l'eliminazione di `frontend/redirects.ts`.
> - L'avviso in console su `pnpm-workspace.yaml` nella home dell'utente (`~/pnpm-workspace.yaml`): file dimenticato fuori dal repository, da controllare con l'utente prima di toccarlo. Un avviso di idratazione su `data-sharkid` è causato da un'estensione del browser e va ignorato.
>
> Inizia dalla Fase 0 e riportami le differenze trovate.

---

## Note per chi usa questo file

- Se Claude Code propone una scorciatoia che viola una regola della Parte A (per esempio un comando con `-v` o un servizio a pagamento), rifiutala.
- I numeri dei prezzi (Aruba, ecc.) sono stati letti a ottobre 2026 e vanno ricontrollati al momento di ordinare.
- Le cifre del budget complete richiedono i valori che solo l'azienda può dare (tariffa oraria, ore, costi di revisione e contenuti): sono segnaposto nel foglio Excel.
