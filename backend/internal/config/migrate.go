package config

import (
	"algolearn/pkg/logger"
	"context"
	"database/sql"
	"fmt"
	"os"
	"path/filepath"
	"strconv"

	_ "github.com/lib/pq"
	"github.com/pressly/goose/v3"
)

type Migrator struct {
	db            *sql.DB
	migrationsDir string
	cfg           *DatabaseConfig
}

func NewMigrator(cfg *DatabaseConfig) (*Migrator, error) {
	workDir, err := os.Getwd()
	if err != nil {
		return nil, fmt.Errorf("failed to get working directory: %w", err)
	}

	dbURL := fmt.Sprintf("postgresql://%s:%s@%s:%s/%s?sslmode=%s",
		cfg.User,
		cfg.Password,
		cfg.Host,
		strconv.Itoa(cfg.Port),
		cfg.Name,
		cfg.SSLMode,
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
		migrationsDir: filepath.Join(workDir, cfg.MigrationsDir),
		cfg:           cfg,
	}, nil
}

func (m *Migrator) Up(ctx context.Context) error {
	log := logger.Get()

	if err := goose.Up(m.db, m.migrationsDir); err != nil {
		log.Errorf("failed to run migrations: %v", err)
		return fmt.Errorf("failed to run migrations: %w", err)
	}

	return nil
}

func (m *Migrator) Close() error {
	return m.db.Close()
}

func (m *Migrator) ApplyMigrations() error {
	log := logger.Get()

	defer func() {
		if err := m.Close(); err != nil {
			log.Errorf("Error closing database migrator: %v", err)
		}
	}()

	ctx := context.Background()

	if m.cfg.RunMigrations == "true" {
		return m.Up(ctx)
	}

	return nil
}
