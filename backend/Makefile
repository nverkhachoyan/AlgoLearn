# Variables
DOCKER_COMPOSE = docker-compose
GO = go
PROJECT_NAME = algolearn-backend
DOCKER_COMPOSE_FILE = docker-compose.yml

# Default target
all: dev

db: run-db

# Development setup
dev: start-services run-backend

# Start docker services
start-services:
	@echo "Starting Docker services..."
	$(DOCKER_COMPOSE) -f $(DOCKER_COMPOSE_FILE) up -d

run-db:
	@echo "Starting Docker services..."
	$(DOCKER_COMPOSE) -f $(DOCKER_COMPOSE_FILE) up -d db

# Run backend locally
run-backend:
	@echo "Starting backend server..."
	CompileDaemon -build="go build -o main cmd/server/main.go" -command="./main"

# Stop services
stop:
	@echo "Stopping Docker services..."
	$(DOCKER_COMPOSE) -f $(DOCKER_COMPOSE_FILE) down

# Build the backend
build:
	@echo "Building backend..."
	$(GO) build -o main cmd/server/main.go

# Clean up
clean:
	@echo "Cleaning up..."
	$(DOCKER_COMPOSE) -f $(DOCKER_COMPOSE_FILE) down
	rm -f main

# Run migrations
migrate-up:
	go run cmd/cli/migrate.go up

migrate-down:
	go run cmd/cli/migrate.go down

.PHONY: all dev start-services run-backend stop build clean migrate-up migrate-down
