COMPOSE_FILE := docker-compose.dev.yml
COMPOSE := docker compose -f $(COMPOSE_FILE)

.PHONY: back front start down logs ps restart db

# Build apenas a imagem do backend.
back:
	$(COMPOSE) build backend

# Build apenas a imagem do frontend.
front:
	$(COMPOSE) build frontend

# Builda e sobe a stack de desenvolvimento completa: banco, backend e frontend.
start:
	$(COMPOSE) up --build -d

# Para e remove os containers da stack de desenvolvimento.
down:
	$(COMPOSE) down

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