package repository

import (
	"algolearn-backend/internal/config"
	"algolearn-backend/internal/models"
	"database/sql"
	"errors"
)

func GetAllUsers() ([]models.User, error) {
	db := config.GetDB()
	rows, err := db.Query("SELECT id, name, email FROM users")
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	users := []models.User{}
	for rows.Next() {
		var user models.User
		if err := rows.Scan(&user.ID, &user.Name, &user.Email); err != nil {
			return nil, err
		}
		users = append(users, user)
	}

	if err = rows.Err(); err != nil {
		return nil, err
	}

	return users, nil
}

func GetUserById(id int) (models.User, error) {
	db := config.GetDB()
	row := db.QueryRow("SELECT id, name, email FROM users WHERE id = $1", id)

	var user models.User
	if err := row.Scan(&user.ID, &user.Name, &user.Email); err != nil {
		if err == sql.ErrNoRows {
			return user, errors.New("User not found")
		}
		return user, err
	}

	return user, nil
}

func CreateUser(user models.User) (models.User, error) {
	db := config.GetDB()
	err := db.QueryRow(
		"INSERT INTO users (name, email) VALUES ($1, $2) RETURNING id",
		user.Name, user.Email,
	).Scan(&user.ID)
	if err != nil {
		return user, err
	}

	return user, nil
}
