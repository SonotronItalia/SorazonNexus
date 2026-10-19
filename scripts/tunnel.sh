#!/usr/bin/env bash
# Rende raggiungibile da internet lo stack Docker acceso sul Mac, con due "quick tunnel" di
# Cloudflare (gratuiti, senza account): uno per il sito e uno per l'admin.
# Gli indirizzi cambiano a ogni avvio: lo script li passa a backend e frontend ricreando i due
# container (il file .env non viene toccato). Ctrl+C chiude i tunnel e rimette gli indirizzi locali.
set -u
cd "$(dirname "$0")/.."

COMPOSE=${COMPOSE:-docker compose}
FRONTEND_PORT=${FRONTEND_PORT:-3000}
BACKEND_PORT=${BACKEND_PORT:-3001}

if [ -t 1 ] && [ -z "${NO_COLOR:-}" ]; then
  PURPLE=$'\033[38;5;135m'; DIM=$'\033[2m'; BOLD=$'\033[1m'; RED=$'\033[31m'; RESET=$'\033[0m'
else
  PURPLE=''; DIM=''; BOLD=''; RED=''; RESET=''
fi
die() { echo "${RED}✘${RESET} $*" >&2; exit 1; }

if ! command -v cloudflared >/dev/null 2>&1; then
  if [ "$(uname)" = Darwin ] && command -v brew >/dev/null 2>&1; then
    echo "${DIM}Installo cloudflared con Homebrew...${RESET}"
    brew install cloudflared || die "installazione di cloudflared non riuscita"
  else
    die "manca cloudflared: https://developers.cloudflare.com/cloudflare-one/connections/connect-networks/downloads/"
  fi
fi

for porta in "$FRONTEND_PORT" "$BACKEND_PORT"; do
  curl -s -o /dev/null --max-time 5 "http://127.0.0.1:$porta" ||
    die "niente risponde su 127.0.0.1:$porta: avvia prima lo stack con make stack"
done

LOG=$(mktemp -d)
pids=()
fermato=0
chiudi() {
  [ "$fermato" = 1 ] && return 0
  fermato=1
  echo
  echo "${DIM}Chiudo i tunnel e rimetto gli indirizzi locali del .env...${RESET}"
  local p
  for p in "${pids[@]}"; do kill "$p" 2>/dev/null || true; done
  wait 2>/dev/null || true
  # Senza le variabili sovrascritte, Compose torna a leggere quelle del .env
  $COMPOSE up -d --no-build --no-deps --wait backend frontend >/dev/null 2>&1 ||
    echo "${RED}✘${RESET} non sono riuscito a ricreare backend e frontend: lancia make stack"
  rm -rf "$LOG"
}
trap 'chiudi; exit 130' INT
trap 'chiudi; exit 143' TERM
trap chiudi EXIT

# apri <nome> <porta>  -> avvia il tunnel e stampa l'indirizzo pubblico che Cloudflare assegna
apri() {
  cloudflared tunnel --no-autoupdate --url "http://127.0.0.1:$2" >"$LOG/$1.log" 2>&1 &
  pids+=($!)
}
indirizzo() {
  local i url
  for i in $(seq 60); do
    url=$(grep -oE 'https://[a-z0-9-]+\.trycloudflare\.com' "$LOG/$1.log" | head -1)
    [ -n "$url" ] && { echo "$url"; return 0; }
    sleep 1
  done
  return 1
}

echo "${DIM}Apro i tunnel (sito e admin)...${RESET}"
apri sito "$FRONTEND_PORT"
apri admin "$BACKEND_PORT"
SITO=$(indirizzo sito) || { cat "$LOG/sito.log" >&2; die "Cloudflare non ha assegnato l'indirizzo del sito"; }
ADMIN=$(indirizzo admin) || { cat "$LOG/admin.log" >&2; die "Cloudflare non ha assegnato l'indirizzo dell'admin"; }

# Le variabili d'ambiente della shell hanno la precedenza sul .env: backend e frontend
# vengono ricreati con gli indirizzi pubblici (letti a runtime, nessuna ricostruzione)
echo "${DIM}Passo gli indirizzi pubblici a backend e frontend...${RESET}"
FRONTEND_PUBLIC_URL=$SITO BACKEND_PUBLIC_URL=$ADMIN \
  $COMPOSE up -d --no-build --no-deps --wait backend frontend >/dev/null ||
  die "non sono riuscito a ricreare backend e frontend"

echo
echo "${PURPLE}${BOLD}  Sito:  ${SITO}${RESET}"
echo "${PURPLE}${BOLD}  Admin: ${ADMIN}/admin${RESET}"
echo
echo "${DIM}Raggiungibili da qualsiasi rete finché questo comando resta aperto e il Mac acceso."
echo "L'admin è pubblico: password robuste. Ctrl+C per chiudere.${RESET}"

# Resta aperto finché un tunnel non si chiude o arriva Ctrl+C
while kill -0 "${pids[0]}" 2>/dev/null && kill -0 "${pids[1]}" 2>/dev/null; do sleep 2; done
echo "${RED}✘${RESET} un tunnel si è chiuso"; tail -5 "$LOG"/*.log
