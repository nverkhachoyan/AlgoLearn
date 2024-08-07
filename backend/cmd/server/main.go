package main

import (
	"algolearn-backend/internal/config"
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
	config.InitS3()
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

	// Router setup
	r := router.SetupRouter()

	// Wrapping router with timeout middleware
	timeoutMiddleware := middleware.TimeoutMiddleware(time.Second * 10)

	// Wrapping router with logging middleware
	loggedRouter := middleware.LoggingMiddleware(timeoutMiddleware(r))

	// Start server and log
	log.Println(colors.Purple + "Server is running on port " + port + " " + colors.Reset)
	log.Fatal(http.ListenAndServe(":"+port, loggedRouter))
}
