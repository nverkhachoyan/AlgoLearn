package config

import (
	"algolearn/pkg/logger"
	"errors"
	"fmt"
	"os"

	"github.com/golang-migrate/migrate/v4"
	_ "github.com/golang-migrate/migrate/v4/database/postgres"
	_ "github.com/golang-migrate/migrate/v4/source/file"
)

func RunMigrations() {
	log := logger.Get()
	dbURL := fmt.Sprintf("postgres://%s:%s@%s:%s/%s?sslmode=disable",
		os.Getenv("DB_USER"),
		os.Getenv("DB_PASSWORD"),
		os.Getenv("DB_HOST"),
		os.Getenv("DB_PORT"),
		os.Getenv("DB_NAME"),
	)

	m, err := migrate.New(
		"file://migrations",
		dbURL)
	if err != nil {
		log.Fatalf("Failed to create migrate instance: %v\n", err)
	}

	if err := m.Up(); err != nil && !errors.Is(err, migrate.ErrNoChange) {
		log.Fatalf("Failed to run migrate up: %v\n", err)
	}

	log.Println("Migrations applied successfully!")
}

func DownMigration() {
	log := logger.Get()
	dbURL := fmt.Sprintf("postgres://%s:%s@%s:%s/%s?sslmode=disable",
		os.Getenv("DB_USER"),
		os.Getenv("DB_PASSWORD"),
		os.Getenv("DB_HOST"),
		os.Getenv("DB_PORT"),
		os.Getenv("DB_NAME"),
	)

	m, err := migrate.New(
		"file://migrations",
		dbURL)
	if err != nil {
		log.Fatalf("Failed to create migrate instance: %v\n", err)
	}

	if err := m.Down(); err != nil && !errors.Is(err, migrate.ErrNoChange) {
		log.Fatalf("Failed to run migrate down: %v\n", err)
	}

	log.Println("Down migration applied successfully!")
}

func ApplyMigrations() {
	if os.Getenv("RUN_MIGRATIONS") == "true" {
		RunMigrations()
	} else if os.Getenv("RUN_DOWN_MIGRATIONS") == "true" {
		DownMigration()
	}
}
