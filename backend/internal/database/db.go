package database

import (
	generated "algolearn/internal/database/generated"
	"database/sql"
)

type Database struct {
	*generated.Queries
	db *sql.DB
}

func New(db *sql.DB) *Database {
	return &Database{
		Queries: generated.New(db),
		db:      db,
	}
}
