#!/usr/bin/env bash
# Verifica gli strumenti, installa quelli che mancano (macOS) e prepara il progetto.
# Si può rilanciare senza danni.
set -euo pipefail
cd "$(dirname "$0")/.."

APP=vetrina
NODE_MAJOR=22
OS="$(uname -s)"
export COREPACK_ENABLE_DOWNLOAD_PROMPT=0

have() { command -v "$1" >/dev/null 2>&1; }
ok()   { printf '\033[32m✔\033[0m %s\n' "$1"; }
fail() { printf '\033[31m✘ %s\033[0m\n' "$1" >&2; exit 1; }
node_ok() {
  have node && node -e 'const [a,b]=process.versions.node.split(".").map(Number); process.exit(a>20||(a===20&&b>=9)?0:1)'
}

# Installa solo su macOS con Homebrew; altrove spiega cosa manca
install_mac() {
  local what="$1"; shift
  [ "$OS" = "Darwin" ] || fail "Manca $what: installalo a mano (vedi requisiti.txt) e rilancia"
  have brew || fail "Manca $what e Homebrew non è installato: vai su https://brew.sh e rilancia"
  echo "→ Installo $what..."
  "$@"
}

# ---------- 1. Strumenti ----------
if have git; then ok "git"; else install_mac "git" brew install git; fi

if node_ok; then
  ok "node $(node -v)"
else
  install_mac "Node $NODE_MAJOR" bash -c "brew install node@$NODE_MAJOR && brew link --overwrite --force node@$NODE_MAJOR"
  node_ok || fail "Node installato ma non trovato: riapri il terminale e rilancia"
fi

have pnpm || corepack enable >/dev/null 2>&1 || npm install -g pnpm >/dev/null 2>&1 || true
have pnpm || fail "pnpm non disponibile: prova 'sudo corepack enable' oppure 'sudo npm i -g pnpm'"
ok "pnpm $(cd "$APP" && pnpm -v)"

have docker || install_mac "Docker Desktop" bash -c 'brew install --cask docker-desktop || brew install --cask docker'
if ! docker info >/dev/null 2>&1; then
  [ "$OS" = "Darwin" ] && open -a Docker
  echo "→ Attendo che Docker sia pronto (alla prima apertura accetta le condizioni e inserisci la password)..."
  for _ in $(seq 1 90); do docker info >/dev/null 2>&1 && break; sleep 2; done
fi
docker info >/dev/null 2>&1 || fail "Docker non risponde: aprilo a mano e rilancia"
docker compose version >/dev/null 2>&1 || fail "Manca il plugin 'docker compose': aggiorna Docker Desktop"
ok "docker $(docker --version | cut -d' ' -f3 | tr -d ,)"

have make || fail "Manca make: su macOS esegui 'xcode-select --install' e rilancia"
ok "make"

# ---------- 2. File .env con segreti casuali (solo se non esiste) ----------
gen_secret() {
  if have openssl; then openssl rand -hex 32
  else node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"; fi
}

if [ -f "$APP/.env" ]; then
  ok "$APP/.env esiste già: non lo tocco"
else
  [ -f "$APP/.env.example" ] || fail "Manca $APP/.env.example"
  while IFS= read -r line || [ -n "$line" ]; do
    case "$line" in
      PAYLOAD_SECRET=*|CRON_SECRET=*|PREVIEW_SECRET=*) echo "${line%%=*}=$(gen_secret)" ;;
      *) echo "$line" ;;
    esac
  done < "$APP/.env.example" > "$APP/.env"
  ok "Creato $APP/.env con segreti nuovi"
fi

# ---------- 3. Dipendenze e database ----------
bash scripts/fx.sh run "Installo le dipendenze" pnpm -C "$APP" install --frozen-lockfile
make --no-print-directory up

echo
echo "Fatto. Ora:  make dev   e apri http://localhost:3000/admin per creare il primo utente."