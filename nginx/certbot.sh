#!/bin/sh
# Container certbot: certificati HTTPS per nginx.
# - All'avvio crea un certificato provvisorio (autofirmato) per ogni host che non ne ha uno,
#   così nginx può partire.
# - Per gli host pubblici chiede a Let's Encrypt quello vero (verifica sulla porta 80 tramite nginx),
#   poi controlla i rinnovi ogni 12 ore. nginx si ricarica da solo quando i file cambiano.
# - Gli host locali (localhost, *.localhost, *.test) restano col provvisorio: il browser chiede un'eccezione.
set -u
LIVE=/etc/letsencrypt/live
WEBROOT=/var/www/certbot
CERTBOT_EMAIL=${CERTBOT_EMAIL:-}

provvisorio() {
  [ -f "$LIVE/$1/fullchain.pem" ] && return 0
  mkdir -p "$LIVE/$1"
  openssl req -x509 -nodes -newkey rsa:2048 -days 365 -subj "/CN=$1" \
    -keyout "$LIVE/$1/privkey.pem" -out "$LIVE/$1/fullchain.pem" 2>/dev/null
  echo "Certificato provvisorio per $1"
}

locale() {
  case "$1" in localhost | *.localhost | *.test) return 0 ;; esac
  return 1
}

richiedi() {
  [ -f "/etc/letsencrypt/renewal/$1.conf" ] && return 0   # già rilasciato: ci pensa "renew"
  locale "$1" && return 0
  if [ -z "$CERTBOT_EMAIL" ]; then
    echo "CERTBOT_EMAIL vuota: $1 resta col certificato provvisorio"
    return 0
  fi
  rm -rf "${LIVE:?}/$1"   # certbot non scrive sopra una cartella che non ha creato lui
  certbot certonly --webroot -w "$WEBROOT" -d "$1" --email "$CERTBOT_EMAIL" \
    --agree-tos --no-eff-email --non-interactive || provvisorio "$1"
}

mkdir -p "$WEBROOT"
for host in "$FRONTEND_HOST" "$BACKEND_HOST"; do provvisorio "$host"; done

sleep 10   # nginx deve essere in ascolto sulla porta 80 per la verifica
while :; do
  for host in "$FRONTEND_HOST" "$BACKEND_HOST"; do richiedi "$host"; done
  certbot renew --webroot -w "$WEBROOT" --quiet
  sleep 12h
done
