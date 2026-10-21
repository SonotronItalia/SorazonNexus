# Guida per amministratori

Questa guida è per chi gestisce il pannello: utenti, permessi, SEO, statistiche e voci tecniche.

Per i contenuti di tutti i giorni (pagine, notizie, centri, immagini) vale la **Guida per redattori e proprietari**, che trovi nella scheda accanto.

> **Chi è l'amministratore.** È chi ha un ruolo con **Accesso completo**. Vede e può modificare tutto, compresi gli utenti e i loro permessi. È un ruolo di responsabilità: in azienda dovrebbero averlo **due persone al massimo**.

## Le voci in più

Oltre alle voci dei redattori, l'amministratore vede il gruppo **Avanzate**:

- **Utenti** e **Ruoli e permessi**.
- **SEO e motori AI**.
- **Reindirizzamenti**, **Categorie**, **Tipi di effetto**, **Indice di ricerca**.

In più vede la scheda **Analisi e pubblicità** in Impostazioni del sito.

![Il pannello visto da un amministratore](/guida/a01-home.jpg)

## Utenti

In **Avanzate › Utenti** ci sono le persone che possono entrare nel pannello.

![L'elenco degli utenti](/guida/a02-utenti.jpg)

### Aggiungere una persona

1. Premi **Crea Nuovo**.
2. Scrivi **email**, **nome** e una **password** provvisoria.
3. Scegli il **Ruolo** (per esempio *Redattore*).
4. Premi **Salva**.
5. Comunica email e password alla persona **di persona o al telefono**, non nella stessa email. Chiedile di cambiare la password al primo accesso.

![Un nuovo utente](/guida/a03-nuovo-utente.jpg)

### Togliere l'accesso

Quando una persona lascia l'incarico, **elimina** il suo utente oppure cambia la sua password. Non lasciare account inutilizzati.

### Protezioni automatiche

- Dopo **5 password sbagliate** l'account si blocca per **15 minuti**.
- Ogni sessione dura al massimo **8 ore**.
- Un utente **non può cambiare il proprio ruolo** se non ha l'accesso completo.
- Il pannello impedisce di togliere l'accesso completo **all'ultimo amministratore**: il sito non resta mai senza qualcuno che lo gestisce.

> **Password dimenticata.** L'email per scegliere una nuova password parte solo se il server ha la posta configurata. Se non arriva, l'amministratore può impostare una password nuova dalla scheda dell'utente.

## Ruoli e permessi

In **Avanzate › Ruoli e permessi** decidi **cosa può fare** ogni persona. Ogni utente ha **un** ruolo.

![L'elenco dei ruoli](/guida/a04-ruoli.jpg)

All'inizio ci sono due ruoli:

- **Amministratore**: accesso completo.
- **Redattore**: contenuti, contatti, aspetto del sito (effetti compresi) e impostazioni, ma non la scheda *Analisi e pubblicità*. Non vede le voci avanzate.

Puoi creare altri ruoli, per esempio *Marketing* (solo notizie e social) o *Segreteria* (solo centri e messaggi ricevuti).

### Com'è fatto un ruolo

- **Nome** e **descrizione**.
- **Accesso completo (amministratore)**: se lo spunti, il ruolo può fare tutto e le caselle sotto spariscono.
- **Permessi voce per voce**: per ogni voce del menu, quattro caselle.

![Un ruolo aperto](/guida/a05-ruolo.jpg)

| Casella | Cosa permette |
|---|---|
| **Vede** | La voce compare nel menu e si può aprire. |
| **Crea** | Aggiungere elementi nuovi (una pagina, un centro…). |
| **Modifica** | Cambiare e pubblicare quelli esistenti. |
| **Elimina** | Cancellarli. |

Per le voci uniche (Menu principale, Piè di pagina, Impostazioni, SEO…) ci sono solo **Vede** e **Modifica**.

![Le caselle dei permessi](/guida/a06-ruolo-permessi.jpg)

Due permessi da dare con attenzione:

- **Impostazioni: scheda "Analisi e pubblicità"**: chi lo ha può inserire Google Tag Manager, che a sua volta può aggiungere programmi al sito.
- **Tipi di effetto**: si scrive codice.

> **Le modifiche ai permessi valgono subito.** Se una persona non vede una voce appena abilitata, basta che ricarichi la pagina del pannello.

Le protezioni dei ruoli:

- Un ruolo **assegnato a qualcuno non si può eliminare**: prima cambia il ruolo di quelle persone.
- Non puoi togliere l'accesso completo **al tuo stesso ruolo**: è un modo sicuro per non restare chiusi fuori.

## SEO e motori AI

In **Avanzate › SEO e motori AI** decidi come il sito si presenta a **Google**, ai **social** e agli **assistenti AI** (ChatGPT, Claude, Perplexity, Gemini…).

> **Attenzione.** Un errore qui può far sparire il sito dalle ricerche. Cambia una cosa alla volta e controlla il risultato.

### Scheda Sito

- **Nome del sito**: compare nel titolo delle pagine su Google.
- **Descrizione del sito**: la frase usata quando una pagina non ne ha una propria. Ideale: 120-160 caratteri.
- **Modello del titolo**: come si compone il titolo su Google. `{pagina} | {sito}` diventa *Terapia | Sorazon*.
- **Immagine di condivisione predefinita**: l'immagine che compare su WhatsApp, Facebook e LinkedIn quando una pagina non ne ha una propria. Usa un'immagine di 1200×630 pixel.

![SEO: scheda Sito](/guida/a07-seo-sito.jpg)

### Scheda Motori di ricerca

- **Nascondi tutto il sito ai motori di ricerca**: solo per un sito di prova. Sul sito pubblico deve restare **spento**.
- **Codici di verifica** di Google Search Console e di Bing: servono per collegare il sito a questi strumenti gratuiti. Copia solo il codice, non tutto il tag.
- **Pagine da non indicizzare**: indirizzi che restano visitabili ma non compaiono su Google (per esempio una promozione scaduta). Scrivi il percorso che inizia con **/**, per esempio `/promozione-2025`.

![SEO: scheda Motori di ricerca](/guida/a08-seo-ricerca.jpg)

### Scheda Motori AI (GEO)

Gli **assistenti AI** leggono i siti per rispondere alle domande. Se sono ammessi possono **citare** Sorazon nelle risposte: è un'occasione per farsi conoscere.

- **Assistenti che possono leggere il sito**: togli la spunta per escluderne uno. Di base sono tutti ammessi.
- **Presentazione in llms.txt**: un breve testo in più per gli assistenti, nel file *llms.txt*, il sommario del sito pensato per loro. Solo fatti, **niente affermazioni sulla salute**.
- **Elenco dei centri** ed **elenco delle notizie** in llms.txt: puoi toglierli.

![SEO: scheda Motori AI](/guida/a09-seo-ai.jpg)

### Scheda Dati dell'azienda

Ragione sociale, logo, indirizzo, telefono, email, partita IVA e codice fiscale. Google e gli assistenti li usano per sapere **chi siete e dove siete**. Se un campo è vuoto si usa quello del Piè di pagina.

![SEO: scheda Dati dell'azienda](/guida/a10-seo-azienda.jpg)

I profili social si inseriscono invece in **Impostazioni del sito › Social**.

## Analisi e pubblicità

In **Impostazioni del sito › Analisi e pubblicità** si collegano gli strumenti di Google che misurano le visite e le campagne:

- **Google Tag Manager** (consigliato se c'è un'agenzia di marketing).
- Oppure **Google Analytics 4** e **Google Ads** direttamente.
- **Modalità del consenso**: *Base* (consigliata) non contatta Google prima che il visitatore accetti i cookie. *Avanzata* stima anche le visite di chi rifiuta: va decisa con il consulente privacy.

![La scheda Analisi e pubblicità](/guida/a11-analisi.jpg)

Gli strumenti si attivano **solo dopo il consenso** del visitatore nel banner dei cookie. Il formato dei codici viene controllato: un codice sbagliato non viene salvato.

## Reindirizzamenti

In **Avanzate › Reindirizzamenti** colleghi un **indirizzo vecchio** a una **pagina nuova**. Chi arriva dal vecchio indirizzo (per esempio da Google o da un link salvato) finisce nella pagina giusta.

![I reindirizzamenti](/guida/a12-reindirizzamenti.jpg)

Quando servono:

- hai cambiato l'**indirizzo** di una pagina;
- hai **eliminato** una pagina: porta i visitatori a quella più simile;
- vecchi indirizzi del sito precedente (già impostati).

Il reindirizzamento vale entro un minuto dal salvataggio.

## Moduli

In **Contatti › Moduli** si configurano i moduli del sito: campi, messaggio di conferma ed **email**.

![Un modulo aperto](/guida/a15-modulo.jpg)

Più in basso, nella parte delle **email**, decidi a chi arriva ogni messaggio (di base *info@sonotronitalia.com*). Le email partono solo se il server ha la posta configurata. In ogni caso i messaggi restano in **Richieste ricevute**.

Ogni invio è controllato dal sito: campi obbligatori, email valida, lunghezza e una trappola invisibile contro i programmi di spam.

## Categorie delle notizie

In **Avanzate › Categorie** crei le categorie (per esempio *Rassegna stampa*, *Eventi*). I redattori le scelgono nelle notizie.

![Le categorie](/guida/a13-categorie.jpg)

## Tipi di effetto

Gli **effetti** pronti (alone, scarica, particelle, onde, bagliore) bastano quasi sempre. In **Avanzate › Tipi di effetto** uno sviluppatore può scriverne di nuovi in **CSS** e **JavaScript**.

![Un nuovo tipo di effetto](/guida/a14-tipi-effetto.jpg)

Per sicurezza il codice gira **isolato**: non può leggere la pagina, i cookie o i dati dei visitatori, né collegarsi a internet. Prima di salvare va spuntata la **dichiarazione sulla fotosensibilità**: niente lampeggi rapidi, che possono essere pericolosi per chi soffre di epilessia.

## Indice di ricerca

**Avanzate › Indice di ricerca** contiene le voci usate dalla ricerca del sito (la lente 🔍). Si aggiorna da solo quando si salvano le notizie: **non serve modificarlo**.

![L'indice di ricerca](/guida/a16-indice-ricerca.jpg)

## Buone pratiche

- **Password robuste** per tutti, diverse da quelle di altri servizi.
- **Pochi amministratori**: a tutti gli altri basta il ruolo *Redattore* o un ruolo su misura.
- **Testi sulla salute**: prima di pubblicare frasi su indicazioni, effetti o sicurezza della terapia, falle approvare da chi è competente in azienda.
- **Cookie e privacy**: le pagine *Cookie policy* e *Privacy* vanno scritte da un consulente prima di pubblicarle.
- **Dati legali** nel Piè di pagina sempre aggiornati (sono obbligatori).
- Quando una persona lascia l'incarico, **togli subito** il suo accesso.

## Cosa fa il tecnico

Alcune attività non si fanno dal pannello. Se ne occupa il tecnico che gestisce il server:

- **Copie di sicurezza** (backup) del database e delle immagini, e il loro ripristino.
- **Aggiornamenti** del sito e del pannello.
- Indirizzo del sito, certificato HTTPS, posta del server.
- Problemi di funzionamento.

I dettagli sono nella **documentazione tecnica** del progetto (cartella *docs* del codice).
