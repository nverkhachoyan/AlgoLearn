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

build-admin:
	@echo "Building admin interface..."
	cd web/admin && npm install
	cd web/admin && npm run build
	@echo "Creating public directory..."
	mkdir -p public/admin
	@echo "Copying build files..."
	cp -r web/admin/dist/* public/admin/
	@echo "Copying favicon..."
	cp web/admin/public/favicon.svg public/admin/

.PHONY: run clean
