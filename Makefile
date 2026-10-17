SHELL := /bin/bash
.DEFAULT_GOAL := help

APP        := vetrina
DB_USER    := sorazon
DB_NAME    := sorazon
BACKUP_DIR := backup
FX         := bash scripts/fx.sh
# Il nome del progetto Compose fissa il nome del volume (vetrina_pgdata):
# non cambiarlo, altrimenti Docker crea un database nuovo e vuoto
COMPOSE    := docker compose -p vetrina -f $(APP)/docker-compose.yml

.PHONY: help doctor up wait-db stop down ps logs dev build start types lint check \
        db-shell backup restore reset-db setup

help: ## Mostra i comandi disponibili
	@$(FX) banner "comandi disponibili"
	@awk 'BEGIN {FS = ":.*## "} /^[a-zA-Z_-]+:.*## / {printf "  \033[38;5;135m%-10s\033[0m %s\n", $$1, $$2}' $(MAKEFILE_LIST)
	@echo
	@echo "  Senza animazioni: make <comando> EFFECTS=0"

doctor: ## Controlla che gli strumenti siano installati
	@for t in node pnpm git docker make; do \
	  if command -v $$t >/dev/null 2>&1; then printf '\033[32m✔\033[0m %s\n' $$t; \
	  else printf '\033[31m✘\033[0m %s mancante\n' $$t; fi; \
	done

up: ## Avvia il database (i dati restano)
	@$(FX) run "Avvio il database" $(COMPOSE) up -d
	@$(MAKE) --no-print-directory wait-db

wait-db:
	@$(FX) run "Attendo che il database risponda" bash -c 'for i in $$(seq 1 30); do $(COMPOSE) exec -T db pg_isready -U $(DB_USER) >/dev/null 2>&1 && exit 0; sleep 1; done; exit 1'

stop: ## Ferma il database (i dati restano)
	@$(FX) run "Fermo il database" $(COMPOSE) stop

down: ## Rimuove i container (i dati restano, nessun -v)
	@$(FX) run "Rimuovo i container" $(COMPOSE) down

ps: ## Stato dei container
	@$(COMPOSE) ps

logs: ## Log del database (Ctrl+C per uscire)
	@$(COMPOSE) logs -f db

dev: up ## Avvia database e server di sviluppo
	@$(FX) banner "server di sviluppo"
	@pnpm -C $(APP) dev

types: ## Rigenera i tipi di Payload
	@$(FX) run "Rigenero i tipi di Payload" pnpm -C $(APP) generate:types

lint: ## Controlla il codice
	@$(FX) run "Controllo il codice" pnpm -C $(APP) lint

build: up ## Compila il sito per la produzione
	@$(FX) run "Compilo il sito" pnpm -C $(APP) build

start: ## Avvia il sito compilato (dopo make build)
	@$(FX) banner "sito in produzione (locale)"
	@pnpm -C $(APP) start

check: lint build ## Come farebbe la CI: lint + build

db-shell: up ## Apre psql sul database
	@$(COMPOSE) exec db psql -P pager=off -U $(DB_USER) -d $(DB_NAME)

backup: ## Salva il database in backup/
	@mkdir -p $(BACKUP_DIR)
	@$(FX) run "Salvo il backup del database" bash -c '$(COMPOSE) exec -T db pg_dump --clean --if-exists --no-owner -U $(DB_USER) $(DB_NAME) > $(BACKUP_DIR)/sorazon-$$(date +%F-%H%M%S).sql'
	@echo "  File: $(BACKUP_DIR)/$$(ls -t $(BACKUP_DIR) | head -1)"

restore: up ## Ripristina un backup: make restore FILE=backup/xxx.sql
	@test -n "$(FILE)" || (echo "Indica il file: make restore FILE=backup/xxx.sql"; exit 1)
	@$(FX) confirm "Il database attuale verrà sovrascritto. Scrivi 'ripristina' per continuare:" ripristina
	@$(FX) run "Ripristino $(FILE)" bash -c '$(COMPOSE) exec -T db psql -U $(DB_USER) -d $(DB_NAME) < $(FILE)'

reset-db: ## ⚠ Cancella TUTTI i dati locali (backup + conferma)
	@$(FX) confirm "ATTENZIONE: cancella tutti i dati del database locale. Scrivi 'cancella' per continuare:" cancella
	@$(MAKE) --no-print-directory backup
	@$(FX) run "Elimino container e volume" $(COMPOSE) down -v
	@$(MAKE) --no-print-directory up
	@echo "  Database vuoto: avvia 'make dev' per ricreare le tabelle."

setup: ## Prepara il progetto su un computer nuovo
	@bash scripts/setup.sh