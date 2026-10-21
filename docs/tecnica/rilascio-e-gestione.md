# Rilascio e gestione

## Ambienti

| Ambiente | Come si avvia | Indirizzi |
|---|---|---|
| Sviluppo | `make dev` | sito :3000, pannello :3001/admin, database :5432, Mailpit :8025 |
| Stack locale | `make stack` | come sopra, ma con i container di produzione e senza porta del database |
| Stack con proxy | `make stack-proxy` | `https://FRONTEND_HOST`, `https://BACKEND_HOST` (in locale certificato autofirmato) |
| Produzione | stack con proxy su una VPS | dominio reale e certificati Let's Encrypt |

Server previsto: **Aruba Cloud Server** (VPS con Docker Compose); costi approvati dall'azienda il 19/10/2026. Il vecchio hosting Aruba resta finché le caselle email non sono migrate.

## Prima installazione sul server

1. Docker 28 o successivo, git, make.
2. Clonare il repository e creare i `.env` con `scripts/env.sh` (segreti casuali).
3. Nel `.env` della radice impostare:
   - `FRONTEND_PUBLIC_URL=https://www.dominio` e `BACKEND_PUBLIC_URL=https://cms.dominio`;
   - `FRONTEND_HOST` e `BACKEND_HOST` (i due nomi senza https);
   - `CERTBOT_EMAIL` (avvisi di scadenza dei certificati);
   - `SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASS` per le email.
4. DNS dei due nomi verso il server; porte 80 e 443 aperte.
5. `make stack-proxy`. Al primo avvio certbot crea certificati provvisori, chiede quelli veri a Let's Encrypt (verifica sulla porta 80) e li rinnova ogni 12 ore; nginx si ricarica da solo.
6. Il job `migrate` applica le migrazioni prima che parta il backend.
7. Contenuti: ripristinare un backup (`make restore`) e i file media, oppure `make seed` su un database vuoto.
8. In **SEO e motori AI** controllare che "Nascondi il sito" sia spento e inserire i codici di verifica di Google e Bing.

## Aggiornare il sito

```bash
make backup && make backup-media
git pull
make stack-proxy        # ricostruisce le immagini; "migrate" applica le migrazioni nuove
```

Le migrazioni sono nel codice (`backend/src/migrations`) e si applicano da sole a ogni avvio. Se una migrazione fallisce il backend non parte: ripristinare il backup e correggere.

Quando una modifica riguarda anche i **contenuti** (es. nuovi blocchi nelle pagine del seed), sul database di produzione non si lancia `make seed` intero: sovrascriverebbe le pagine modificate nel pannello. Si aggiornano solo le pagine interessate, dopo aver controllato che nessuno le abbia cambiate.

## Copie di sicurezza

| Comando | Cosa salva | Dove |
|---|---|---|
| `make backup` | Database (`pg_dump`) | `backup/sorazon-AAAA-MM-GG-hhmmss.sql` |
| `make backup-media` | File caricati (volume `media`) | `backup/media-….tgz` |
| `make restore FILE=…` | Ripristina il database (chiede conferma) | — |

- La cartella `backup/` è fuori da git. Sul server va copiata **altrove** (altro disco o servizio esterno): un backup sullo stesso server non protegge da un guasto del server.
- `make reset-db` è l'unico modo ammesso per svuotare il database: chiede conferma e fa prima un backup. **Mai** `docker compose down -v` né `docker volume rm` a mano.
- Database e file media sono separati: vanno salvati e ripristinati insieme.

## Immagini tra Mac e stack

In sviluppo i file stanno in `backend/public/media`, nello stack nel volume `media`; il database è lo stesso. `make allinea-media` (chiamato anche dopo il seed nello stack) copia i file mancanti nei due sensi (media e `marchio`), senza sovrascrivere né cancellare, e rimette il proprietario dei file del volume all'utente del backend: i file creati dal seed (root) non sarebbero modificabili dal backend, che gira senza permessi speciali. Se il pannello dà "errore di caricamento", la prima cosa da provare è `make allinea-media`.

## Mostrare il lavoro da fuori

`make tunnel` (stack acceso) apre due tunnel Cloudflare temporanei e gratuiti, uno per il sito e uno per il pannello, e passa gli indirizzi ai container senza toccare il `.env`. Ctrl+C li chiude e rimette gli indirizzi locali. Un nginx temporaneo aggiunge `no-transform`: senza, Cloudflare riscrive le email nelle pagine e il sito diventa bianco.

## Log e stato

```bash
make ps                      # stato dei container
make logs SERVICE=backend    # log di un servizio (Ctrl+C per uscire)
docker compose logs migrate  # esito delle migrazioni
```

Il backend ha un controllo di salute (`/api/users/me`); il frontend parte solo quando il backend è sano.

## Da fare: rilascio automatico (CD)

Previsto con GitHub Actions: build delle immagini su GHCR (500 MB gratuiti per repository privato), accesso SSH al server, `docker compose pull && docker compose up -d`, migrazioni prima dell'avvio, backup automatico prima di ogni rilascio.
