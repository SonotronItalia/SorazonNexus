# Sorazon – sito vetrina

Tre container separati: database PostgreSQL/PostGIS, backend Payload CMS (solo API e pannello),
frontend Next.js (solo rendering). Il frontend legge i contenuti dal backend via REST e non può
raggiungere il database.

```
browser ──► frontend (Next.js) ──REST──► backend (Payload) ──► db (Postgres/PostGIS)
```

Documentazione completa (tecnica e manuali d'uso con schermate): [docs/README.md](docs/README.md).
Contesto, regole e decisioni: [CLAUDE.md](CLAUDE.md) e [docs/decisioni.md](docs/decisioni.md).

## Cosa c'è

**Sito**
- Pagine composte a blocchi dal pannello (stile pagine prodotto, schede persona con foto), notizie, elenco dei centri per regione, moduli di contatto.
- Italiano e inglese (`/en/...`), con selettore a bandiere. Le pagine inglesi pubblicate sono sempre visibili.
- Tema chiaro e scuro, effetti animati spegnibili (fulmine), banner dei cookie con Consent Mode v2.
- Google Tag Manager, Analytics e Ads (Microsoft Clarity tramite Tag Manager).
- SEO e motori di risposta AI: robots.txt, sitemap, llms.txt, dati strutturati.
- Privacy e cookie policy in italiano e inglese.

**Pannello** (`/admin`)
- Ruoli e permessi personalizzati, compresi i permessi dei traduttori.
- Scheda **Marchio** nelle Impostazioni: loghi, icona del sito e aspetto Sorazon del pannello. I file si gestiscono in **Impostazioni › File del marchio**.
- **Cestino** su pagine, notizie, centri, moduli, immagini e file del marchio, con la voce **Cestino** del menu che li riunisce per tipo. L'eliminazione definitiva è solo per gli amministratori.
- Manuali d'uso alla voce **Guida**, stampabili in PDF.

## Avvio su un computer nuovo

Requisiti in [requisiti.txt](requisiti.txt). Su Windows usa WSL2: gli script sono per macOS/Linux.

```bash
git clone <indirizzo-del-repository> sorazon
cd sorazon
make setup     # strumenti, .env, dipendenze, database, contenuti di partenza
make dev       # sito su http://localhost:3000, pannello su http://localhost:3001/admin
```

L'utente del pannello creato da `make setup` è `SEED_ADMIN_EMAIL` in `backend/.env`, con la
password generata nello stesso file.

## Comandi principali

`make help` li elenca tutti.

| Comando | Cosa fa |
|---|---|
| `make dev` | Database + backend (:3001) + frontend (:3000) in sviluppo |
| `make dev-backend` / `make dev-frontend` | Uno solo dei due |
| `make types` | Rigenera i tipi di Payload e li copia nel frontend |
| `make migrate-create NAME=...` | Crea una migrazione dopo aver cambiato collezioni o blocchi |
| `make migrate` | Applica le migrazioni |
| `make seed` | Contenuti di partenza (ripetibile, non cancella nulla) |
| `make esporta` | Copia le pagine attuali del pannello nei contenuti di partenza (da rivedere con `git diff` e salvare con un commit) |
| `make stack` | I tre container come in produzione (alla fine pulisce la cache di Docker) |
| `make stack-proxy` | Come `stack`, più il proxy nginx con HTTPS (in locale certificato autofirmato) |
| `make tunnel` | Rende lo stack acceso visibile da internet (Cloudflare, gratis, indirizzi nuovi a ogni avvio; Ctrl+C per chiudere) |
| `make allinea-media` | Copia immagini e file del marchio mancanti tra `make dev` e lo stack, e ne sistema i permessi |
| `make pulisci` | Libera spazio: immagini Docker vecchie del progetto e cache di build oltre 5 GB (mai dati) |
| `make backup` / `make backup-media` | Salva il database / i file caricati in `backup/` |
| `make restore FILE=...` | Ripristina un backup del database |
| `make reset-db` | ⚠ Svuota il database (chiede conferma e fa prima un backup) |
| `make stop` / `make down` / `make ps` / `make logs SERVICE=...` | Gestione dei container (i dati restano) |

Lo schema del database cambia **solo con le migrazioni**, anche in sviluppo: dopo una modifica
alle collezioni esegui `make migrate-create NAME=...`, `make migrate` e `make types`.

## Test

| Comando | Cosa verifica |
|---|---|
| `make test` | Test unitari di backend e frontend (pochi secondi, nessun servizio) |
| `make test-int` | Payload vero su un database usa e getta: permessi, caricamenti, moduli, cestino |
| `make test-e2e` | Il sito nel browser: desktop, telefono Android e iPhone (motore di Safari) |
| `make test-api` | Le API REST del CMS via HTTP |
| `make audit` | Vulnerabilità note nelle dipendenze |

## Sviluppo e stack: cose da sapere

- **Database:** con `make db` / `make dev` il database espone la porta 5432 sul Mac
  (`docker-compose.dev.yml`), così backend e script locali lo raggiungono. Con `make stack` nessuna
  porta è pubblicata: da Docker 28 una porta pubblicata è raggiungibile anche dalle altre reti
  Docker, quindi aprirla toglierebbe l'isolamento del frontend. Passare da una modalità all'altra
  ricrea solo il container del database: i dati restano nel volume.
- **File caricati:** `make dev` e lo stack usano lo stesso database ma cartelle diverse per i file
  (Mac e volume Docker). Se carichi un'immagine o un logo con uno dei due e poi passi all'altro,
  esegui `make allinea-media`.
- **Porte:** `make dev` e lo stack usano le stesse porte (3000 e 3001): ne gira uno alla volta.
- **Tunnel:** con `make tunnel` acceso non usare `make stack`, che rimetterebbe gli indirizzi
  locali. Chiudi prima il tunnel con Ctrl+C.
