package main

import (
	"database/sql"
	"flag"
	"fmt"
	"log"
	"os"
	"path/filepath"
	"strconv"

	"github.com/joho/godotenv"
	_ "github.com/lib/pq"
	"github.com/pressly/goose/v3"
)

func main() {
	if err := godotenv.Load(); err != nil {
		log.Printf("Warning: Error loading .env file: %v", err)
	}

	flag.Usage = func() {
		fmt.Println("Usage: migrate [command]")
		fmt.Println("Commands:")
		fmt.Println("\tup\t\tMigrate the DB to the most recent version")
		fmt.Println("\tup-by-one\tMigrate the DB up by 1")
		fmt.Println("\tup-to VERSION\tMigrate the DB to a specific version")
		fmt.Println("\tdown\t\tRoll back the version by 1")
		fmt.Println("\tdown-to VERSION\tRoll back to a specific version")
		fmt.Println("\tredo\t\tRe-run the latest migration")
		fmt.Println("\tstatus\t\tDump the migration status")
		fmt.Println("\tversion\t\tPrint the current version")
		fmt.Println("\tcreate NAME\tCreate new migration file")
	}

	flag.Parse()

	if flag.NArg() == 0 {
		flag.Usage()
		os.Exit(1)
	}

	command := flag.Arg(0)

	workDir, err := os.Getwd()
	if err != nil {
		log.Fatal(err)
	}

	dbString := fmt.Sprintf("postgresql://%s:%s@%s:%s/%s?sslmode=disable",
		os.Getenv("DB_USER"),
		os.Getenv("DB_PASSWORD"),
		os.Getenv("DB_HOST"),
		os.Getenv("DB_PORT"),
		os.Getenv("DB_NAME"),
	)

	db, err := sql.Open("postgres", dbString)
	if err != nil {
		log.Fatalf("goose: failed to open DB: %v\n", err)
	}
	defer func() {
		if err := db.Close(); err != nil {
			log.Fatalf("goose: failed to close DB: %v\n", err)
		}
	}()

	migrationsDir := filepath.Join(workDir, "migrations")
	if err := goose.SetDialect("postgres"); err != nil {
		log.Fatal(err)
	}

	args := flag.Args()[1:]
	switch command {
	case "create":
		if len(args) == 0 {
			log.Fatal("Please provide migration name")
		}
		name := args[0]
		if err := goose.Create(db, migrationsDir, name, "sql"); err != nil {
			log.Fatal(err)
		}
	case "up":
		if err := goose.Up(db, migrationsDir); err != nil {
			log.Fatal(err)
		}
	case "up-by-one":
		if err := goose.UpByOne(db, migrationsDir); err != nil {
			log.Fatal(err)
		}
	case "up-to":
		if len(args) == 0 {
			log.Fatal("Please provide version argument")
		}
		version, err := strconv.ParseInt(args[0], 10, 64)
		if err != nil {
			log.Fatal("Invalid version argument")
		}
		if err := goose.UpTo(db, migrationsDir, version); err != nil {
			log.Fatal(err)
		}
	case "down":
		if err := goose.Down(db, migrationsDir); err != nil {
			log.Fatal(err)
		}
	case "down-to":
		if len(args) == 0 {
			log.Fatal("Please provide version argument")
		}
		version, err := strconv.ParseInt(args[0], 10, 64)
		if err != nil {
			log.Fatal("Invalid version argument")
		}
		if err := goose.DownTo(db, migrationsDir, version); err != nil {
			log.Fatal(err)
		}
	case "redo":
		if err := goose.Redo(db, migrationsDir); err != nil {
			log.Fatal(err)
		}
	case "status":
		if err := goose.Status(db, migrationsDir); err != nil {
			log.Fatal(err)
		}
	case "version":
		if err := goose.Version(db, migrationsDir); err != nil {
			log.Fatal(err)
		}
	default:
		flag.Usage()
		os.Exit(1)
	}
}
