// internal/repository/user.go
package repository

import (
	"algolearn-backend/internal/config"
	"algolearn-backend/internal/models"
	"database/sql"
	"fmt"
)

// Fields to select in user queries
var userFields = `
	id, 
	username, 
	email, 
	password_hash,
	role, 
	first_name, 
	last_name, 
	profile_picture_url, 
	last_login_at, 
	is_active, 
	is_email_verified, 
	bio, 
	location, 
	preferences, 
	created_at, 
	updated_at
`

// Helper function to execute a query and scan the user
func queryUser(query string, args ...interface{}) (models.User, error) {
	db := config.GetDB()
	row := db.QueryRow(query, args...)
	return scanUser(row)
}

// Common function to scan user rows
func scanUser(row *sql.Row) (models.User, error) {
	var user models.User
	err := row.Scan(
		&user.ID, 
		&user.Username, 
		&user.Email, 
		&user.PasswordHash,
		&user.Role, 
		&user.FirstName, 
		&user.LastName, 
		&user.ProfilePictureURL, 
		&user.LastLoginAt, 
		&user.IsActive, 
		&user.IsEmailVerified, 
		&user.Bio, 
		&user.Location, 
		&user.Preferences, 
		&user.CreatedAt, 
		&user.UpdatedAt)
	
	if err == sql.ErrNoRows {
		return user, fmt.Errorf("user not found")
	} else if err != nil {
		return user, fmt.Errorf("could not scan user: %v", err)
	}
	return user, nil
}

// CreateUser inserts a new user into the database
func CreateUser(user *models.User) error {
	db := config.GetDB()
	query := `
	INSERT INTO users (
		username,
		email,
		password_hash,
		role,
		first_name,
		last_name,
		profile_picture_url,
		last_login_at,
		is_active,
		is_email_verified,
		bio,
		location,
		preferences,
		created_at,
		updated_at
	) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15)
	RETURNING id`
	err := db.QueryRow(query,
		user.Username, 
		user.Email, 
		user.PasswordHash, 
		user.Role, 
		user.FirstName, 
		user.LastName, 
		user.ProfilePictureURL, 
		user.LastLoginAt, 
		user.IsActive, 
		user.IsEmailVerified, 
		user.Bio, 
		user.Location, 
		user.Preferences, 
		user.CreatedAt, 
		user.UpdatedAt).Scan(&user.ID)
	if err != nil {
		return fmt.Errorf("could not insert user: %v", err)
	}
	return nil
}

// GetUserByID retrieves a user by their ID
func GetUserByID(id int) (models.User, error) {
	query := fmt.Sprintf("SELECT %s FROM users WHERE id = $1", userFields)
	return queryUser(query, id)
}

// GetUserByEmail retrieves a user by their email
func GetUserByEmail(email string) (models.User, error) {
	query := fmt.Sprintf("SELECT %s FROM users WHERE email = $1", userFields)
	return queryUser(query, email)
}

// UpdateUser updates a user's information in the database
func UpdateUser(user *models.User) error {
	db := config.GetDB()
	query := `
	UPDATE users SET
		username = $1,
		email = $2,
		role = $3,
		first_name = $4,
		last_name = $5,
		profile_picture_url = $6,
		last_login_at = $7,
		is_active = $8,
		is_email_verified = $9,
		bio = $10,
		location = $11,
		preferences = $12,
		updated_at = NOW()
	WHERE id = $13`
	_, err := db.Exec(query,
		user.Username,
		user.Email,
		user.Role,
		user.FirstName,
		user.LastName,
		user.ProfilePictureURL,
		user.LastLoginAt,
		user.IsActive,
		user.IsEmailVerified,
		user.Bio,
		user.Location,
		user.Preferences,
		user.ID)
	if err != nil {
		return fmt.Errorf("could not update user: %v", err)
	}
	return nil
}

// DeleteUser deletes a user from the database
func DeleteUser(id int) error {
	db := config.GetDB()
	query := "DELETE FROM users WHERE id = $1"
	_, err := db.Exec(query, id)
	if err != nil {
		return fmt.Errorf("could not delete user: %v", err)
	}
	return nil
}

// GetAllUsers retrieves all users from the database
func GetAllUsers() ([]models.User, error) {
	db := config.GetDB()
	query := fmt.Sprintf("SELECT %s FROM users", userFields)
	rows, err := db.Query(query)
	if err != nil {
		return nil, fmt.Errorf("could not get users: %v", err)
	}
	defer rows.Close()

	var users []models.User
	for rows.Next() {
		var user models.User
		err := rows.Scan(
			&user.ID, 
			&user.Username, 
			&user.Email, 
			&user.Role, 
			&user.FirstName, 
			&user.LastName, 
			&user.ProfilePictureURL, 
			&user.LastLoginAt, 
			&user.IsActive, 
			&user.IsEmailVerified, 
			&user.Bio, 
			&user.Location, 
			&user.Preferences, 
			&user.CreatedAt, 
			&user.UpdatedAt)
		if err != nil {
			return nil, fmt.Errorf("could not scan user: %v", err)
		}
		users = append(users, user)
	}

	if err = rows.Err(); err != nil {
		return nil, fmt.Errorf("rows error: %v", err)
	}

	return users, nil
}

// ChangeUserPassword updates a user's password
func ChangeUserPassword(userID int, newPasswordHash string) error {
	db := config.GetDB()
	query := "UPDATE users SET password_hash = $1, updated_at = NOW() WHERE id = $2"
	_, err := db.Exec(query, newPasswordHash, userID)
	if err != nil {
		return fmt.Errorf("could not update user password: %v", err)
	}
	return nil
}
