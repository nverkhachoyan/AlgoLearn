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
	err := godotenv.Load()
	if err != nil {
		log.Fatal("Error loading .env file")
	}

	// Initialize database
	config.InitDB()
	defer config.GetDB().Close()

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
	loggedRouter := middleware.Logger(timeoutMiddleware(r))

	// Start server and log
	log.Println(colors.Purple + "Server is running on port 8080" + colors.Reset)
	log.Fatal(http.ListenAndServe(":8080", loggedRouter))
}
