DOCKER_COMPOSE = docker-compose

db:
	@echo "Starting services..."
	$(DOCKER_COMPOSE) up -d db
	
stop:
	@echo "Stopping services..."
	$(DOCKER_COMPOSE) stop

clean:
	@echo "Cleaning up..."
	$(DOCKER_COMPOSE) down -v
	rm -f main

.PHONY: run clean
