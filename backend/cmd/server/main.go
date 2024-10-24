package main

import (
	"algolearn/internal/config"
	"algolearn/internal/handlers"
	"algolearn/internal/repository"
	"algolearn/internal/router"

	"algolearn/pkg/logger"
	"algolearn/pkg/middleware"

	"log"
	"net/http"
	"os"
	"time"

	"github.com/joho/godotenv"
)

func main() {
	// Loading env variables
	if err := godotenv.Load(); err != nil {
		log.Fatal("error loading .env file")
	}

	port := os.Getenv("PORT")
	if port == "" {
		port = "8080" // Default port if not specified
	}

	databaseURL := os.Getenv("DATABASE_URL")
	if databaseURL == "" {
		log.Fatal("DATABASE_URL is not set")
	}

	// Initialize configs
	config.InitLogger()
	log := logger.Get()
	log.Info("Starting application...")

	config.InitDB()
	config.InitOAuth()
	config.InitS3() // DigitalOcean Spaces
	defer func() {
		if err := config.GetDB().Close(); err != nil {
			log.Printf("error closing database: %v\n", err)
		}
	}()

	// Check for migrations
	if os.Getenv("RUN_MIGRATIONS") == "true" {
		config.RunMigrations()
	}

	if os.Getenv("RUN_DOWN_MIGRATIONS") == "true" {
		config.DownMigration()
	}

	// Get DB
	db := config.GetDB()

	// Initializing repositories
	userRepo := repository.NewUserRepository(db)
	notifRepo := repository.NewNotificationsRepository(db)
	courseRepo := repository.NewCourseRepository(db)
	moduleRepo := repository.NewModuleRepository(db)
	unitRepo := repository.NewUnitRepository(db)

	achievementsRepo := repository.NewAchievementsRepository(db)

	// Initializing handlers
	userHandler := handlers.NewUserHandler(userRepo)
	oauthHandler := handlers.NewOauthHandler(userRepo)
	notifHandler := handlers.NewNotificationsHandler(notifRepo)
	courseHandler := handlers.NewCourseHandler(courseRepo, userRepo)
	unitHandler := handlers.NewUnitHandler(unitRepo, userRepo)
	moduleHandler := handlers.NewModuleHandler(moduleRepo, userRepo)
	achievementsHandler := handlers.NewAchievementsHandler(achievementsRepo)
	adminDashboardHandler := handlers.NewAdminDashboardHandler()
	healthHandler := handlers.NewHealthHandler()

	// Router setup
	r := router.NewRouter(
		userHandler,
		courseHandler,
		unitHandler,
		moduleHandler,
		oauthHandler,
		notifHandler,
		achievementsHandler,
		adminDashboardHandler,
		healthHandler,
	)

	// Timeout middleware
	timeoutMiddleware := middleware.TimeoutMiddleware(time.Second * 10)
	// Logging middleware
	loggedRouter := middleware.LoggingMiddleware(timeoutMiddleware(r))
	// Start server and log
	log.Println("Server is running on port " + port)
	log.Fatal(http.ListenAndServe(":"+port, loggedRouter))
}
