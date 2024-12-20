package main

import (
	"algolearn/internal/config"
	"algolearn/internal/handlers"
	"algolearn/internal/service"
	"algolearn/internal/router"
	"algolearn/pkg/logger"
	"algolearn/pkg/middleware"
	"context"
	"database/sql"
	fallbackLog "log"
	"net/http"
	"os"
	"os/signal"
	"syscall"
	"time"

	"github.com/gin-contrib/cors"
	"github.com/gin-gonic/gin"
)

func setupRouter(cfg *config.Config, db *sql.DB) *gin.Engine {
	// Set Gin mode
	if cfg.App.Environment == "production" {
		gin.SetMode(gin.ReleaseMode)
	}

	// Initialize router with default middleware
	r := gin.New()

	// Recovery middleware
	r.Use(gin.Recovery())

	// CORS middleware
	corsConfig := cors.DefaultConfig()
	corsConfig.AllowOrigins = []string{"*"} // Configure based on your needs
	corsConfig.AllowMethods = []string{"GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"}
	corsConfig.AllowHeaders = []string{"Origin", "Content-Type", "Accept", "Authorization"}
	r.Use(cors.New(corsConfig))

	// Custom middleware
	r.Use(middleware.Logger())
	r.Use(middleware.Timeout(10 * time.Second))

	// Initialize repositories
	userRepo := service.NewUserService(db)
	notifRepo := service.NewNotificationsService(db)
	courseRepo := service.NewCourseService(db)
	moduleRepo := service.NewModuleService(db)
	achievementsRepo := service.NewAchievementsService(db)

	// Initialize handlers
	userHandler := handlers.NewUserHandler(userRepo)
	oauthHandler := handlers.NewOauthHandler(userRepo)
	notifHandler := handlers.NewNotificationsHandler(notifRepo)
	courseHandler := handlers.NewCourseHandler(courseRepo, userRepo)
	moduleHandler := handlers.NewModuleHandler(moduleRepo, userRepo)
	achievementsHandler := handlers.NewAchievementsHandler(achievementsRepo)
	adminDashboardHandler := handlers.NewAdminDashboardHandler()

	// Register routes
	router.RegisterRoutes(r,
		userHandler,
		courseHandler,
		moduleHandler,
		oauthHandler,
		notifHandler,
		achievementsHandler,
		adminDashboardHandler,
	)

	return r
}

func main() {
	log := logger.Get().WithBaseFields(logger.Main, "main")
	log.Info("Starting application...")

	// Load configuration
	cfg, err := config.LoadConfig()
	if err != nil {
		fallbackLog.Fatalf("failed to load configuration: %v", err)
	}

	// Initialize components
	config.InitLogger(cfg.App)
	config.InitDB(cfg.Database)
	config.InitOAuth(cfg.Auth.OAuth)
	config.InitS3(cfg.Storage)
	defer func() {
		if err := config.GetDB().Close(); err != nil {
			log.Printf("error closing database: %v\n", err)
		}
	}()

	if err := config.ApplyMigrations(); err != nil {
		log.Fatalf("Failed to apply migrations: %v", err)
	}

	// Setup router
	r := setupRouter(cfg, config.GetDB())

	// Create server with timeouts
	srv := &http.Server{
		Addr:         cfg.App.GetAddress(),
		Handler:      r,
		ReadTimeout:  15 * time.Second,
		WriteTimeout: 15 * time.Second,
		IdleTimeout:  60 * time.Second,
	}

	// Graceful shutdown setup
	go func() {
		log.Infof("Server is running on port %d", cfg.App.Port)
		if err := srv.ListenAndServe(); err != nil && err != http.ErrServerClosed {
			log.Fatalf("Failed to start server: %v", err)
		}
	}()

	// Wait for interrupt signal
	quit := make(chan os.Signal, 1)
	signal.Notify(quit, syscall.SIGINT, syscall.SIGTERM)
	<-quit
	log.Info("Shutting down server...")

	// Graceful shutdown
	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()

	if err := srv.Shutdown(ctx); err != nil {
		log.Fatalf("Server forced to shutdown: %v", err)
	}

	log.Info("Server exiting")
}
