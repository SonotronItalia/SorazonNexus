# Sicurezza

Difese a più livelli, tutte senza costi aggiuntivi. **Non indebolirle.**

## Rete e container

- Reti Docker separate: il frontend non raggiunge il database (`net_app` / `net_data`).
- Nello stack il database **non pubblica porte**: da Docker 28 una porta pubblicata è raggiungibile anche dalle altre reti Docker, quindi aprirla toglierebbe l'isolamento. La porta 5432 si apre solo in sviluppo (`docker-compose.dev.yml`).
- Backend e frontend pubblicano solo su `127.0.0.1`; verso internet passa tutto da nginx.
- Container Node con `cap_drop: ALL` e `no-new-privileges`, utente non root.

## Proxy (nginx)

- HTTPS con certificati Let's Encrypt (certbot), HSTS.
- Intestazioni: `X-Content-Type-Options`, `Referrer-Policy`, `Permissions-Policy`, CSP `frame-ancestors` (il sito si può incorniciare solo dal pannello, per l'anteprima dal vivo), `X-Frame-Options` sul pannello.
- Limiti di frequenza: accesso, recupero password e sblocco (5 al minuto), invio dei moduli (6 al minuto); oltre, risposta 429.
- Bloccati da fuori: `/api/revalidate` del sito e gli endpoint delle bozze del CMS.

## CMS

- Caricamenti limitati a immagini, PDF e video (niente SVG, HTML o eseguibili). Unica eccezione: i **file del marchio** (loghi e icona) accettano SVG, controllati da Payload, senza riferimenti esterni e serviti con CSP `sandbox` (dettagli in `cms.md`).
- Accesso bloccato 15 minuti dopo 5 password sbagliate; sessione di 8 ore; cookie `secure` in HTTPS e `SameSite=Lax`.
- Niente chiavi API, **GraphQL spento**.
- In produzione il backend non parte con segreti deboli (`payload.config.ts`).
- CORS e CSRF limitati agli indirizzi del sito e del pannello.
- Ruoli e permessi verificati sul server (non basta nascondere le voci): vedi [CMS](cms.md).
- Moduli: l'API degli invii è pubblica, quindi ogni invio è controllato sul server (`controllaModulo`: campo trappola, obbligatori, email, lunghezze, solo i campi del modulo).
- Le bozze si leggono solo con il segreto interno; le richieste del sito sono anonime.
- Cestino: eliminare sposta nel cestino; la cancellazione definitiva è solo per gli amministratori (`hooks/cestino.ts`).
- I file caricati appartengono all'utente del backend (`make allinea-media` rimette il proprietario dopo il seed, che gira come root).

## Sito

- Reindirizzamenti in `proxy.ts` con una sola risposta 308.
- Nessun `X-Powered-By`: le risposte non rivelano la tecnologia.
- Codice degli effetti personalizzati in iframe sandbox con CSP `default-src 'none'`.
- JSON-LD sicuro: un testo del CMS non può chiudere lo `<script>` (testato).
- Google e contenuti esterni solo dopo il consenso.

## Segreti

- `.env` (tre file) creati da `scripts/env.sh` con valori casuali, fuori da git; così `backup/`, `node_modules/`, `.next/`.
- `REVALIDATE_SECRET` e `PREVIEW_SECRET` condivisi solo tra backend e frontend.

## Dipendenze

- `make audit` e la CI controllano le vulnerabilità note delle dipendenze di produzione (alte e critiche bloccano la CI).
- Override di sicurezza in `pnpm-workspace.yaml`.
- Versioni esatte nei `package.json`, lockfile committati.

## Tunnel

`make tunnel` rende pubblici sito **e pannello** con indirizzi temporanei: usarlo solo per mostrare il lavoro, con password robuste, e chiuderlo subito dopo.
