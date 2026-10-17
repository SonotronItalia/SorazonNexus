#!/usr/bin/env bash
# Prepara il progetto su un computer nuovo. Si può rilanciare senza danni.
set -euo pipefail
cd "$(dirname "$0")/.."

FX="bash scripts/fx.sh"
APP=vetrina

fail() { printf '\033[31m✘ %s\033[0m\n' "$1" >&2; exit 1; }

gen_secret() {
  if command -v openssl >/dev/null 2>&1; then
    openssl rand -hex 32
  else
    node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
  fi
}

$FX banner "preparazione del progetto"

# 1. Strumenti necessari
for t in git node docker make; do
  command -v "$t" >/dev/null 2>&1 || fail "$t non è installato"
done
docker info >/dev/null 2>&1 || fail "Docker non è in esecuzione: avvia Docker Desktop e riprova"
node -e 'const [a,b]=process.versions.node.split(".").map(Number); process.exit(a>20||(a===20&&b>=9)?0:1)' \
  || fail "Serve Node 20.9 o superiore (consigliato: la versione in .nvmrc)"

# 2. pnpm (via corepack, che legge la versione da package.json)
if ! command -v pnpm >/dev/null 2>&1; then
  corepack enable >/dev/null 2>&1 || true
fi
command -v pnpm >/dev/null 2>&1 \
  || fail "pnpm non disponibile: prova 'corepack enable' (o 'sudo corepack enable'), oppure 'npm i -g pnpm'"

# 3. File .env con segreti casuali (solo se non esiste già)
if [ -f "$APP/.env" ]; then
  echo "• $APP/.env esiste già: non lo tocco"
else
  [ -f "$APP/.env.example" ] || fail "Manca $APP/.env.example"
  while IFS= read -r line || [ -n "$line" ]; do
    case "$line" in
      PAYLOAD_SECRET=*|CRON_SECRET=*|PREVIEW_SECRET=*) echo "${line%%=*}=$(gen_secret)" ;;
      *) echo "$line" ;;
    esac
  done < "$APP/.env.example" > "$APP/.env"
  echo "• Creato $APP/.env con segreti nuovi"
fi

# 4. Dipendenze e database
$FX run "Installo le dipendenze" pnpm -C "$APP" install --frozen-lockfile
make --no-print-directory up

echo
echo "Fatto. Prossimi passi:"
echo "  make dev          avvia il sito"
echo "  poi apri http://localhost:3000/admin e crea il primo utente"
echo "  make help         elenco dei comandi"