// internal/repository/user.go
package repository

import (
	"algolearn-backend/internal/config"
	"algolearn-backend/internal/models"
	"database/sql"
	"errors"
	"fmt"
)

func CreateUser(user models.User) error {
	db := config.GetDB()
	query := `
	INSERT INTO users (username, email, password_hash, created_at, updated_at)
	VALUES ($1, $2, $3, $4, $5)
	RETURNING id
	`
	err := db.QueryRow(query,
		user.Username,
		user.Email,
		user.PasswordHash,
		user.CreatedAt,
		user.UpdatedAt).Scan(&user.ID)
	if err != nil {
		return fmt.Errorf("Could not insert user: %v", err)
	}
	return nil
}

func GetUserById(id int) (models.User, error) {
	db := config.GetDB()
	row := db.QueryRow("SELECT id, name, email FROM users WHERE id = $1", id)

	var user models.User
	if err := row.Scan(&user.ID, &user.Username, &user.Email); err != nil {
		if err == sql.ErrNoRows {
			return user, errors.New("User not found")
		}
		return user, err
	}

	return user, nil
}

func GetUserByEmail(email string) (models.User, error) {
	db := config.GetDB()
	var user models.User
	query := `SELECT id, username, email, password_hash, created_at, updated_at FROM users WHERE email = $1`
	row := db.QueryRow(query, email)
	err := row.Scan(&user.ID, &user.Username, &user.Email, &user.PasswordHash, &user.CreatedAt, &user.UpdatedAt)
	if err == sql.ErrNoRows {
		return user, fmt.Errorf("user not found")
	} else if err != nil {
		return user, fmt.Errorf("could not get user: %v", err)
	}
	return user, nil
}
