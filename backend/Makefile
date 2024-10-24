# Variables
DOCKER_COMPOSE = docker-compose
GO = go
PROJECT_NAME = algolearn-backend
DOCKER_COMPOSE_FILE = docker-compose.yml

# Default target
all: run

# Run Docker Compose and the Go application
build: docker-build
run: docker-up
dev: docker-dev
down: docker-down

# Build docker services
docker-build:
	@echo "Starting Docker Compose services..."
	$(DOCKER_COMPOSE) -f $(DOCKER_COMPOSE_FILE) build

# Bring up Docker Compose services
docker-up:
	@echo "Starting Docker Compose services..."
	$(DOCKER_COMPOSE) -f $(DOCKER_COMPOSE_FILE) up


# Bring up Docker Compose services for development
docker-dev:
	@echo "Starting Docker Compose services..."
	$(DOCKER_COMPOSE) up -d db

# Stop Docker Compose services
docker-down:
	@echo "Stopping Docker Compose services..."
	$(DOCKER_COMPOSE) -f $(DOCKER_COMPOSE_FILE) down

# Clean up Docker resources (excluding volumes)
clean:
	@echo "Cleaning up Docker resources (excluding volumes)..."
	$(DOCKER_COMPOSE) -f $(DOCKER_COMPOSE_FILE) down

# Prune Docker resources, including volumes
prune:
	@echo "Pruning Docker resources and volumes..."
	$(DOCKER_COMPOSE) -f $(DOCKER_COMPOSE_FILE) down --volumes
	@docker system prune -f --volumes
	@echo "All containers, volumes, and unused Docker resources removed."

.PHONY: all run docker-up docker-down clean prune
