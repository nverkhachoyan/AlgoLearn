package main

import (
	"errors"
	"flag"
	"fmt"
	"log"
	"os"
	"strconv"

	"github.com/golang-migrate/migrate/v4"
	_ "github.com/golang-migrate/migrate/v4/database/postgres"
	_ "github.com/golang-migrate/migrate/v4/source/file"
	"github.com/joho/godotenv"
)

type Config struct {
	DBUser     string
	DBPassword string
	DBHost     string
	DBPort     string
	DBName     string
	MigrateDir string
}

func loadConfig() (*Config, error) {
	if err := godotenv.Load(); err != nil {
		return nil, fmt.Errorf("error loading .env file: %w", err)
	}

	return &Config{
		DBUser:     os.Getenv("DB_USER"),
		DBPassword: os.Getenv("DB_PASSWORD"),
		DBHost:     os.Getenv("DB_HOST"),
		DBPort:     os.Getenv("DB_PORT"),
		DBName:     os.Getenv("DB_NAME"),
		MigrateDir: os.Getenv("MIGRATE_DIR"),
	}, nil
}

func getDSN(config *Config) string {
	return fmt.Sprintf("postgres://%s:%s@%s:%s/%s?sslmode=disable",
		config.DBUser,
		config.DBPassword,
		config.DBHost,
		config.DBPort,
		config.DBName,
	)
}

func newMigrate(config *Config) (*migrate.Migrate, error) {
	migrateDir := config.MigrateDir
	if migrateDir == "" {
		migrateDir = "file://migrations"
	}

	m, err := migrate.New(migrateDir, getDSN(config))
	if err != nil {
		return nil, fmt.Errorf("failed to create migrate instance: %w", err)
	}

	return m, nil
}

func handleMigrateError(err error) error {
	if err == nil || errors.Is(err, migrate.ErrNoChange) {
		return nil
	}
	return err
}

type command struct {
	Name        string
	Description string
	Execute     func(*migrate.Migrate, ...string) error
}

func main() {
	config, err := loadConfig()
	if err != nil {
		log.Fatalf("Failed to load config: %v", err)
	}

	m, err := newMigrate(config)
	if err != nil {
		log.Fatal(err)
	}
	defer m.Close()

	commands := map[string]command{
		"up": {
			Name:        "up",
			Description: "Apply all or N up migrations",
			Execute: func(m *migrate.Migrate, args ...string) error {
				if len(args) > 0 {
					n, err := strconv.ParseUint(args[0], 10, 64)
					if err != nil {
						return fmt.Errorf("invalid number of steps: %w", err)
					}
					return handleMigrateError(m.Steps(int(n)))
				}
				return handleMigrateError(m.Up())
			},
		},
		"down": {
			Name:        "down",
			Description: "Apply all or N down migrations",
			Execute: func(m *migrate.Migrate, args ...string) error {
				if len(args) > 0 {
					n, err := strconv.ParseUint(args[0], 10, 64)
					if err != nil {
						return fmt.Errorf("invalid number of steps: %w", err)
					}
					return handleMigrateError(m.Steps(-int(n)))
				}
				return handleMigrateError(m.Down())
			},
		},
		"force": {
			Name:        "force",
			Description: "Force set version V",
			Execute: func(m *migrate.Migrate, args ...string) error {
				if len(args) == 0 {
					return errors.New("version is required")
				}
				v, err := strconv.ParseInt(args[0], 10, 64)
				if err != nil {
					return fmt.Errorf("invalid version: %w", err)
				}
				return handleMigrateError(m.Force(int(v)))
			},
		},
		"version": {
			Name:        "version",
			Description: "Show current migration version",
			Execute: func(m *migrate.Migrate, args ...string) error {
				version, dirty, err := m.Version()
				if err != nil {
					return err
				}
				fmt.Printf("Version: %d, Dirty: %v\n", version, dirty)
				return nil
			},
		},
	}

	flag.Usage = func() {
		fmt.Println("Usage: migrate [command] [args]")
		fmt.Println("\nCommands:")
		for _, cmd := range commands {
			fmt.Printf("  %s: %s\n", cmd.Name, cmd.Description)
		}
	}

	flag.Parse()

	if flag.NArg() < 1 {
		flag.Usage()
		os.Exit(1)
	}

	command, exists := commands[flag.Arg(0)]
	if !exists {
		log.Printf("Unknown command: %s\n", flag.Arg(0))
		flag.Usage()
		os.Exit(1)
	}

	if err := command.Execute(m, flag.Args()[1:]...); err != nil {
		log.Fatalf("Error executing %s: %v", command.Name, err)
	}

	log.Printf("Successfully executed %s command", command.Name)
}
