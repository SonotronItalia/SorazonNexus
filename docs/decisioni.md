# Decisioni

| Data | Decisione | Alternative | Motivo |
|---|---|---|---|
| 2026-10-19 | Schema del database solo con migrazioni, anche in sviluppo (`push: false`) | Sincronizzazione automatica (push) in sviluppo e migrazioni solo in produzione | Il push si blocca su domande interattive e lascia il DB in uno stato che le migrazioni non riconoscono; così sviluppo e produzione seguono la stessa strada |
