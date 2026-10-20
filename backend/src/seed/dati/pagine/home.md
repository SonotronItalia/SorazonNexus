---
title: Home
slug: home
# Titolo e descrizione per Google e gli assistenti AI (descrizione: 120-160 caratteri)
meta:
  title: "Sorazon: terapia antinfiammatoria non invasiva"
  description: "Apparecchio elettromedicale brevettato per la terapia antinfiammatoria non invasiva con ozono, radiofrequenza e onde soniche. Trova il centro Sorazon più vicino."
hero:
  type: sorazon
  # Titolo e sottotitolo del vecchio sito; il claim sanitario resta fuori finché non è rivisto
  richText: |
    # Evoluzione terapeutica

    Brevetto Italia Europa
  links:
    - link:
        type: reference
        reference: pagina:centri
        label: Trova un centro
        appearance: default
    - link:
        type: reference
        reference: pagina:dispositivo
        label: I dispositivi
        appearance: outline
  media: media:sorazon-maxi.webp
  # Effetti della sezione "Effetti" (dati/effetti.csv); "attivo: false" lo lascia ma spento
  effetti:
    - effetto: effetto:Pulsazione
      attivo: true
    - effetto: effetto:Scarica di Tesla
      attivo: false
# Struttura in stile pagina prodotto: sezioni chiare e scure alternate, numeri, prodotto guidato
# dallo scorrimento, carosello. Solo testi già approvati (Terapia, Dispositivi, Risultati).
layout:
  - blockType: numeriEvidenza
    titolo: Una rete che cresce in tutta Italia.
    sfondo: scuro
    voci:
      - tipo: manuale
        valore: 1992
        conta: false
        prefisso: dal
        etichetta: risultati clinici in Italia
      - tipo: centri
        conta: true
        etichetta: centri di riferimento
      - tipo: regioni
        conta: true
        etichetta: regioni italiane
  - blockType: prodottoScorrimento
    occhiello: Il dispositivo
    titolo: Tecnologia brevettata in Italia e in Europa.
    sfondo: scuro
    tipo: immagini
    passaggi:
      - occhiello: Sorazon Studio
        titolo: Lo studio, al centro della terapia.
        testo: Apparecchio elettromedicale da studio, con unità base, monitor da 7" a colori e manipolo trasduttore.
        immagine: media:sorazon-studio.webp
      - occhiello: Sorazon Maxi
        titolo: La stessa tecnologia, in valigia.
        testo: Versione portatile a valigia, con monitor da 7" a colori e lo stesso manipolo trasduttore della versione Studio.
        immagine: media:sorazon-maxi.webp
      - occhiello: Manipolo trasduttore
        titolo: Camera di ionizzazione e generatore di ozono.
        testo: Il manipolo è comune a Studio e Maxi.
        immagine: media:manipolo-trasduttore.webp
      - occhiello: Tripla azione
        titolo: Non invasiva, non a contatto, non dolorosa.
        testo: Onde soniche pressorie, radiofrequenza con campo elettromagnetico ionizzante ed energia ossigenatoria di ozono.
        immagine: media:sorazon-maxi-celeste.webp
  - blockType: carosello
    titolo: Scopri Sorazon.
    sfondo: tenue
    schede:
      - occhiello: Terapia
        titolo: Terapia intensiva antinfiammatoria.
        testo: Mirata, infiltrante, profonda. Non invasiva, non a contatto, non dolorosa.
        immagine: media:manipolo-trasduttore-bianco.webp
        conLink: true
        link:
          type: reference
          reference: pagina:terapia
          label: Come funziona
      - occhiello: Indicazioni
        titolo: Artrosi, infiammazioni articolari, traumi.
        testo: Gli ambiti di applicazione, distretto per distretto.
        immagine: media:colonna_vertebrale.jpg
        conLink: true
        link:
          type: reference
          reference: pagina:indicazioni
          label: Le indicazioni
      - occhiello: Risultati
        titolo: Risultati clinici in Italia dal 1992.
        immagine: media:hero-risultati.webp
        conLink: true
        link:
          type: reference
          reference: pagina:risultati
          label: Guarda i risultati
      - occhiello: Centri
        titolo: Trova il centro più vicino.
        testo: Ambulatori in Italia abilitati a praticare la terapia Sorazon.
        immagine: media:sorazon-maxi-fronte.webp
        conLink: true
        link:
          type: reference
          reference: pagina:centri
          label: Elenco dei centri
      - occhiello: Dispositivi
        titolo: Sorazon Studio e Sorazon Maxi.
        immagine: media:sorazon-studio.webp
        conLink: true
        link:
          type: reference
          reference: pagina:dispositivo
          label: I dispositivi
  - blockType: cta
    richText: |
      ## Trova il centro più vicino

      Ambulatori in Italia abilitati a praticare la terapia Sorazon.
    links:
      - link:
          type: reference
          reference: pagina:centri
          label: Elenco dei centri
          appearance: default
---
