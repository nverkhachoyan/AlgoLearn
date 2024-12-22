package config

import (
	"algolearn/pkg/logger"
	"context"
	"database/sql"
	"fmt"
	"os"
	"path/filepath"

	_ "github.com/lib/pq" // Import postgres driver
	"github.com/pressly/goose/v3"
)

type Migrator struct {
	db            *sql.DB
	migrationsDir string
}

func NewMigrator() (*Migrator, error) {
	workDir, err := os.Getwd()
	if err != nil {
		return nil, fmt.Errorf("failed to get working directory: %w", err)
	}

	dbURL := fmt.Sprintf("postgresql://%s:%s@%s:%s/%s?sslmode=disable",
		os.Getenv("DB_USER"),
		os.Getenv("DB_PASSWORD"),
		os.Getenv("DB_HOST"),
		os.Getenv("DB_PORT"),
		os.Getenv("DB_NAME"),
	)

	db, err := sql.Open("postgres", dbURL)
	if err != nil {
		return nil, fmt.Errorf("failed to connect to database: %w", err)
	}

	if err := goose.SetDialect("postgres"); err != nil {
		return nil, fmt.Errorf("failed to set dialect: %w", err)
	}

	return &Migrator{
		db:            db,
		migrationsDir: filepath.Join(workDir, "migrations"),
	}, nil
}

func (m *Migrator) Up(ctx context.Context) error {
	log := logger.Get()

	if err := goose.Up(m.db, m.migrationsDir); err != nil {
		return fmt.Errorf("failed to run migrations: %w", err)
	}

	log.Info("Migrations applied successfully")
	return nil
}

func (m *Migrator) Down(ctx context.Context) error {
	log := logger.Get()

	if err := goose.Down(m.db, m.migrationsDir); err != nil {
		return fmt.Errorf("failed to revert migrations: %w", err)
	}

	log.Info("Migrations reverted successfully")
	return nil
}

func (m *Migrator) Close() error {
	return m.db.Close()
}

// ApplyMigrations handles migration based on environment variables
func ApplyMigrations() error {
	log := logger.Get()

	migrator, err := NewMigrator()
	if err != nil {
		return fmt.Errorf("failed to create migrator: %w", err)
	}
	defer func() {
		if err := migrator.Close(); err != nil {
			log.Errorf("Error closing database: %v", err)
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
