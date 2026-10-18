# Decisioni

| Data | Decisione | Alternative | Motivo |
|---|---|---|---|
| 2026-10-19 | Schema del database solo con migrazioni, anche in sviluppo (`push: false`) | Sincronizzazione automatica (push) in sviluppo e migrazioni solo in produzione | Il push si blocca su domande interattive e lascia il DB in uno stato che le migrazioni non riconoscono; così sviluppo e produzione seguono la stessa strada |
| 2026-10-19 | Frontend: pagine del CMS e notizie in ISR alla prima richiesta (`[[...slug]]`, `generateStaticParams → []`); `/posts`, sitemap e robots dinamici con dati in cache per tag | Pre-generare in build; tutto dinamico | La build non deve richiedere il backend; le pagine restano in cache fino all'avviso del CMS |
| 2026-10-19 | Tipi del modulo (form builder) ricavati da `payload-types.ts` | Aggiungere `@payloadcms/plugin-form-builder` al frontend | Il frontend dipende dal contratto dei dati, non dai pacchetti del backend |
| 2026-10-19 | `robots.txt` generato a runtime da `app/robots.ts` al posto di next-sitemap in postbuild | next-sitemap in build | L'indirizzo del sito si legge a runtime: una sola immagine per ogni ambiente |
| 2026-10-19 | Centri: `regione` come select con valore uguale al nome (apostrofo tipografico in "Valle d’Aosta") | Valori slug con tabella di etichette nel frontend | Il frontend mostra il valore così com'è, senza duplicare l'elenco delle regioni |
| 2026-10-19 | Seed ripetibile senza cancellazioni (cerca per email, nome file, slug, nome+città+indirizzo) | Svuotare e ricreare | Non distrugge le modifiche fatte a mano nel database di sviluppo |
| 2026-10-19 | Porta del database solo in `docker-compose.dev.yml` (make db), mai nel compose dello stack | Porta su 127.0.0.1 nel compose principale | Da Docker 28 una porta pubblicata è raggiungibile anche dalle altre reti Docker: il frontend arrivava al database per IP |
| 2026-10-19 | Versione di pnpm fissata con `packageManager` (12.11.2) in backend e frontend | Lasciare scegliere a corepack | Stessa versione in locale e nelle immagini; il lockfile la registra |
