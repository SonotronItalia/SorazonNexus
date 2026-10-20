#!/usr/bin/env bash
# Test di integrazione del backend su un database USA E GETTA: un PostGIS temporaneo con i dati
# in memoria (tmpfs), sulla porta 55433, cancellato alla fine. Il database di sviluppo non si tocca.
set -euo pipefail
cd "$(dirname "$0")/.."

NOME=sorazon-test-db
PORTA=${TEST_DB_PORT:-55433}
URL="postgres://test:test@127.0.0.1:${PORTA}/test"

pulisci() { docker rm -f "$NOME" >/dev/null 2>&1 || true; }
trap pulisci EXIT
pulisci

echo "Avvio un database di prova temporaneo (porta $PORTA)..."
docker run -d --name "$NOME" \
  -e POSTGRES_USER=test -e POSTGRES_PASSWORD=test -e POSTGRES_DB=test \
  -p "127.0.0.1:${PORTA}:5432" --tmpfs /var/lib/postgresql/data \
  postgis/postgis:16-3.4 >/dev/null

# Al primo avvio l'immagine di Postgres inizializza i dati con un server temporaneo, poi si
# riavvia: è pronto davvero quando "ready to accept connections" compare per la seconda volta
for _ in $(seq 1 120); do
  [ "$(docker logs "$NOME" 2>&1 | grep -c 'ready to accept connections')" -ge 2 ] && break
  sleep 1
done
docker exec "$NOME" pg_isready -h 127.0.0.1 -U test -d test >/dev/null

echo "Applico le migrazioni sul database di prova..."
(cd backend && env DATABASE_URL="$URL" PAYLOAD_SECRET=test-integrazione-0123456789abcdef0123456789 \
  pnpm -s payload migrate)

echo "Test di integrazione..."
(cd backend && env TEST_DATABASE_URL="$URL" pnpm -s test:int)
