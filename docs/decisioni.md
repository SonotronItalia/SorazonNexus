# Decisioni

| Data | Decisione | Alternative | Motivo |
|---|---|---|---|
| 2026-10-19 | Schema del database solo con migrazioni, anche in sviluppo (`push: false`) | Sincronizzazione automatica (push) in sviluppo e migrazioni solo in produzione | Il push si blocca su domande interattive e lascia il DB in uno stato che le migrazioni non riconoscono; così sviluppo e produzione seguono la stessa strada |
| 2026-10-19 | Frontend: pagine del CMS e notizie in ISR alla prima richiesta (`[[...slug]]`, `generateStaticParams → []`); `/posts`, sitemap e robots dinamici con dati in cache per tag | Pre-generare in build; tutto dinamico | La build non deve richiedere il backend; le pagine restano in cache fino all'avviso del CMS |
| 2026-10-19 | Tipi del modulo (form builder) ricavati da `payload-types.ts` | Aggiungere `@payloadcms/plugin-form-builder` al frontend | Il frontend dipende dal contratto dei dati, non dai pacchetti del backend |
| 2026-10-19 | `robots.txt` generato a runtime da `app/robots.ts` al posto di next-sitemap in postbuild | next-sitemap in build | L'indirizzo del sito si legge a runtime: una sola immagine per ogni ambiente |
