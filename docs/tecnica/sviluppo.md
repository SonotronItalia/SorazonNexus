# Sviluppo

## Requisiti

Elencati in [`requisiti.txt`](../../requisiti.txt): git, Node 22, pnpm 12 (versione esatta in `packageManager`), Docker 28 o successivo, make. Su Windows si usa WSL2.

```bash
make setup     # controlla e installa gli strumenti, crea i .env, installa, prepara database e contenuti
make dev       # database + CMS su http://localhost:3001/admin + sito su http://localhost:3000
```

L'utente del pannello creato da `make setup` è `SEED_ADMIN_EMAIL` in `backend/.env`, con la password generata nello stesso file.

## Struttura del repository

```
SorazonNexus/
├── Makefile                 comandi del progetto (ricette con TAB)
├── docker-compose.yml       db, migrate, backend, frontend, nginx + certbot (profilo proxy), seed (profilo strumenti)
├── docker-compose.dev.yml   solo sviluppo: porta 5432 del database e Mailpit
├── nginx/                   modello di configurazione, certificati, proxy del tunnel
├── scripts/                 setup, .env, sviluppo, test di integrazione, tunnel, allineamento media
├── backend/                 SOLO Payload: collezioni, blocchi (config), hook, migrazioni, seed, guida
├── frontend/                SOLO Next.js: pagine, componenti dei blocchi, stili, test
└── docs/                    questa documentazione, manuali, decisioni
```

## Comandi

`make help` li elenca tutti. I principali:

| Comando | Cosa fa |
|---|---|
| `make dev` / `make dev-backend` / `make dev-frontend` | Sviluppo con ricarica automatica |
| `make types` | Rigenera i tipi di Payload e li copia nel frontend |
| `make migrate-create NAME=…` / `make migrate` | Crea / applica le migrazioni |
| `make seed` | Contenuti di partenza (ripetibile, aggiorna senza duplicare) |
| `make stack` / `make stack-proxy` | I container come in produzione, con o senza nginx; alla fine pulizia automatica (vedi sotto) |
| `make pulisci` | Libera spazio: immagini vecchie senza nome del progetto e cache di build oltre 5 GB (`scripts/pulisci-docker.sh`, `CACHE_MAX=…` per un altro limite). Mai volumi, container o immagini in uso |
| `make test` / `make test-int` / `make test-e2e` / `make test-api` / `make audit` | Test (vedi [Test e CI](test-e-ci.md)) |
| `make backup` / `make backup-media` / `make restore FILE=…` | Copie di sicurezza |
| `make reset-db` | ⚠ Svuota il database (conferma e backup automatico) |
| `make tunnel` | Stack visibile da internet con un tunnel Cloudflare temporaneo (con il tunnel acceso non usare `make stack`) |
| `make allinea-media` | Copia i file caricati (media e marchio) mancanti tra `make dev` e lo stack e ne sistema i permessi |
| `make stop` / `make down` / `make ps` / `make logs SERVICE=…` | Gestione dei container (i dati restano) |

`EFFECTS=0` toglie le animazioni del terminale. Lo stack Docker e `make dev` usano le stesse porte: `make dev` avvisa e chiede di fermare lo stack.

## Variabili d'ambiente

Tre file creati da `scripts/env.sh` con segreti casuali coerenti, **mai committati**:

| File | Variabili principali |
|---|---|
| `.env` (radice, per Compose) | `POSTGRES_USER/PASSWORD/DB`, `PAYLOAD_SECRET`, `REVALIDATE_SECRET`, `PREVIEW_SECRET`, `FRONTEND_PUBLIC_URL`, `BACKEND_PUBLIC_URL`, `FRONTEND_HOST`, `BACKEND_HOST`, `SMTP_*`, `EMAIL_FROM`, `EMAIL_INFO`, `CERTBOT_EMAIL` |
| `backend/.env` | `DATABASE_URL`, `PAYLOAD_SECRET`, `REVALIDATE_SECRET`, `PREVIEW_SECRET`, `BACKEND_PUBLIC_URL`, `FRONTEND_PUBLIC_URL`, `FRONTEND_INTERNAL_URL`, `SEED_ADMIN_*` |
| `frontend/.env` | `PAYLOAD_INTERNAL_URL`, `SITE_URL`, `REVALIDATE_SECRET`, `PREVIEW_SECRET`, `BACKEND_PUBLIC_URL` |

`backend/.env` punta al database **reale** di sviluppo: per lavorare su un database di prova si passa `DATABASE_URL` esplicito e non si carica quel file.

## Schema del database e migrazioni

Lo schema cambia **solo con le migrazioni**, anche in sviluppo:

```bash
make migrate-create NAME=descrizione   # dopo aver cambiato collezioni, globali o blocchi
make migrate
make types
```

Regole imparate sul campo:

- **63 caratteri**: Postgres tronca in silenzio gli identificatori più lunghi. Nei blocchi e negli array annidati si usa `dbName` corto (es. `prod_scorr`, `parti`). Controllare i nomi nella migrazione generata.
- **Rinomina o sostituzione di una colonna**: il generatore chiede in modo interattivo "nuova o rinominata?". Si fa in **due migrazioni** (aggiungi e copia i dati, poi togli il vecchio campo). Esempi: `social_in_impostazioni`, `ruoli_personalizzati` + `togli_ruolo_fisso`.
- **Dati da conservare**: copiarli con SQL dentro la migrazione, prima di eliminare le colonne (es. `seo_e_motori_ai` copia nome, descrizione e dati legali). Non usare l'API di Payload nelle migrazioni: la configurazione futura potrebbe non corrispondere più alle tabelle di allora.
- La CI fallisce se la configurazione cambia senza migrazione.

## Contenuti di partenza (seed)

`make seed` carica pagine, notizie, centri, media, menu, moduli, colori ed effetti da `backend/src/seed/dati/`:

- pagine in Markdown con intestazione YAML (`dati/pagine/*.md`, formato spiegato in `seed/pagine.ts`): `media:file.jpg`, `pagina:slug`, `colore:Nome`, `effetto:Nome`, `modulo:Titolo`;
- notizie in `dati/notizie/*.md` (`bozza: true` per non pubblicarle);
- centri in `dati/centri.csv` (separatore `;`, UTF-8 con BOM, si apre con Excel; chiave città + indirizzo);
- traduzioni in `dati/traduzioni/<lingua>/` (pagine con `pagina:` = slug italiano, menu, moduli, SEO; pubblicate e visibili, vedi [Lingue](lingue.md));
- SEO in `dati/seo.yml` (solo i valori ancora vuoti);
- marchio (loghi e icona Sorazon in `seed/media/marchio`) solo se la scheda Marchio è vuota;
- immagini in `seed/media/` con il testo alternativo in `dati/media.csv`: un file sostituito con un altro (dimensione diversa) aggiorna l'immagine già caricata, con lo stesso nome.

Nuovi contenuti di partenza si aggiungono **come file**, non nel codice. Il seed aggiorna e non cancella; sovrascrive però le pagine del seed e le loro traduzioni: sul database reale non si rilancia il seed completo (cancellerebbe le modifiche fatte dal pannello), si aggiorna solo quello che serve con uno script mirato.

## Aggiungere un blocco

1. `backend/src/blocks/<Nome>/config.ts` (solo configurazione).
2. Registrarlo in `backend/src/blocks/blocchiPagina.ts` e in `BLOCCHI_INTERNI` del Contenitore.
3. `make migrate-create NAME=…`, `make migrate`, `make types`.
4. `frontend/src/blocks/<Nome>/Component.tsx` e la voce in `RenderBlocks.tsx`. Se è un componente client pesante e poco usato, passa da un `Pigro.tsx` (`'use client'` + `next/dynamic`) per non appesantire tutte le pagine.
5. Disposizione interna con le **container query** (`@container`, varianti `@xl:` `@2xl:` `@4xl:`), così il blocco funziona anche dentro una colonna del Contenitore.

Principio: l'utente sceglie **cosa** e **quale variante** (poche opzioni a elenco); il codice decide **come appare**. Classi Tailwind scritte per intero (Tailwind non vede quelle costruite al volo); colori solo dalla tavolozza del sito.

## Aggiungere una voce dell'admin

Una nuova collezione o globale va aggiunta anche in `backend/src/access/risorse.ts` (permessi Vede/Crea/Modifica/Elimina nei ruoli), con `permesso()` negli `access` e `nascostaSenzaPermesso()` in `admin.hidden`. Serve una migrazione: aggiunge le colonne dei permessi alla tabella dei ruoli. Se i suoi elementi si possono perdere con un clic, attivare anche il cestino (`trash: true` e l'hook `soloAdminEliminaDefinitivo` in `beforeDelete`): comparirà da solo nella pagina Cestino.

## Convenzioni

- Italiano per testi, commenti e nomi di dominio.
- Decisioni architetturali: una riga in [docs/decisioni.md](../decisioni.md) (decisione, alternative, motivo).
- Passi piccoli e verificabili: dopo ogni modifica typecheck, lint, test e avvio.
- Testi sanitari: non si riscrivono, si fanno rivedere all'azienda.
