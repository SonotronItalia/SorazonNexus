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
7. Contenuti: ripristinare un backup (`make restore`) e i file caricati (media e marchio), oppure `make seed` su un database vuoto.
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

## Cache dei file e CDN

**Oggi (nel codice, nessun servizio esterno).** Le intestazioni di cache le decide l'applicazione e nginx le lascia passare:

| File | Cache | Dove si decide |
|---|---|---|
| Immagini ottimizzate (`/_next/image`) | 1 mese (l'indirizzo cambia quando l'immagine cambia) | `images.minimumCacheTTL` in `frontend/next.config.ts` |
| File caricati (`/media/…`, anche i PDF) e del marchio (`/marchio/…`) | 1 settimana, poi rinnovo in background | `upload.modifyResponseHeaders` di Media e Marchio, valore in `backend/src/utilities/cacheMedia.ts` |
| Loghi predefiniti, bandiere, `favicon.svg` | 1 giorno, poi rinnovo in background | `headers()` in `frontend/next.config.ts` |
| Icone con `?v=` | 1 anno (`immutable`) | `app/icone/[file]/route.ts` |
| JavaScript e CSS (`/_next/static`) | 1 anno (`immutable`, di serie in Next) | — |
| Pagine HTML | nessuna cache condivisa: le aggiorna Next (cache con i tag) | — |

Scelte e alternative (CDN a pagamento, object storage, ottimizzazione delle immagini al volo) in `docs/decisioni.md`.

**Dopo il lancio: Cloudflare gratuito davanti al sito (piano, da approvare).** Costo 0 € (piano Free), ma richiede di spostare la gestione del DNS del dominio. Vantaggi: copie di immagini e file statici vicine ai visitatori, meno carico sulla VPS, protezione da attacchi e traffico anomalo, HTTP/3.

1. **Prima di tutto le email.** Le caselle sono su Aruba: fare l'inventario completo dei record DNS del dominio da Aruba (A, AAAA, CNAME, **MX**, **TXT** con SPF, DKIM e DMARC, eventuali record per PEC e autodiscover). Salvarlo: serve anche per tornare indietro.
2. Creare l'account Cloudflare dell'azienda (gratuito) e aggiungere il dominio. Confrontare voce per voce i record che Cloudflare importa con l'inventario. I record della posta restano **"Solo DNS"** (nuvola grigia), mai attraverso il proxy.
3. Proxy (nuvola arancione) solo per il sito e per l'indirizzo del pannello.
4. **nginx, obbligatorio prima di accendere il proxy** (file infrastrutturale: modifica da approvare). Dietro Cloudflare tutte le richieste arrivano dagli IP di Cloudflare: i limiti di frequenza su accesso e moduli (`limit_req_zone $binary_remote_addr`) scatterebbero per tutti insieme. Serve `real_ip_header CF-Connecting-IP` con `set_real_ip_from` per gli intervalli IP ufficiali di Cloudflare, così nginx vede l'IP vero del visitatore.
5. In Cloudflare:
   - **SSL/TLS: Full (strict)**: nginx ha già il certificato Let's Encrypt, che certbot continua a rinnovare;
   - spegnere **Email Obfuscation** e **Rocket Loader**, che riscrivono le pagine e rompono React. È lo stesso problema già visto con il tunnel: nginx/tunnel.conf aggiunge `no-transform` per questo;
   - **Cache Rules**: sul sito mettere in cache `/media/*`, `/marchio/*`, `/_next/static/*`, `/_next/image*`, rispettando le intestazioni del sito ("respect origin"); niente cache per `/admin*`, `/api/*`, `/next/preview*` e per tutto l'indirizzo del pannello.
6. Cambiare i nameserver del dominio su Aruba con quelli indicati da Cloudflare. Il registrar resta Aruba. La propagazione richiede fino a 24-48 ore: farlo in un momento tranquillo, poi provare subito invio e ricezione di posta, sito, pannello e moduli.
7. **Tornare indietro:** rimettere i nameserver di Aruba; l'inventario del punto 1 garantisce che nulla vada perso.

**Più avanti, solo se servirà** (molte immagini o video, più server): file caricati su uno spazio esterno compatibile S3 (Cloudflare R2: 10 GB gratuiti, nessun costo di traffico; oppure Aruba Object Storage) con il plugin ufficiale `@payloadcms/storage-s3`. Ha un costo possibile, quindi va approvato.

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
