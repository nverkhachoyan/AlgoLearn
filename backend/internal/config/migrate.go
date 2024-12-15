package config

import (
	"algolearn/pkg/logger"
	"context"
	"errors"
	"fmt"
	"os"

	"github.com/golang-migrate/migrate/v4"
	_ "github.com/golang-migrate/migrate/v4/database/postgres"
	_ "github.com/golang-migrate/migrate/v4/source/file"
)

const migrationsPath = "file://backend/migrations"

type Migrator struct {
	migrate *migrate.Migrate
}

func NewMigrator() (*Migrator, error) {
	dbURL := fmt.Sprintf("postgres://%s:%s@%s:%s/%s?sslmode=disable",
		os.Getenv("DB_USER"),
		os.Getenv("DB_PASSWORD"),
		os.Getenv("DB_HOST"),
		os.Getenv("DB_PORT"),
		os.Getenv("DB_NAME"),
	)

	m, err := migrate.New(migrationsPath, dbURL)
	if err != nil {
		return nil, fmt.Errorf("failed to create migrator: %w", err)
	}

	return &Migrator{migrate: m}, nil
}

func (m *Migrator) Up(ctx context.Context) error {
	log := logger.Get()

	if err := m.migrate.Up(); err != nil {
		if errors.Is(err, migrate.ErrNoChange) {
			log.Info("No migrations to apply")
			return nil
		}
		return fmt.Errorf("failed to run migrations: %w", err)
	}

	log.Info("Migrations applied successfully")
	return nil
}

func (m *Migrator) Down(ctx context.Context) error {
	log := logger.Get()

	if err := m.migrate.Down(); err != nil {
		if errors.Is(err, migrate.ErrNoChange) {
			log.Info("No migrations to revert")
			return nil
		}
		return fmt.Errorf("failed to revert migrations: %w", err)
	}

	log.Info("Migrations reverted successfully")
	return nil
}

// ApplyMigrations handles migration based on environment variables
func ApplyMigrations() error {
	log := logger.Get()

	migrator, err := NewMigrator()
	if err != nil {
		return fmt.Errorf("failed to create migrator: %w", err)
	}
	defer func() {
		srcErr, dbErr := migrator.migrate.Close()
		if srcErr != nil {
			log.Errorf("Error closing source: %v", srcErr)
		}
		if dbErr != nil {
			log.Errorf("Error closing database: %v", dbErr)
		}
	}()

	ctx := context.Background()

	if os.Getenv("RUN_MIGRATIONS") == "true" {
		return migrator.Up(ctx)
	} else if os.Getenv("RUN_DOWN_MIGRATIONS") == "true" {
		return migrator.Down(ctx)
	}

	return nil
}
