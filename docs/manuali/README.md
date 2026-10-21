# Manuali d'uso

I manuali si scrivono in **Markdown** in `backend/src/guida/` e si leggono nel pannello alla voce **Guida** (`/admin/guida`). Il manuale per amministratori lo vede solo chi ha un ruolo con accesso completo.

| File | Contenuto |
|---|---|
| `backend/src/guida/redattori.md` | Guida per redattori e proprietari: tutte le funzioni, linguaggio semplice |
| `backend/src/guida/amministratori.md` | Guida per amministratori: utenti, ruoli, SEO, analisi, voci avanzate |
| `backend/public/guida/*.jpg` | Schermate (`r…` redattori, `a…` amministratori, `s…` sito pubblico) |
| `guida-redattori.pdf`, `guida-amministratori.pdf` | Versioni stampabili |

## Aggiornare

1. Modifica il file Markdown. Le immagini si inseriscono con `![Didascalia](/guida/nome.jpg)`: la didascalia compare sotto l'immagine.
2. Nuove schermate: 1280×800, JPEG, nella cartella `backend/public/guida/`. Usa dati di prova, mai dati personali reali.
3. I titoli `##` diventano i capitoli dell'indice.
4. PDF: apri la Guida nel pannello e premi **Stampa o salva in PDF** (la stampa nasconde menu e pulsanti e va a capo a ogni capitolo). Sostituisci i PDF in questa cartella.

Regole di scrittura: frasi brevi, un passo per riga, parole del pannello in **grassetto**, nessun termine tecnico non spiegato. Le affermazioni sulla terapia non si scrivono nei manuali.
