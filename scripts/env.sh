#!/usr/bin/env bash
# Crea .env (radice), backend/.env e frontend/.env dai modelli, con gli stessi segreti.
# Non sovrascrive i file che esistono già.
set -euo pipefail
cd "$(dirname "$0")/.."

gen() {
  if command -v openssl >/dev/null 2>&1; then openssl rand -hex 32
  else node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"; fi
}

# Se la radice ha già i segreti, li riuso: così i tre file restano coerenti
if [ -f .env ] && grep -q '^PAYLOAD_SECRET=' .env; then
  PS="$(grep '^PAYLOAD_SECRET=' .env | cut -d= -f2-)"
  RS="$(grep '^REVALIDATE_SECRET=' .env | cut -d= -f2-)"
else
  PS="$(gen)"; RS="$(gen)"
fi

make_env() {
  local target="$1" example="$2"
  if [ -f "$target" ]; then echo "• $target esiste già: non lo tocco"; return 0; fi
  [ -f "$example" ] || { echo "Manca $example" >&2; exit 1; }
  while IFS= read -r line || [ -n "$line" ]; do
    case "$line" in
      PAYLOAD_SECRET=*)    echo "PAYLOAD_SECRET=$PS" ;;
      REVALIDATE_SECRET=*) echo "REVALIDATE_SECRET=$RS" ;;
      *) echo "$line" ;;
    esac
  done < "$example" > "$target"
  echo "✔ Creato $target"
}

make_env .env .env.example
make_env backend/.env backend/.env.example
make_env frontend/.env frontend/.env.example
