package config

import (
	"algolearn/pkg/logger"
	"log"
)

func InitLogger(cfg AppConfig) {
	err := logger.Initialize(logger.Config{
		LogLevel:      cfg.LogLevel,
		Environment:   cfg.Environment,
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
