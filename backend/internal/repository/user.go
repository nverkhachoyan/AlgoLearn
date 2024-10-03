package repository

import (
	"algolearn-backend/internal/config"
	"algolearn-backend/internal/models"
	"database/sql"
	"fmt"
	"strings"
)

// Fields to select in user queries
var userFields = `
	id,
	username,
	email,
	oauth_id,
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
	cpus,
	created_at,
	updated_at
`

func queryUser(query string, args ...interface{}) (*models.User, error) {
	db := config.GetDB()
	row := db.QueryRow(query, args...)
	return scanUser(row)
}

func scanUser(row *sql.Row) (*models.User, error) {
	var user models.User
	err := row.Scan(
		&user.ID,
		&user.Username,
		&user.Email,
		&user.OAuthID,
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
		&user.CPUs,
		&user.CreatedAt,
		&user.UpdatedAt,
	)

	if err == sql.ErrNoRows {
		return nil, fmt.Errorf("user not found")
	} else if err != nil {
		return nil, fmt.Errorf("could not scan user: %v", err)
	}
	return &user, nil
}

func CreateUser(user *models.User) error {
	db := config.GetDB()
	query := `
	INSERT INTO users (
		username,
		email,
		password_hash,
		oauth_id,
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
		cpus,
		created_at,
		updated_at
	) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17)
	RETURNING id`
	err := db.QueryRow(query,
		user.Username,
		user.Email,
		user.PasswordHash,
		user.OAuthID,
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
		user.CPUs,
		user.CreatedAt,
		user.UpdatedAt).Scan(&user.ID)
	if err != nil {
		return fmt.Errorf("could not insert user: %v", err)
	}
	return nil
}

func GetUserByID(id int) (*models.User, error) {
	query := fmt.Sprintf("SELECT %s FROM users WHERE id = $1", userFields)
	user, err := queryUser(query, id)
	if err != nil {
		return nil, err
	}

	// Fetch user streaks
	user.Streaks, err = GetStreaksByUserID(id)
	if err != nil {
		return nil, fmt.Errorf("could not fetch user streaks: %v", err)
	}

	// Fetch user achievements
	user.Achievements, err = GetUserAchievementsByUserID(id)
	if err != nil {
		return nil, fmt.Errorf("could not fetch user achievements: %v", err)
	}

	return user, nil
}

func GetUserByEmail(email string) (*models.User, error) {
	query := fmt.Sprintf("SELECT %s FROM users WHERE email = $1", userFields)
	user, err := queryUser(query, email)
	if err != nil {
		if err == sql.ErrNoRows {
			// No user found with email, no errors
			return nil, nil
		}
		// No user found with email, but error occurred
		return nil, err
	}

	// Fetch user streaks
	user.Streaks, err = GetStreaksByUserID(int(user.ID))
	if err != nil {
		return nil, fmt.Errorf("could not fetch user streaks: %v", err)
	}

	// Fetch user achievements
	user.Achievements, err = GetUserAchievementsByUserID(int(user.ID))
	if err != nil {
		return nil, fmt.Errorf("could not fetch user achievements: %v", err)
	}

	return user, nil
}

func UpdateUser(user *models.User) error {
	db := config.GetDB()

	// Map to hold fields to be updated
	fieldsToUpdate := map[string]interface{}{}
	if user.Username != "" {
		fieldsToUpdate["username"] = user.Username
	}
	if user.Email != "" {
		fieldsToUpdate["email"] = user.Email
	}
	if user.FirstName != "" {
		fieldsToUpdate["first_name"] = user.FirstName
	}
	if user.LastName != "" {
		fieldsToUpdate["last_name"] = user.LastName
	}
	if user.ProfilePictureURL != "" {
		fieldsToUpdate["profile_picture_url"] = user.ProfilePictureURL
	}
	if user.Bio != "" {
		fieldsToUpdate["bio"] = user.Bio
	}
	if user.Location != "" {
		fieldsToUpdate["location"] = user.Location
	}
	if user.Preferences != "" {
		fieldsToUpdate["preferences"] = user.Preferences
	}

	// Building query dynamically
	setClauses := []string{}
	values := []interface{}{}
	i := 1
	for field, value := range fieldsToUpdate {
		setClauses = append(setClauses, fmt.Sprintf("%s = $%d", field, i))
		values = append(values, value)
		i++
	}

	// Updated user
	setClauses = append(setClauses, fmt.Sprintf("updated_at = NOW()"))
	// Adding user ID for the WHERE clause
	values = append(values, user.ID)

	query := fmt.Sprintf(`UPDATE users SET %s WHERE id = $%d`, strings.Join(setClauses, ", "), i)

	_, err := db.Exec(query, values...)
	if err != nil {
		return fmt.Errorf("could not update user: %v", err)
	}
	return nil
}

func DeleteUser(id int) error {
	db := config.GetDB()
	query := "DELETE FROM users WHERE id = $1"
	_, err := db.Exec(query, id)
	if err != nil {
		return fmt.Errorf("could not delete user: %v", err)
	}
	return nil
}

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
			&user.OAuthID,
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
			&user.CPUs,
			&user.CreatedAt,
			&user.UpdatedAt)
		if err != nil {
			return nil, fmt.Errorf("could not scan user: %v", err)
		}

		// Fetch user streaks
		user.Streaks, err = GetStreaksByUserID(int(user.ID))
		if err != nil {
			return nil, fmt.Errorf("could not fetch user streaks: %v", err)
		}

		// Fetch user achievements
		user.Achievements, err = GetUserAchievementsByUserID(int(user.ID))
		if err != nil {
			return nil, fmt.Errorf("could not fetch user achievements: %v", err)
		}

		users = append(users, user)
	}

	if err = rows.Err(); err != nil {
		return nil, fmt.Errorf("rows error: %v", err)
	}

	return users, nil
}

func ChangeUserPassword(userID int, newPasswordHash string) error {
	db := config.GetDB()
	query := "UPDATE users SET password_hash = $1, updated_at = NOW() WHERE id = $2"
	_, err := db.Exec(query, newPasswordHash, userID)
	if err != nil {
		return fmt.Errorf("could not update user password: %v", err)
	}
	return nil
}
