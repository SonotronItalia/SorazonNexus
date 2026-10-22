# CMS (backend)

Payload **3.91** dentro un'app Next.js **16** minimale (`backend/`). Solo configurazione: collezioni, globali, blocchi (campi), hero, hook, plugin. Nessun componente del sito pubblico. Pannello in italiano (inglese a scelta), marchio Sorazon nell'accesso e nel menu.

## Menu del pannello

| Gruppo | Voci |
|---|---|
| (in cima) | Logo piccolo del marchio (`LogoMenu`), Sfoglia per cartella |
| Contenuti | Pagine, Notizie, Centri, Immagini e file |
| Contatti | Moduli, Richieste ricevute |
| Aspetto del sito | Colori del sito, Effetti, Pulsante torna su |
| Impostazioni | File del marchio, Impostazioni del sito, Menu principale, Piè di pagina, Lingue e selettore |
| Avanzate | Tipi di effetto, Categorie, Utenti, Ruoli e permessi, Reindirizzamenti, Indice di ricerca, SEO e motori AI |
| (in fondo) | **Cestino** (tutte le raccolte con il cestino), **Guida** (manuali) ed **Esci** |

L'ordine dei gruppi è fissato in `plugins/ordineMenu.ts`. Ogni voce compare solo a chi ha il permesso **Vede**.

## Collezioni

| Slug | Nel pannello | Note |
|---|---|---|
| `pages` | Pagine | Bozze con salvataggio automatico, pubblicazione programmata, 50 versioni. Schede: Apertura, Contenuto (blocchi), SEO. Anteprima e anteprima dal vivo. Localizzate (vedi `lingue.md`), cestino |
| `posts` | Notizie | Come le pagine; categorie, notizie correlate, autori. Indicizzate dalla ricerca (escono dall'indice nel cestino) |
| `centri` | Centri | Dati pubblici; `coordinate` è un campo `point` (PostGIS); cestino |
| `media` | Immagini e file | Solo immagini, PDF e video; formati ridimensionati automatici; `staticDir` da `MEDIA_DIR`; cache di una settimana; cestino |
| `marchio` | File del marchio (Impostazioni) | Loghi e icone, anche SVG controllati; vedi sotto; cestino |
| `categories` | Categorie | Annidabili (plugin nested-docs) |
| `colori` | Colori del sito | Tavolozza: nome + codice esadecimale |
| `effetti` | Effetti | Istanze configurate degli effetti animati |
| `tipi-effetto` | Tipi di effetto | Codice CSS/JS personalizzato, eseguito in un iframe isolato |
| `users` | Utenti | Autenticazione; campo `profilo` (il ruolo) |
| `ruoli` | Ruoli e permessi | Vedi sotto |
| `forms`, `form-submissions` | Moduli, Richieste ricevute | Plugin form-builder (cestino sui moduli) |
| `redirects` | Reindirizzamenti | Plugin redirects; applicati da `frontend/src/proxy.ts` |
| `search` | Indice di ricerca | Plugin search, sincronizzato con le notizie |

## Globali

| Slug | Nel pannello | Contenuto |
|---|---|---|
| `header` | Menu principale | Voci del menu (le pagine in bozza non compaiono) |
| `footer` | Piè di pagina | Collegamenti e dati legali obbligatori |
| `impostazioni` | Impostazioni del sito | Analisi e pubblicità (Google Tag Manager, GA4, Ads, Consent Mode), avviso in cima al sito, social, marchio (logo per sfondo chiaro e scuro, compatto, piè di pagina, icona del sito e variante per il tema scuro del browser) |
| `torna-su` | Pulsante torna su | Icona, posizione, forma, dimensione, colore |
| `lingue` | Lingue e selettore | Lingue attive, ordine, bandiera, stile del selettore (vedi `lingue.md`) |
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
| `soloAdminEliminaDefinitivo` | raccolte con il cestino | L'eliminazione definitiva solo con l'accesso completo |
| controllo degli SVG | `marchio` | Rifiuta i riferimenti a indirizzi esterni (oltre al controllo di Payload) |

Endpoint: `GET /api/<pages\|posts>/anteprima/:slug` (bozze per l'anteprima del sito, con il segreto interno) e `GET /api/icona-pannello` (favicon del pannello).

## Plugin

redirects, nested-docs (categorie), SEO (scheda SEO di pagine e notizie), form-builder (moduli; email solo con `SMTP_HOST`), search (indice delle notizie), `ordineMenu` (per ultimo).

## Pagina Guida

`/admin/guida` (`components/admin/Guida`): legge i Markdown in `src/guida/` (inclusi nella build con `outputFileTracingIncludes`), li converte con `marked`, mostra indice e schede per ruolo, e si stampa in PDF con uno stile dedicato in `app/(payload)/custom.scss`.

## Rich text

Editor Lexical con titoli, grassetto, corsivo, sottolineato, link, elenchi, allineamento e **Stile testo** (A±): dimensioni fisse e responsive (`--testo-*`) e colori dalla tavolozza, salvati come `var(--colore-ID, #codice)` così un colore cambiato vale ovunque. Funzionalità in `components/admin/StileTesto`, registrata in `fields/defaultLexical.ts`.

## File del marchio

Raccolta `marchio` (`collections/Marchio.ts`), nascosta dal menu: si usa dalla scheda **Marchio** delle Impostazioni. È l'**unico** caricamento che accetta SVG (più PNG e WebP), con tre difese:

1. il controllo integrato di Payload rifiuta gli SVG con script, gestori di eventi, `foreignObject`, link `javascript:`, entità XML;
2. l'hook `beforeValidate` rifiuta i riferimenti a indirizzi esterni (`href`/`src`/`url()` verso `http(s)://` o `//`), regola `RIFERIMENTO_ESTERNO`;
3. `upload.modifyResponseHeaders` serve i file con `Content-Security-Policy: default-src 'none'; img-src data:; style-src 'unsafe-inline'; sandbox` e `nosniff`: aperto da solo nel browser, un SVG non esegue nulla.

Un file pericoloso viene **rifiutato**, non modificato. Permessi: lettura pubblica, caricamento e modifica con "Modifica" su Impostazioni del sito. File in `MEDIA_DIR/marchio` (nello stack, volume dei media). Il seed (`seed/marchio.ts`) carica loghi e icona Sorazon da `seed/media/marchio` solo se la scheda è tutta vuota. L'elenco **Impostazioni › File del marchio** è visibile a chi ha "Vede" sulle Impostazioni e serve per eliminare i file (relazioni con `ON DELETE set null`: il sito torna ai file predefiniti; `afterChange`/`afterDelete` rinnovano la cache `globals`). Nel pannello: favicon da `GET /api/icona-pannello` (`endpoints/iconaPannello.ts`, rimanda all'icona del Marchio o a `favicon.svg`, indicato in `admin.meta.icons`) e logo piccolo in cima al menu (`LogoMenu` in `components/admin/Marchio`, `admin.components.beforeNavLinks`: per sfondo scuro, compatto se c'è; per sfondo chiaro se l'aspetto Sorazon è spento). Nel pannello, `components/admin/Marchio` usa gli stessi file (accesso e menu) con i loghi Sorazon in `backend/public` come riserva.

## Aspetto del pannello

Tema Sorazon in `components/admin/TemaPannello` (`tema.ts`: regole CSS): scala del celeste al posto del blu di Payload (`--color-success-*`, `--color-blue-*`), carattere Inter Tight (`next/font`, servito dal backend), angoli (`--style-radius-*`), pulsanti principali, scheda attiva, caselle e pallini; menu laterale blu notte (come l'apertura del sito, in entrambi i temi) con titoli dei gruppi in celeste e voce attiva a pillola; schede della home bianche con bordo e celeste al passaggio del mouse; campo attivo, selettore della lingua e avatar in celeste. Classi di Payload usate: `aside.nav`, `.nav-group__toggle`, `.nav__link`, `.collections .card`, `.radio-input__styled-radio`, `.localizer-button`, `.app-header__account`. Payload mette i suoi stili nel livello CSS `payload-default`: le regole del tema, fuori da ogni livello, vincono senza `!important`.

- Inserito in ogni pagina con `admin.components.header` e nella pagina di accesso insieme al logo (`components/admin/Marchio`).
- Interruttore `marchio.pannelloSorazon` nelle Impostazioni (predefinito acceso, solo amministratori: `access.update: eAmministratore`; test in `ruoli.int.spec.ts`).
- Gli aggiornamenti di Payload non toccano questi file (sono nel nostro codice). Possono però rinominare variabili o classi interne: dopo un aggiornamento controllare a vista accesso, menu, un documento, pulsanti, in chiaro e scuro. Ripristino: la casella nelle Impostazioni (subito, senza tecnico) oppure git; il tag `pannello-standard` segna l'ultima versione senza tema.

## Cestino

`trash: true` su pagine, notizie, centri, moduli (`formOverrides` del plugin form-builder), media (migrazione `cestino`) e file del marchio (migrazione `cestino_marchio`): colonne `deleted_at`. Un file del marchio nel cestino conta come non scelto (sito, pannello e favicon usano quello predefinito). Pagina **Cestino** (`components/admin/Cestino`, vista `/admin/cestino`, voce nel menu dopo Avanzate con `afterNavLinks`): gli elementi eliminati di tutte le raccolte con `trash`, divisi per tipologia, con l'accesso dell'utente (ognuno vede solo le raccolte che può vedere), collegati alla vista del cestino di Payload (`/collections/<slug>/trash/<id>`) per ripristino ed eliminazione. "Elimina" del pannello imposta `deletedAt` (permesso "Elimina" della voce); il ripristino è una modifica (`deletedAt: null`, permesso "Modifica"); le query normali escludono i documenti nel cestino (`trash: true` per vederli). L'eliminazione definitiva è solo per chi ha l'accesso completo: hook `beforeDelete` `soloAdminEliminaDefinitivo` (`hooks/cestino.ts`), non nei permessi, perché Payload usa `access.delete` anche per mostrare i pulsanti e per le eliminazioni multiple senza distinguere cestino e cancellazione; le operazioni di sistema (nessun utente) passano. Nessuno svuotamento automatico. Una notizia nel cestino esce dall'indice di ricerca. Test in `ruoli.int.spec.ts`.
