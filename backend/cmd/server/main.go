package main

import (
	"algolearn-backend/internal/config"
	"algolearn-backend/internal/handlers"
	"algolearn-backend/internal/repository"
	"algolearn-backend/internal/router"

	"algolearn-backend/pkg/colors"
	"algolearn-backend/pkg/middleware"
	"log"
	"net/http"
	"os"
	"time"

	"github.com/joho/godotenv"
)

func main() {
	// Loading env variables
	if err := godotenv.Load(); err != nil {
		log.Fatal("Error loading .env file")
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
	config.InitDB()
	config.InitOAuth()
	config.InitS3() // DigitalOcean Spaces
	defer func() {
		if err := config.GetDB().Close(); err != nil {
			log.Printf("Error closing database: %v\n", err)
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
	achievementsRepo := repository.NewAchievementsRepository(db)

	// Initializing handlers
	userHandler := handlers.NewUserHandler(userRepo)
	oauthHandler := handlers.NewOauthHandler(userRepo)
	notifHandler := handlers.NewNotificationsHandler(notifRepo)
	courseHandler := handlers.NewCourseHandler(courseRepo, userRepo)
	achievementsHandler := handlers.NewAchievementsHandler(achievementsRepo)
	adminDashboardHandler := handlers.NewAdminDashboardHandler()

	// Router setup
	r := router.SetupRouter(
		userHandler,
		oauthHandler,
		notifHandler,
		courseHandler,
		achievementsHandler,
		adminDashboardHandler,
	)

	// Timeout middleware
	timeoutMiddleware := middleware.TimeoutMiddleware(time.Second * 10)
	// Logging middleware
	loggedRouter := middleware.LoggingMiddleware(timeoutMiddleware(r))
	// Start server and log
	log.Println(colors.Purple + "Server is running on port " + port + " " + colors.Reset)
	log.Fatal(http.ListenAndServe(":"+port, loggedRouter))
}
