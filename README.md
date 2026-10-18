# Sorazon – sito vetrina

Tre container separati: database PostgreSQL/PostGIS, backend Payload CMS (solo API e pannello),
frontend Next.js (solo rendering). Il frontend legge i contenuti dal backend via REST e non può
raggiungere il database.

```
browser ──► frontend (Next.js) ──REST──► backend (Payload) ──► db (Postgres/PostGIS)
```

Contesto, regole e decisioni: [CLAUDE.md](CLAUDE.md) e [docs/decisioni.md](docs/decisioni.md).

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
| `make stack` | I tre container come in produzione |
| `make stack-proxy` | Come `stack`, più il proxy Caddy con HTTPS locale |
| `make backup` / `make restore FILE=...` | Salva o ripristina il database |
| `make reset-db` | ⚠ Svuota il database (chiede conferma e fa prima un backup) |

Lo schema del database cambia **solo con le migrazioni**, anche in sviluppo: dopo una modifica
alle collezioni esegui `make migrate-create NAME=...`, `make migrate` e `make types`.

## Modalità del database

- **Sviluppo** (`make db`, `make dev`): il database espone la porta 5432 sul Mac
  (`docker-compose.dev.yml`), così backend e script locali lo raggiungono.
- **Stack** (`make stack`): nessuna porta pubblicata. Da Docker 28 una porta pubblicata è
  raggiungibile anche dalle altre reti Docker, quindi aprirla toglierebbe l'isolamento del frontend.

Passare da una modalità all'altra ricrea solo il container del database: i dati restano nel volume.
