---
title: Home
slug: home
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
        label: Il dispositivo
        appearance: outline
  media: media:dispositivo-sorazon.jpg
  # Effetti della sezione "Effetti" (dati/effetti.csv); "attivo: false" lo lascia ma spento
  effetti:
    - effetto: effetto:Pulsazione
      attivo: true
    - effetto: effetto:Scarica di Tesla
      attivo: false
layout:
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
