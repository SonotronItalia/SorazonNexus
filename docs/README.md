# Documentazione del progetto Sorazon

## Manuali d'uso (per chi usa il pannello)

I manuali sono anche **dentro il pannello**, alla voce **Guida** in fondo al menu: ognuno vede quello del suo ruolo, con le schermate, e può stamparlo o salvarlo in PDF.

| Manuale | Per chi | File |
|---|---|---|
| Guida per redattori e proprietari | Chi aggiorna il sito, senza conoscenze tecniche | [PDF](manuali/guida-redattori.pdf) · [sorgente](../backend/src/guida/redattori.md) |
| Guida per amministratori | Chi gestisce utenti, permessi, SEO e statistiche | [PDF](manuali/guida-amministratori.pdf) · [sorgente](../backend/src/guida/amministratori.md) |

Come aggiornarli: [manuali/README.md](manuali/README.md).

## Documentazione tecnica (per sviluppatori e sistemisti)

| Documento | Contenuto |
|---|---|
| [Architettura](tecnica/architettura.md) | Servizi, reti, flusso dei dati, cache, anteprima, immagini |
| [Sviluppo](tecnica/sviluppo.md) | Requisiti, avvio, comandi, migrazioni, contenuti di partenza, convenzioni |
| [CMS (backend)](tecnica/cms.md) | Collezioni, globali, blocchi, ruoli e permessi, hook, plugin |
| [Sito (frontend)](tecnica/frontend.md) | Rendering, design, animazioni, effetti, consenso, SEO e GEO |
| [Sicurezza](tecnica/sicurezza.md) | Difese nel codice, nel proxy e nei container |
| [Test e CI](tecnica/test-e-ci.md) | Test unitari, di integrazione, end-to-end, API e GitHub Actions |
| [Rilascio e gestione](tecnica/rilascio-e-gestione.md) | Stack, proxy HTTPS, variabili, backup e ripristino, tunnel, CD |
| [Decisioni](decisioni.md) | Registro delle scelte architetturali con alternative e motivi |

Il file [CLAUDE.md](../CLAUDE.md) alla radice riassume regole e contesto per chi lavora sul codice (anche con un assistente AI).
