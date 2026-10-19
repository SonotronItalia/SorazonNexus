#!/usr/bin/env bash
# Avvia backend (Payload, :3001) e frontend (Next.js, :3000) insieme in un solo terminale.
# L'output di ciascuno ha il suo prefisso colorato. Ctrl+C ferma entrambi.
set -u
cd "$(dirname "$0")/.."

# I dati letti dal frontend restano in cache tra un avvio e l'altro: se nel frattempo il database
# è cambiato da un'altra parte (seed nello stack, ripristino) la cache non lo sa. Si riparte puliti.
rm -rf frontend/.next/dev/cache/fetch-cache frontend/.next/cache/fetch-cache   # Next 16: .next/dev in sviluppo

if [ -t 1 ] && [ -z "${NO_COLOR:-}" ]; then
  PURPLE=$'\033[38;5;135m'; CYAN=$'\033[36m'; DIM=$'\033[2m'; BOLD=$'\033[1m'; RESET=$'\033[0m'
else
  PURPLE=''; CYAN=''; DIM=''; BOLD=''; RESET=''
fi
export FORCE_COLOR=1   # i server colorano comunque l'output anche se passa da una pipe

prefix() {   # prefix <nome> <colore>
  local name="$1" color="$2" line
  while IFS= read -r line; do
    printf '%s%-9s%s │ %s\n' "$color" "$name" "$RESET" "$line"
  done
}

pids=()
stopped=0
cleanup() {
  [ "$stopped" = 1 ] && return 0
  stopped=1
  echo
  echo "${DIM}Fermo backend e frontend...${RESET}"
  local p
  for p in "${pids[@]}"; do kill -TERM -- "-$p" 2>/dev/null || true; done
  sleep 2
  for p in "${pids[@]}"; do kill -KILL -- "-$p" 2>/dev/null || true; done
  wait 2>/dev/null || true
}
trap 'cleanup; exit 130' INT
trap 'cleanup; exit 143' TERM
trap cleanup EXIT

# Ogni servizio parte in un proprio gruppo di processi, così lo si può fermare per intero
set -m
( pnpm -C backend dev 2>&1 | prefix backend "$PURPLE" ) &
pids+=($!)
( pnpm -C frontend dev 2>&1 | prefix frontend "$CYAN" ) &
pids+=($!)

echo "${BOLD}Backend${RESET}  → http://localhost:3001/admin"
echo "${BOLD}Frontend${RESET} → http://localhost:3000"
echo "${DIM}Ctrl+C per fermare entrambi${RESET}"
echo

wait
