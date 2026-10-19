#!/usr/bin/env bash
# Allinea le immagini caricate dal CMS tra il Mac (backend/public/media, usate da make dev) e il
# volume dello stack Docker (/data/media nel container backend). Il database è lo stesso, le
# cartelle no: senza questo, un'immagine caricata da una parte manca dall'altra.
# Copia solo i file che mancano, in entrambe le direzioni; non sovrascrive e non cancella nulla.
# Serve il container backend acceso; altrimenti non fa niente.
set -u
cd "$(dirname "$0")/.."

COMPOSE=${COMPOSE:-docker compose}
LOCALE=backend/public/media
VOLUME=/data/media

ID=$($COMPOSE ps --status running -q backend 2>/dev/null)
[ -n "$ID" ] || { echo "  Stack spento: immagini non allineate"; exit 0; }
mkdir -p "$LOCALE"

TMP=$(mktemp -d)
trap 'rm -rf "$TMP"' EXIT
docker exec "$ID" ls -1 "$VOLUME" 2>/dev/null | sort >"$TMP/volume"
ls -1 "$LOCALE" | sort >"$TMP/locale"

verso_mac=0; verso_stack=0
while IFS= read -r f; do
  [ -n "$f" ] && docker cp -q "$ID:$VOLUME/$f" "$LOCALE/$f" && verso_mac=$((verso_mac + 1))
done < <(comm -23 "$TMP/volume" "$TMP/locale")
while IFS= read -r f; do
  [ -n "$f" ] && docker cp -q "$LOCALE/$f" "$ID:$VOLUME/$f" && verso_stack=$((verso_stack + 1))
done < <(comm -13 "$TMP/volume" "$TMP/locale")

echo "  Immagini allineate: $verso_mac copiate sul Mac, $verso_stack copiate nello stack"
