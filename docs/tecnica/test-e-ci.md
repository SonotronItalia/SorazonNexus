# Test e CI

## Livelli di test

| Comando | Cosa prova | Dove | Servizi necessari |
|---|---|---|---|
| `make test` | Unitari (Vitest): permessi, filtri, SEO, metadati, dati strutturati, telefoni, lingue e collegamenti, Clarity, marchio, guida, moduli, CSV, seed | `backend/tests/unit`, `frontend/tests/unit` | Nessuno |
| `make test-int` | Integrazione: Payload vero su un PostGIS **usa e getta** in memoria (porta 55433): ruoli e permessi, ruoli personalizzati e protezioni, traduttori, SEO, caricamenti, file del marchio (SVG), moduli, cestino | `backend/tests/int`, `scripts/test-int.sh` | Docker |
| `make test-e2e` | Il sito nel browser (Playwright), desktop, telefono Android e iPhone (WebKit, il motore di Safari): pagine, logo, h1, dati strutturati, menu, cookie, mappa, torna su, avviso, modulo, SEO, sicurezza | `frontend/tests/e2e` | Sito acceso (`BASE_URL`) |
| `make test-api` | Le API REST del CMS via HTTP: permessi da anonimo, bozze, moduli, CORS, GraphQL spento, anteprima | `frontend/tests/api` | CMS acceso (`BACKEND_URL`) |
| `make audit` | Vulnerabilità note nelle dipendenze di produzione | — | Rete |

Opzioni:

- `BASE_URL=https://…` / `BACKEND_URL=https://…`: provano un sito acceso altrove, anche quello online (sola lettura).
- `E2E_SCRITTURA=1`: invia davvero il modulo contatti (scrive nel database).
- `E2E_EMAIL` / `E2E_PASSWORD` di un utente **di prova**: anche cookie, CSRF e blocco dell'accesso (`E2E_BLOCCO=1`).

I test di integrazione **rifiutano di partire** senza `TEST_DATABASE_URL` e non caricano mai `backend/.env`, così non toccano il database di sviluppo.

Nuove funzioni: aggiungere il test accanto. Limite noto di Payload: un corpo JSON che non è un oggetto (es. `"ciao"`) dà un 500 generico senza dettagli interni.

## Verifica manuale

Prima di consegnare una modifica visiva: aprire le pagine coinvolte su desktop e telefono (anche Safari: alcune regole CSS, per esempio aspect-ratio con max-width, lì danno risultati diversi), in tema chiaro e scuro, con effetti accesi e spenti, controllando la console del browser.

## CI (GitHub Actions)

`.github/workflows/ci.yml`, a ogni push e pull request:

1. **Qualità** (backend e frontend): `tsc`, lint, test unitari, audit (alte e critiche bloccano), build.
2. **Migrazioni**: applica tutte le migrazioni su un PostGIS vuoto, esegue i test di integrazione e fallisce se la configurazione è cambiata **senza migrazione**.
3. **Immagini Docker** (solo su `main`): build di backend, migrate e frontend.

I test end-to-end e delle API non girano nella CI: servono il sito o il CMS accesi. Un nuovo push annulla il giro in corso sullo stesso branch. Piano gratuito: 2.000 minuti al mese per repository privato.

Da fare: CD (immagini su GHCR, SSH sul server, `docker compose pull && up -d`, migrazioni prima dell'avvio). Vedi [Rilascio e gestione](rilascio-e-gestione.md).
