#!/usr/bin/env bash
# Allinea le immagini caricate dal CMS tra il Mac (backend/public/media, usate da make dev) e il
# volume dello stack Docker (/data/media nel container backend), e così i file del marchio
# (backend/public/marchio e /data/media/marchio). Il database è lo stesso, le
# cartelle no: senza questo, un'immagine caricata da una parte manca dall'altra.
# Copia solo i file che mancano, in entrambe le direzioni; non sovrascrive e non cancella nulla.
# Serve il container backend acceso; altrimenti non fa niente.
set -u
cd "$(dirname "$0")/.."

COMPOSE=${COMPOSE:-docker compose}

ID=$($COMPOSE ps --status running -q backend 2>/dev/null)
[ -n "$ID" ] || { echo "  Stack spento: immagini non allineate"; exit 0; }

TMP=$(mktemp -d)
trap 'rm -rf "$TMP"' EXIT

# allinea <cartella sul Mac> <cartella nel volume> <nome>: solo i file, non le sottocartelle
allinea() {
  local locale=$1 volume=$2 nome=$3 verso_mac=0 verso_stack=0 f
  mkdir -p "$locale"
  docker exec "$ID" mkdir -p "$volume"
  docker exec "$ID" find "$volume" -maxdepth 1 -type f -exec basename {} \; 2>/dev/null | sort >"$TMP/volume"
  find "$locale" -maxdepth 1 -type f -exec basename {} \; | sort >"$TMP/locale"
  while IFS= read -r f; do
    [ -n "$f" ] && docker cp -q "$ID:$volume/$f" "$locale/$f" && verso_mac=$((verso_mac + 1))
  done < <(comm -23 "$TMP/volume" "$TMP/locale")
  while IFS= read -r f; do
    [ -n "$f" ] && docker cp -q "$locale/$f" "$ID:$volume/$f" && verso_stack=$((verso_stack + 1))
  done < <(comm -13 "$TMP/volume" "$TMP/locale")
  echo "  $nome allineati: $verso_mac copiati sul Mac, $verso_stack copiati nello stack"
}

allinea backend/public/media /data/media "Immagini e file"
# Loghi e icona (Impostazioni del sito > Marchio): sottocartella marchio del volume
allinea backend/public/marchio /data/media/marchio "File del marchio"

# Proprietario dei file nel volume: il seed (servizio "seed", gira come root) e docker cp creano
# file di root, che il backend (utente app, senza permessi speciali: cap_drop ALL) non può poi
# sostituire, e nemmeno scrivere nelle cartelle nuove (es. marchio): "errore di caricamento" nel
# pannello. Si sistema con un container temporaneo della stessa immagine, collegato al solo volume
UTENTE=$(docker exec "$ID" id -u):$(docker exec "$ID" id -g)
IMMAGINE=$(docker inspect "$ID" --format '{{.Config.Image}}')
VOLUME_NOME=$(docker inspect "$ID" --format '{{range .Mounts}}{{if eq .Destination "/data/media"}}{{.Name}}{{end}}{{end}}')
if [ -n "$VOLUME_NOME" ] &&
  docker run --rm --user root -v "$VOLUME_NOME:/data/media" --entrypoint chown "$IMMAGINE" -R "$UTENTE" /data/media; then
  echo "  Permessi dei file caricati sistemati (proprietario $UTENTE)"
else
  echo "  Attenzione: non sono riuscito a sistemare i permessi del volume dei media"
fi
