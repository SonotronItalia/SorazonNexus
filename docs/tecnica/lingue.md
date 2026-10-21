# Lingue e traduzioni

## In breve

- **Localizzazione nativa di Payload**: un documento, più versioni linguistiche. Italiano lingua principale (indirizzi senza prefisso), le altre con il prefisso: `/en/therapy`.
- Lingue possibili in `backend/src/lingue.ts` (12 europee, stesso elenco in `frontend/src/utilities/lingue.ts`). Quali sono attive, in che ordine e con quale bandiera lo decide il pannello: **Impostazioni › Lingue e selettore** (globale `lingue`).
- Una pagina o notizia compare in una lingua solo con **Pubblicata in questa lingua** (`inLingua`, campo localizzato). Altrimenti l'indirizzo in quella lingua porta alla pagina italiana.
- Permessi a sé: **Traduce in…** nei ruoli (`ruoli.traduzioni.<codice>`). Admin: tutte le lingue.

## Cosa si traduce

| Voce | Campi localizzati |
|---|---|
| Pagine | `title`, `slug`, `hero` (tutto il gruppo), `layout` (tutti i blocchi), `meta` (SEO), `inLingua` |
| Notizie | `title`, `slug`, `content`, `meta`, `inLingua` |
| Menu principale, Piè di pagina | `navItems` (ogni lingua ha il suo menu) |
| Impostazioni del sito | `avviso` |
| SEO e motori AI | `descrizioneSito`, `llmsPresentazione` |
| Categorie | `title` |
| Moduli | etichette, messaggi, pulsante (lo fa il plugin form-builder) |

Tutto il resto è comune alle lingue (date, immagini fuori dai blocchi, centri, colori, effetti, impostazioni tecniche). Con `layout` localizzato ogni lingua ha i propri blocchi: il traduttore parte da **Copia in un'altra lingua** (menu ⋮ del documento) e poi traduce.

Nel database ogni campo localizzato sta nelle tabelle `*_locales` (una riga per lingua) o, per blocchi e array localizzati, nella colonna `_locale`; le relazioni dei campi localizzati hanno la colonna `locale` nelle tabelle `*_rels`.

## Indirizzi e rendering

1. `frontend/src/proxy.ts` riconosce il prefisso (`/en/…`), lo toglie con un *rewrite* (l'indirizzo nel browser non cambia) e passa la lingua nell'intestazione `x-lingua`. Senza prefisso l'intestazione viene tolta: non si può forzare.
2. `utilities/linguaRichiesta.ts` legge la lingua nelle pagine e nel layout (`<html lang>`, menu, piè di pagina, avviso, metadati).
3. `lib/content.ts` aggiunge `locale` alle richieste. Nelle altre lingue la pagina si cerca per lo slug di quella lingua con `inLingua = true` e senza ripiego (`fallback-locale=none`), poi si legge con il ripiego sull'italiano per le parti non tradotte.
4. Traduzione mancante: `slugItaliano()` trova la versione italiana e la pagina reindirizza lì. Se non esiste nemmeno in italiano: 404.
5. `AlternativeLingua` (in pagine e notizie) passa al selettore gli slug nelle altre lingue; `generateMeta` scrive `hreflang` (con `x-default` sull'italiano), canonico e `og:locale`.
6. Il layout non si ridisegna nella navigazione interna di Next: `LinguaProvider` ricarica la pagina se l'indirizzo cambia lingua (link o reindirizzamento), e il selettore usa collegamenti normali.

Collegamenti: `CMSLink` e i link interni dei testi (`LinkInterno`) aggiungono il prefisso della lingua; gli indirizzi scritti a mano che iniziano con `/` lo ricevono, tranne `/media/` e `/api/`.

## Scritte fisse

`frontend/src/utilities/testi.ts`: dizionari `it` ed `en` per pulsanti, banner dei cookie, mappa, modulo, selettore, ecc. Nei componenti client si usano con `useLingua().t`, in quelli server con `testi(await linguaRichiesta())`. Le lingue senza dizionario usano l'inglese. Nuova lingua completa: aggiungere il dizionario.

## Selettore e bandiere

`components/SelettoreLingua`: tendina nell'header (e voci in fila nel menu del telefono). Stili: bandiera e nome, bandiera e sigla, solo bandiera. Bandiere SVG da **flag-icons** 7.5.0 (licenza MIT, `frontend/public/bandiere/LICENSE.txt`): uguali su ogni sistema, a differenza delle emoji che su Windows appaiono come lettere.

## Permessi

`access/ruoli.ts`: per le voci in `TRADUCIBILI` (`access/risorse.ts`), la modifica in una lingua diversa dall'italiano richiede `puòTradurre(user, lingua)` invece di "Modifica". La lingua è `req.locale` (nel pannello quella scelta in alto). Il selettore delle lingue del pannello (`utilities/linguePerIlPannello.ts`, `filterAvailableLocales`) mostra l'italiano più le lingue presenti in "Lingue e selettore" che la persona può tradurre.

## SEO

- Sitemap con tutte le versioni pubblicate nelle lingue attive (`utilities/sitemap.ts`).
- `hreflang` solo quando esiste almeno una traduzione pubblicata in una lingua attiva.
- Gli indirizzi inglesi del vecchio sito (`/en/device`, `/en/therapy`, `/en/indications`, `/en/results`, `/en/contact-us`) sono gli slug inglesi delle pagine: nessun reindirizzamento necessario.
- `llms.txt` resta in italiano.

## Anteprima

`generatePreviewPath` aggiunge il prefisso della lingua scelta nel pannello; l'endpoint `anteprima` legge la bozza in quella lingua (`?locale=`), anche se non è ancora "Pubblicata in questa lingua".

## Contenuti di partenza

`backend/src/seed/dati/traduzioni/<lingua>/`: pagine in Markdown come quelle italiane (`pagina:` = slug italiano, `pubblicata:` = `inLingua`), `menu.csv`, `moduli/*.yml` (stessi campi del modulo italiano, nello stesso ordine), `seo.yml`. `dati/lingue.yml` imposta le lingue solo se nel CMS non ce n'è ancora nessuna.

## Migrazione `traduzioni`

Ha reso localizzati i campi esistenti copiando i testi nella versione italiana: per ogni colonna spostata in una tabella `*_locales` c'è un `INSERT … SELECT` prima del `DROP COLUMN`, le righe dei blocchi esistenti ricevono `_locale = 'it'` e le relazioni `locale = 'it'`. Il generatore di Payload chiede in modo interattivo "colonna nuova o rinominata?" per le versioni: la risposta giusta è sempre "nuova" (lo script `expect` usato è descritto nel commit).

## Aggiungere una lingua

1. `backend/src/lingue.ts` e `frontend/src/utilities/lingue.ts` (codice, nomi, bandiere) + SVG della bandiera in `frontend/public/bandiere/`.
2. Migrazione (l'elenco delle lingue è un tipo `enum` di Postgres; le caselle "Traduce in…" sono colonne dei ruoli).
3. Facoltativo: dizionario in `utilities/testi.ts`.
4. Nel pannello: aggiungerla in "Lingue e selettore" e dare i permessi ai traduttori.
