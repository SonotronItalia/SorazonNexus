---
title: Centri
slug: centri
# Titolo e descrizione per Google e gli assistenti AI (descrizione: 120-160 caratteri)
meta:
  title: "Centri Sorazon in Italia, divisi per regione"
  description: "Elenco degli ambulatori abilitati alla terapia Sorazon in Italia, per regione, con indirizzi e telefoni. Gli operatori sono formati presso la sede di Fano (PU)."
hero:
  type: lowImpact
  occhiello: La rete Sorazon
  richText: '# Centri di riferimento'
layout:
  # Numeri calcolati dalla collezione Centri: si aggiornano da soli
  - blockType: numeriEvidenza
    sfondo: tenue
    voci:
      - tipo: centri
        conta: true
        etichetta: centri di riferimento
      - tipo: regioni
        conta: true
        etichetta: regioni italiane
  # L'elenco lo prende il sito dalla collezione Centri (dati in ../centri.csv)
  - blockType: centriList
    titolo: Elenco per regione
    # Testo del vecchio sito (pagina Contatti)
    introduzione: |-
      Ambulatori in Italia abilitati a praticare la terapia Sorazon, con operatori che hanno effettuato il corso Formativo-Operativo-Teorico Pratico, con acquisizione di Attestato di Idoneità.
      Conseguito presso la sede aziendale ed il Centro Medico Polispecialistico di Fano (PU).
    mostraIndice: true
    colonne: '2'
---
