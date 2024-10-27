package main

import (
	"algolearn/internal/config"
	"algolearn/internal/handlers"
	"algolearn/internal/repository"
	"algolearn/internal/router"
	"fmt"

	"algolearn/pkg/logger"
	"algolearn/pkg/middleware"
	"net/http"
	"time"
	fallbackLog "log"
)

func main() {
	log := logger.Get().WithBaseFields(logger.Main, "main")
	log.Info("Starting application...")

	cfg, err := config.LoadConfig()
	if err != nil {
		fallbackLog.Fatalf("failed to load configuration: %v", err)
	}


	config.InitLogger(cfg.App)
	config.InitDB(cfg.Database)
	config.InitOAuth(cfg.Auth.OAuth)
	config.InitS3(cfg.Storage)
	defer func() {
		if err := config.GetDB().Close(); err != nil {
			log.Printf("error closing database: %v\n", err)
		}
	}()
	config.ApplyMigrations()

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
	log.Infof("Server is running on port %d", cfg.App.Port)
	log.Fatal(http.ListenAndServe(fmt.Sprintf(":%d", cfg.App.Port), loggedRouter))
}
