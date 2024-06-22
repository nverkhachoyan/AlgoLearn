# Makefile

# Variables
DOCKER_COMPOSE = docker-compose
GO = go
PROJECT_NAME = algolearn-backend
DOCKER_COMPOSE_FILE = docker-compose.yml

# Default target
all: run

# Run Docker Compose and the Go application
run: docker-up run-go

# Bring up Docker Compose services
docker-up:
	@echo "Starting Docker Compose services..."
	$(DOCKER_COMPOSE) -f $(DOCKER_COMPOSE_FILE) up -d

# Run the Go application
run-go:
	@echo "Running Go application..."
	$(GO) run cmd/server/main.go

# Stop Docker Compose services
docker-down:
	@echo "Stopping Docker Compose services..."
	$(DOCKER_COMPOSE) -f $(DOCKER_COMPOSE_FILE) down

# Clean up Docker resources (excluding volumes)
clean:
	@echo "Cleaning up Docker resources (excluding volumes)..."
	$(DOCKER_COMPOSE) -f $(DOCKER_COMPOSE_FILE) down

.PHONY: all run docker-up run-go docker-down clean

