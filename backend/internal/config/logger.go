package config

import (
	"os"

	"algolearn/pkg/logger"
	"log"
)

func InitLogger() {
	logLevel := os.Getenv("LOG_LEVEL")
	environment := os.Getenv("ENVIRONMENT")
	err := logger.Initialize(logger.Config{
		LogLevel:      logLevel,
		Environment:   environment,
		LogToFile:     true,
		LogFilePath:   "logs/app.log",
		LogToConsole:  true,
		ReportCaller:  true,
		JSONFormatter: true,
	})
	if err != nil {
		log.Fatalf("failed to initialize logger: %v", err)
	}
}
