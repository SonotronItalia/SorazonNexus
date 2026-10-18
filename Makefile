SHELL := /bin/bash
.DEFAULT_GOAL := help

FX           := bash scripts/fx.sh
COMPOSE      := docker compose
# Sviluppo: aggiunge la porta 5432 del database sul Mac (vedi docker-compose.dev.yml)
COMPOSE_DEV  := docker compose -f docker-compose.yml -f docker-compose.dev.yml
BACKUP       := backup
DB_VOLUME    := sorazon_pgdata
MEDIA_VOLUME := sorazon_media

.PHONY: help setup doctor db db-wait db-running stop down ps logs dev dev-backend dev-frontend types migrate-create migrate seed \
        stack stack-proxy backup backup-media restore reset-db

help: ## Mostra i comandi disponibili
	@$(FX) banner "comandi disponibili"
	@awk 'BEGIN {FS = ":.*## "} /^[a-zA-Z_-]+:.*## / {printf "  \033[38;5;135m%-16s\033[0m %s\n", $$1, $$2}' $(MAKEFILE_LIST)
	@echo
	@echo "  Senza animazioni: make <comando> EFFECTS=0"

setup: ## Prima installazione: strumenti, .env, dipendenze, database e contenuti di partenza
	@bash scripts/setup.sh

doctor: ## Controlla strumenti, versioni e Docker
	@for t in git node pnpm docker make; do \
	  if command -v $$t >/dev/null 2>&1; then \
	    printf '\033[32m✔\033[0m %-8s %s\n' $$t "$$($$t --version 2>&1 | head -1)"; \
	  else printf '\033[31m✘\033[0m %-8s mancante\n' $$t; fi; \
	done
	@if docker info >/dev/null 2>&1; then printf '\033[32m✔\033[0m Docker è in esecuzione\n'; \
	else printf '\033[31m✘\033[0m Docker non è in esecuzione\n'; fi

db: ## Avvia il database (porta 5432 sul Mac) e Mailpit per le email (http://localhost:8025)
	@$(FX) run "Avvio il database e Mailpit" $(COMPOSE_DEV) up -d db mailpit
	@$(MAKE) --no-print-directory db-wait

# Per backup e ripristino basta che il database sia acceso, in qualsiasi modalità
db-running:
	@$(COMPOSE) ps --status running -q db | grep -q . || $(MAKE) --no-print-directory db

db-wait:
	@$(FX) run "Attendo che il database risponda" bash -c 'for i in $$(seq 1 60); do $(COMPOSE) exec -T db sh -c "pg_isready -h 127.0.0.1 -U \"\$$POSTGRES_USER\"" >/dev/null 2>&1 && (exec 3<>/dev/tcp/127.0.0.1/5432) 2>/dev/null && exit 0; sleep 1; done; exit 1'

stop: ## Ferma i container (i dati restano)
	@$(FX) run "Fermo i container" $(COMPOSE) stop

down: ## Rimuove i container (i volumi con i dati restano)
	@$(FX) run "Rimuovo i container" $(COMPOSE) down

ps: ## Stato dei container
	@$(COMPOSE) ps

logs: ## Log (Ctrl+C per uscire). Esempio: make logs SERVICE=backend
	@$(COMPOSE) logs -f $(SERVICE)

dev: db ## Avvia backend e frontend insieme (database incluso)
	@$(FX) banner "backend + frontend"
	@bash scripts/dev.sh

dev-backend: db ## Backend Payload in sviluppo su http://localhost:3001/admin
	@$(FX) banner "backend (Payload) su :3001"
	@pnpm -C backend dev

dev-frontend: ## Frontend Next.js in sviluppo su http://localhost:3000
	@$(FX) banner "frontend (Next.js) su :3000"
	@pnpm -C frontend dev

types: ## Rigenera i tipi di Payload e li copia nel frontend
	@$(FX) run "Rigenero i tipi di Payload" pnpm -C backend generate:types
	@cp backend/src/payload-types.ts frontend/src/payload-types.ts
	@echo "  Copiati in frontend/src/payload-types.ts"

migrate-create: db ## Crea una migrazione: make migrate-create NAME=iniziale
	@test -n "$(NAME)" || (echo "Uso: make migrate-create NAME=iniziale"; exit 1)
	@pnpm -C backend payload migrate:create $(NAME)

migrate: db ## Applica le migrazioni non ancora eseguite
	@pnpm -C backend payload migrate

seed: migrate ## Contenuti di partenza (admin, Home, Centri, Dispositivo, centri). Ripetibile, non cancella
	@pnpm -C backend payload run src/seed/index.ts

stack: ## Costruisce e avvia i tre container (db, backend, frontend)
	@$(FX) run "Costruisco e avvio i tre container" $(COMPOSE) up -d --build

stack-proxy: ## Come stack, più il proxy Caddy (simula la produzione)
	@$(FX) run "Costruisco e avvio i container con il proxy" $(COMPOSE) --profile proxy up -d --build

backup: db-running ## Salva il database in backup/
	@mkdir -p $(BACKUP)
	@$(FX) run "Salvo il backup del database" bash -c '$(COMPOSE) exec -T db sh -c "pg_dump --clean --if-exists --no-owner -U \"\$$POSTGRES_USER\" \"\$$POSTGRES_DB\"" > $(BACKUP)/sorazon-$$(date +%F-%H%M%S).sql'
	@echo "  File: $(BACKUP)/$$(ls -t $(BACKUP) | head -1)"

backup-media: ## Salva i file caricati dal CMS (volume media) in backup/
	@mkdir -p $(BACKUP)
	@$(FX) run "Salvo i file caricati" docker run --rm -v $(MEDIA_VOLUME):/data:ro -v "$(CURDIR)/$(BACKUP)":/b alpine sh -c 'tar czf /b/media-$$(date +%F-%H%M%S).tgz -C /data .'

restore: db-running ## Ripristina un backup: make restore FILE=backup/xxx.sql
	@test -n "$(FILE)" || (echo "Indica il file: make restore FILE=backup/xxx.sql"; exit 1)
	@$(FX) confirm "Il database attuale verrà sovrascritto. Scrivi 'ripristina' per continuare:" ripristina
	@$(FX) run "Ripristino $(FILE)" bash -c '$(COMPOSE) exec -T db sh -c "psql -U \"\$$POSTGRES_USER\" -d \"\$$POSTGRES_DB\"" < $(FILE)'

reset-db: ## ⚠ Cancella SOLO il database (backup + conferma). I file media restano
	@$(FX) confirm "ATTENZIONE: cancella tutti i dati del database. Scrivi 'cancella' per continuare:" cancella
	@$(MAKE) --no-print-directory backup
	@$(FX) run "Elimino il database e il suo volume" bash -c '$(COMPOSE) rm -sf db && docker volume rm $(DB_VOLUME)'
	@$(MAKE) --no-print-directory db
	@echo "  Database vuoto: avvia 'make dev-backend' per ricreare le tabelle."
