COMPOSE_FILE := docker-compose.dev.yml
COMPOSE := docker compose -f $(COMPOSE_FILE)

.PHONY: back front start down logs ps restart db reset-db reset-db-dev reset-db-prod clean-legacy reset-dev

# Gerar certificado autoassinado para HTTPS
CERT_FILE= ./Backend/certs/keystore-dev.p12

cert:
	@if [ ! -f $(CERT_FILE) ]; then \
		echo ">> Gerando keystore..."; \
		KEYSTORE_PASSWORD=changeit ./Backend/certs/generate-keystore.sh dev; \
	else \
		echo ">> Keystore já existe"; \
	fi

# Build apenas a imagem do backend.
back:
	$(COMPOSE) build backend

# Build apenas a imagem do frontend.
front:
	$(COMPOSE) build frontend

# Builda e sobe a stack de desenvolvimento completa: banco, backend e frontend.
start: cert
	$(COMPOSE) up --build -d

# Para subir os container após o build
up: cert
	$(COMPOSE) up -d

# Para e remove os containers da stack de desenvolvimento.
down:
	$(COMPOSE) down

# Para derrubar e remover volumes da stack de desenvolvimento (reset do DB dev).
reset-db-dev:
	$(COMPOSE) down -v --remove-orphans

# Acompanha os logs de todos os servicos da stack.
logs:
	$(COMPOSE) logs -f

# Mostra o status atual dos servicos de desenvolvimento.
ps:
	$(COMPOSE) ps

# Reinicia a stack de desenvolvimento inteira.
restart: down start

# Sobe apenas o servico de banco MySQL.
db:
	$(COMPOSE) up -d mysql

prune:
	docker system prune -a --volumes -f

# Remove legacy containers left by previous compose projects that used
# fixed container names (e.g. "transcendence-*" or older stacks). This
# helps avoid port/name conflicts when bringing the dev stack up.
clean-legacy:
	@command -v docker >/dev/null 2>&1 || { echo "docker not found, skipping legacy cleanup"; exit 0; }
	@echo "Stopping/removing legacy containers (transcendence-*, final_trans-*)..."
	@containers=$$(docker ps -a --filter "name=transcendence-" --filter "name=final_trans-" --format "{{.Names}}") ; \
	if [ -n "$$containers" ]; then \
	  for c in $$containers; do docker rm -f $$c || true; done ; \
	  echo "Removed:"; echo "$$containers"; \
	else \
	  echo "No legacy containers found"; \
	fi


# Reset dev environment: remove legacy containers then start the stack
reset-dev: clean-legacy
	@echo "Starting development stack (reset)...";
	$(MAKE) start