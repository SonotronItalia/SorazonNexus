# CMS (backend)

Payload **3.91** dentro un'app Next.js **16** minimale (`backend/`). Solo configurazione: collezioni, globali, blocchi (campi), hero, hook, plugin. Nessun componente del sito pubblico. Pannello in italiano (inglese a scelta), marchio Sorazon nell'accesso e nel menu.

## Menu del pannello

| Gruppo | Voci |
|---|---|
| Contenuti | Pagine, Notizie, Centri, Immagini e file |
| Contatti | Moduli, Richieste ricevute |
| Aspetto del sito | Colori del sito, Effetti, Pulsante torna su |
| Avanzate | Tipi di effetto, Categorie, Utenti, Ruoli e permessi, Reindirizzamenti, Indice di ricerca, SEO e motori AI |
| Impostazioni | Impostazioni del sito, Menu principale, Piè di pagina |
| (in fondo) | **Guida** (manuali) ed **Esci** |

L'ordine dei gruppi è fissato in `plugins/ordineMenu.ts`. Ogni voce compare solo a chi ha il permesso **Vede**.

## Collezioni

| Slug | Nel pannello | Note |
|---|---|---|
| `pages` | Pagine | Bozze con salvataggio automatico, pubblicazione programmata, 50 versioni. Schede: Apertura, Contenuto (blocchi), SEO. Anteprima e anteprima dal vivo |
| `posts` | Notizie | Come le pagine; categorie, notizie correlate, autori. Indicizzate dalla ricerca |
| `centri` | Centri | Dati pubblici; `coordinate` è un campo `point` (PostGIS) |
| `media` | Immagini e file | Solo immagini, PDF e video; formati ridimensionati automatici; `staticDir` da `MEDIA_DIR` |
| `categories` | Categorie | Annidabili (plugin nested-docs) |
| `colori` | Colori del sito | Tavolozza: nome + codice esadecimale |
| `effetti` | Effetti | Istanze configurate degli effetti animati |
| `tipi-effetto` | Tipi di effetto | Codice CSS/JS personalizzato, eseguito in un iframe isolato |
| `users` | Utenti | Autenticazione; campo `profilo` (il ruolo) |
| `ruoli` | Ruoli e permessi | Vedi sotto |
| `forms`, `form-submissions` | Moduli, Richieste ricevute | Plugin form-builder |
| `redirects` | Reindirizzamenti | Plugin redirects; applicati da `frontend/src/proxy.ts` |
| `search` | Indice di ricerca | Plugin search, sincronizzato con le notizie |

## Globali

| Slug | Nel pannello | Contenuto |
|---|---|---|
| `header` | Menu principale | Voci del menu (le pagine in bozza non compaiono) |
| `footer` | Piè di pagina | Collegamenti e dati legali obbligatori |
| `impostazioni` | Impostazioni del sito | Analisi e pubblicità (Google Tag Manager, GA4, Ads, Consent Mode), avviso in cima al sito, social |
| `torna-su` | Pulsante torna su | Icona, posizione, forma, dimensione, colore |
| `seo` | SEO e motori AI | Nome e descrizione del sito, modello del titolo, immagine di condivisione; nascondi sito, verifiche Google e Bing, pagine escluse; assistenti AI ammessi, `llms.txt`; dati dell'azienda per il JSON-LD |

## Blocchi delle pagine

Configurazione in `backend/src/blocks/*/config.ts`, registrazione in `blocchiPagina.ts`, componente in `frontend/src/blocks/*/Component.tsx`.

| Slug | Nel pannello | Opzioni principali |
|---|---|---|
| `content` | Testo | 1-3 colonne (un terzo, metà, due terzi, intera), collegamento |
| `cta` | Invito all'azione | Testo, pulsanti, sfondo dalla tavolozza |
| `mediaBlock` | Immagine o video | — |
| `archive` | Archivio notizie | Ultime notizie o per categoria |
| `formBlock` | Modulo | Modulo, testo introduttivo, sfondo |
| `centriList` | Elenco centri | Indice delle regioni fisso, 2/3 colonne; dati da `getCentri()` |
| `schedaProdotto` | Scheda prodotto | Caratteristiche e componenti; `dbName: 'parti'` per i 63 caratteri |
| `galleriaRisultati` | Galleria risultati | Colonne, sfondo, larghezza (anche "Tutto lo schermo": il blocco toglie la larghezza massima di pagina) |
| `mappa` | Mappa | Indirizzo, altezza, sfondo; si carica solo con il consenso |
| `numeriEvidenza` | Numeri in evidenza | Numeri manuali o automatici (centri, regioni) con conteggio animato |
| `carosello` | Carosello | Schede con immagine e collegamento |
| `prodottoScorrimento` | Prodotto guidato dallo scorrimento | Immagini a strati o video guidato (pronto per un render 3D) |
| `barraProdotto` | Barra prodotto | Barra fissa sotto l'header |
| `schede` | Schede in evidenza | 2/3 colonne, immagine facoltativa; struttura le pagine di testo senza cambiarne le parole |
| `contenitore`, `contenitore2`, `contenitore3` | Contenitore | Colonne con dentro altri blocchi; 3 livelli (Payload va in ciclo con un blocco che contiene se stesso) |

Sfondi di sezione (`fields/sfondoSezione.ts`): nero profondo, bianco, grigio chiarissimo (più "nessuno" per Modulo e Mappa).

**Hero** (`heros/config.ts`): Semplice (con occhiello), Media, Grande (immagine o video, sovrapposizione, posizione del titolo), Banner, Sorazon (Home, scuro, con effetti e parallasse).

## Ruoli e permessi

- Regole in `access/ruoli.ts`, elenco delle voci in `access/risorse.ts`.
- Ogni utente ha un ruolo (`users.profilo`). Il ruolo ha **Accesso completo** oppure, per ogni voce, **Vede** / Crea / Modifica / Elimina (le globali: Vede / Modifica). In più c'è un permesso a sé per la scheda *Analisi e pubblicità*.
- `auth.depth: 1`: l'utente arriva nella richiesta con il ruolo già caricato. `permesso()`, `può()` e `nascostaSenzaPermesso()` non rileggono il database, e le modifiche ai permessi valgono alla richiesta successiva.
- Lettura pubblica invariata dove serve al sito: pagine e notizie pubblicate, media, centri, colori, effetti, moduli, invio dei moduli, globali.
- Protezioni: un ruolo assegnato non si elimina; nessuno toglie l'accesso completo al proprio ruolo né all'ultimo amministratore; un utente cambia il proprio ruolo solo con l'accesso completo; il primo utente creato riceve l'accesso completo.
- Ruoli iniziali creati dalla migrazione `ruoli_personalizzati`: **Amministratore** (completo) e **Redattore** (contenuti, contatti, aspetto con gli effetti, impostazioni senza Analisi).

## Hook

| Hook | Dove | Cosa fa |
|---|---|---|
| `notifyFrontend(...tag)` | dopo ogni modifica di contenuti e globali | Invalida la cache del sito; disattivato con `context.disableRevalidate` (script di importazione) |
| `controllaModulo` | prima di ogni invio di modulo | Campo trappola `_sito`, obbligatori, email valida, lunghezza, solo campi del modulo |
| protezioni dei ruoli | `ruoli`, `users` | Vedi sopra |
| `populatePublishedAt`, `populateAuthors` | pagine, notizie | Data di pubblicazione e autori pubblici |

## Plugin

redirects, nested-docs (categorie), SEO (scheda SEO di pagine e notizie), form-builder (moduli; email solo con `SMTP_HOST`), search (indice delle notizie), `ordineMenu` (per ultimo).

## Pagina Guida

`/admin/guida` (`components/admin/Guida`): legge i Markdown in `src/guida/` (inclusi nella build con `outputFileTracingIncludes`), li converte con `marked`, mostra indice e schede per ruolo, e si stampa in PDF con uno stile dedicato in `app/(payload)/custom.scss`.

## Rich text

Editor Lexical con titoli, grassetto, corsivo, sottolineato, link, elenchi, allineamento e **Stile testo** (A±): dimensioni fisse e responsive (`--testo-*`) e colori dalla tavolozza, salvati come `var(--colore-ID, #codice)` così un colore cambiato vale ovunque. Funzionalità in `components/admin/StileTesto`, registrata in `fields/defaultLexical.ts`.
