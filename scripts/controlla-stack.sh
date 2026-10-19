#!/usr/bin/env bash
# Prima di make dev: se lo stack Docker è acceso, backend e frontend dello stack occupano le
# stesse porte (3000 e 3001) e lavorano sullo stesso database, e avviare il database di sviluppo
# riavvia quello dello stack. Avvisa e, con conferma, ferma i servizi dello stack (non il database).
set -u
cd "$(dirname "$0")/.."

COMPOSE=${COMPOSE:-docker compose}
FX="bash scripts/fx.sh"
if [ -t 1 ] && [ -z "${NO_COLOR:-}" ]; then RED=$'\033[31m'; RESET=$'\033[0m'; else RED=''; RESET=''; fi

accesi=$($COMPOSE ps --status running --format '{{.Service}}' 2>/dev/null | grep -E '^(backend|frontend|nginx|certbot)$' | tr '\n' ' ')
[ -z "$accesi" ] && exit 0

printf '%s⚠ Lo stack Docker è acceso (%s).%s\n' "$RED" "${accesi% }" "$RESET"
echo "  make dev userebbe le stesse porte 3000 e 3001 e lo stesso database:"
echo "  non sapresti quale dei due ti risponde."
if [ ! -t 0 ]; then
  echo "  Ferma lo stack con: make stop"
  exit 1
fi
$FX confirm "Scrivi 'ferma' per fermare backend, frontend e proxy dello stack e continuare:" ferma || exit 1
docker rm -f sorazon-tunnel-proxy >/dev/null 2>&1 || true
$FX run "Fermo backend, frontend e proxy dello stack" $COMPOSE stop backend frontend nginx certbot
