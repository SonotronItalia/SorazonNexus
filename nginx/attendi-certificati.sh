#!/bin/sh
# Eseguito dall'immagine nginx prima dell'avvio (/docker-entrypoint.d/).
# 1. Aspetta i certificati preparati dal container certbot (senza, nginx non parte).
# 2. In sottofondo ricarica nginx quando i certificati cambiano (primo rilascio e rinnovi).
set -eu
LIVE=/etc/letsencrypt/live

pronti() { [ -f "$LIVE/$FRONTEND_HOST/fullchain.pem" ] && [ -f "$LIVE/$BACKEND_HOST/fullchain.pem" ]; }
impronta() { cat "$LIVE/$FRONTEND_HOST"/*.pem "$LIVE/$BACKEND_HOST"/*.pem 2>/dev/null | md5sum; }

for i in $(seq 1 60); do
  pronti && break
  [ "$i" = 60 ] && { echo "Certificati assenti in $LIVE: controlla il container certbot" >&2; exit 1; }
  sleep 1
done

# Se i file mancano (certbot li sta sostituendo) o la ricarica fallisce, si riprova al giro dopo:
# nel frattempo nginx continua con i certificati già caricati.
(
  prima=$(impronta)
  while sleep 60; do
    ora=$(impronta)
    [ "$ora" = "$prima" ] && continue
    pronti || continue
    echo "Certificati cambiati: ricarico nginx"
    nginx -s reload && prima=$ora
  done
) &
