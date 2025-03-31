DOCKER_COMPOSE = docker-compose

db: stop-all
	@echo "Starting services..."
	$(DOCKER_COMPOSE) up -d db
	
stop:
	@echo "Stopping services..."
	$(DOCKER_COMPOSE) stop

stop-all:
	@echo "Stopping all Docker containers..."
	-docker stop $$(docker ps -q) 2>/dev/null || true
	@echo "All containers stopped."

clean:
	@echo "Cleaning up..."
	$(DOCKER_COMPOSE) down -v
	rm -f main

.PHONY: run clean db stop stop-all