#!/usr/bin/env bash
# Libera lo spazio che Docker accumula a ogni ricostruzione dello stack:
# - le immagini vecchie senza nome ("dangling") di QUESTO progetto (etichetta Compose "sorazon"):
#   ogni make stack lascia indietro la versione precedente (migrate e seed pesano ~1,4 GB l'una);
# - la cache di build oltre CACHE_MAX (predefinito 5GB): Docker la ricostruisce quando serve.
# Non tocca mai volumi (database, immagini caricate), container, né immagini in uso o con nome.
# Uso: bash scripts/pulisci-docker.sh            (riepilogo)
#      bash scripts/pulisci-docker.sh --breve    (una riga, dopo make stack)
set -u
CACHE_MAX=${CACHE_MAX:-5GB}
PROGETTO=${COMPOSE_PROJECT_NAME:-sorazon}

docker info >/dev/null 2>&1 || { echo "  Docker spento: niente da pulire"; exit 0; }

prima=$(docker system df --format '{{.Size}}' | paste -sd ' ' -)
immagini=$(docker images -q -f dangling=true -f "label=com.docker.compose.project=$PROGETTO" | sort -u)
n=0
if [ -n "$immagini" ]; then
  n=$(echo "$immagini" | wc -l | tr -d ' ')
  # rmi senza -f: un'immagine ancora usata da un container viene saltata, non forzata
  echo "$immagini" | xargs docker rmi >/dev/null 2>&1 || true
fi
docker builder prune -f --max-used-space "$CACHE_MAX" >/dev/null 2>&1 || true
dopo=$(docker system df --format '{{.Size}}' | paste -sd ' ' -)

if [ "${1:-}" = "--breve" ]; then
  echo "  Pulizia Docker: $n immagini vecchie tolte, cache di build entro $CACHE_MAX"
else
  echo "  Immagini vecchie del progetto tolte: $n"
  echo "  Cache di build ridotta entro $CACHE_MAX"
  echo "  Spazio (immagini, container, volumi, cache) prima: $prima"
  echo "  Spazio (immagini, container, volumi, cache) dopo:  $dopo"
fi
