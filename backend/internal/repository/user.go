package repository

import (
	"algolearn/internal/config"
	"algolearn/internal/models"
	"algolearn/pkg/logger"
	"database/sql"
	"errors"
	"fmt"
	"strings"
)

type UserRepository interface {
	// Account creation
	CreateUser(user *models.User) error
	GetUserByID(id int64) (*models.User, error)
	GetUserByEmail(email string) (*models.User, error)
	UpdateUser(user *models.User) error
	DeleteUser(id int64) error
	GetAllUsers() ([]models.User, error)
	ChangeUserPassword(userID int64, newPasswordHash string) error
	// User achievements
	GetAllUserAchievements() ([]models.UserAchievement, error)
	GetUserAchievementsByUserID(userID int64) ([]models.UserAchievement, error)
	GetUserAchievementByID(id int) (*models.UserAchievement, error)
	CreateUserAchievement(userAchievement *models.UserAchievement) error
	UpdateUserAchievement(userAchievement *models.UserAchievement) error
	DeleteUserAchievement(id int) error
	// User streaks
	GetStreaksByUserID(userID int64) ([]models.Streak, error)
	GetStreakByID(id int, userID int64) (models.Streak, error)
	CreateStreak(streak *models.Streak) error
	UpdateStreak(streak *models.Streak) error
	DeleteStreak(id int, userID int64) error
	// User progress
	GetUserModuleProgressByUserID(userID int64) ([]models.UserModuleProgress, error)
	GetUserModuleProgressByID(id int, userID int64) (models.UserModuleProgress, error)
	CreateUserModuleProgress(progress *models.UserModuleProgress) error
	UpdateUserModuleProgress(progress *models.UserModuleProgress) error
	DeleteUserModuleProgress(id int, userID int64) error
}

type userRepository struct {
	db *sql.DB
}

func NewUserRepository(db *sql.DB) UserRepository {
	return &userRepository{db: db}
}

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

	if errors.Is(err, sql.ErrNoRows) {
		return nil, fmt.Errorf("user not found")
	} else if err != nil {
		return nil, fmt.Errorf("could not scan user: %v", err)
	}
	return &user, nil
}

func (r *userRepository) CreateUser(user *models.User) error {
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
	err := r.db.QueryRow(query,
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

func (r *userRepository) GetUserByID(id int64) (*models.User, error) {
	query := fmt.Sprintf("SELECT %s FROM users WHERE id = $1", userFields)
	user, err := queryUser(query, id)
	if err != nil {
		return nil, err
	}

	// Fetch user streaks
	user.Streaks, err = r.GetStreaksByUserID(id)
	if err != nil {
		return nil, fmt.Errorf("could not fetch user streaks: %v", err)
	}

	// Fetch user achievements
	user.Achievements, err = r.GetUserAchievementsByUserID(id)
	if err != nil {
		return nil, fmt.Errorf("could not fetch user achievements: %v", err)
	}

	return user, nil
}

func (r *userRepository) GetUserByEmail(email string) (*models.User, error) {
	query := fmt.Sprintf("SELECT %s FROM users WHERE email = $1", userFields)
	user, err := queryUser(query, email)
	if err != nil {
		if errors.Is(err, sql.ErrNoRows) {
			// No user found with email, no errors
			return nil, nil
		}
		// No user found with email, but error occurred
		return nil, err
	}

	// Fetch user streaks
	user.Streaks, err = r.GetStreaksByUserID(user.ID)
	if err != nil {
		return nil, fmt.Errorf("could not fetch user streaks: %v", err)
	}

	// Fetch user achievements
	user.Achievements, err = r.GetUserAchievementsByUserID(user.ID)
	if err != nil {
		return nil, fmt.Errorf("could not fetch user achievements: %v", err)
	}

	return user, nil
}

func (r *userRepository) UpdateUser(user *models.User) error {
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
	var setClauses []string
	var values []interface{}
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

	_, err := r.db.Exec(query, values...)
	if err != nil {
		return fmt.Errorf("could not update user: %v", err)
	}
	return nil
}

func (r *userRepository) DeleteUser(id int64) error {
	query := "DELETE FROM users WHERE id = $1"
	_, err := r.db.Exec(query, id)
	if err != nil {
		return fmt.Errorf("could not delete user: %v", err)
	}
	return nil
}

func (r *userRepository) GetAllUsers() ([]models.User, error) {
	log := logger.Get()

	query := fmt.Sprintf("SELECT %s FROM users", userFields)
	rows, err := r.db.Query(query)
	if err != nil {
		return nil, fmt.Errorf("could not get users: %v", err)
	}
	defer func(rows *sql.Rows) {
		err := rows.Close()
		if err != nil {
			log.Errorf("failed to close rows in repository func GetAllUsers. %v", err.Error())
		}
	}(rows)

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
		user.Streaks, err = r.GetStreaksByUserID(user.ID)
		if err != nil {
			return nil, fmt.Errorf("could not fetch user streaks: %v", err)
		}

		// Fetch user achievements
		user.Achievements, err = r.GetUserAchievementsByUserID(user.ID)
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

func (r *userRepository) ChangeUserPassword(userID int64, newPasswordHash string) error {
	query := "UPDATE users SET password_hash = $1, updated_at = NOW() WHERE id = $2"
	_, err := r.db.Exec(query, newPasswordHash, userID)
	if err != nil {
		return fmt.Errorf("could not update user password: %v", err)
	}
	return nil
}

// Fields to select in user_module_progress queries
var userModuleProgressFields = `
	id,
	user_id,
	module_id,
	started_at,
	completed_at,
	progress,
	current_position,
	last_accessed,
	status
`

// Helper function to execute a query and scan the user_module_progress
func (r *userRepository) queryUserModuleProgress(query string, args ...interface{}) (models.UserModuleProgress, error) {
	row := r.db.QueryRow(query, args...)
	return r.scanUserModuleProgress(row)
}

// Common function to scan user_module_progress rows
func (r *userRepository) scanUserModuleProgress(row *sql.Row) (models.UserModuleProgress, error) {
	var progress models.UserModuleProgress
	err := row.Scan(
		&progress.ID,
		&progress.UserID,
		&progress.ModuleID,
		&progress.StartedAt,
		&progress.CompletedAt,
		&progress.Progress,
		&progress.CurrentPosition,
		&progress.LastAccessed,
		&progress.Status,
	)

	if errors.Is(err, sql.ErrNoRows) {
		return progress, fmt.Errorf("user_module_progress not found")
	} else if err != nil {
		return progress, fmt.Errorf("could not scan user_module_progress: %v", err)
	}
	return progress, nil
}

func (r *userRepository) GetUserModuleProgressByUserID(userID int64) ([]models.UserModuleProgress, error) {
	log := logger.Get()
	query := fmt.Sprintf("SELECT %s FROM user_module_progress WHERE user_id = $1", userModuleProgressFields)
	rows, err := r.db.Query(query, userID)
	if err != nil {
		return nil, fmt.Errorf("could not get user_module_progress: %v", err)
	}
	defer func(rows *sql.Rows) {
		err := rows.Close()
		if err != nil {
			log.Errorf(
				"failed to close rows in repository func GetUserModuleProgressByUserID. %v",
				err.Error())
		}
	}(rows)

	var progresses []models.UserModuleProgress
	for rows.Next() {
		var progress models.UserModuleProgress
		err := rows.Scan(
			&progress.ID,
			&progress.UserID,
			&progress.ModuleID,
			&progress.StartedAt,
			&progress.CompletedAt,
			&progress.Progress,
			&progress.CurrentPosition,
			&progress.LastAccessed,
			&progress.Status,
		)
		if err != nil {
			return nil, fmt.Errorf("could not scan user_module_progress: %v", err)
		}
		progresses = append(progresses, progress)
	}

	if err = rows.Err(); err != nil {
		return nil, fmt.Errorf("rows error: %v", err)
	}

	return progresses, nil
}

func (r *userRepository) GetUserModuleProgressByID(id int, userID int64) (models.UserModuleProgress, error) {
	query := fmt.Sprintf("SELECT %s FROM user_module_progress WHERE id = $1 AND user_id = $2", userModuleProgressFields)
	return r.queryUserModuleProgress(query, id, userID)
}

func (r *userRepository) CreateUserModuleProgress(progress *models.UserModuleProgress) error {
	query := `
	INSERT INTO user_module_progress (
		user_id,
		module_id,
		started_at,
		completed_at,
		progress,
		current_position,
		last_accessed,
		status
	) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
	RETURNING id, started_at, last_accessed`
	err := r.db.QueryRow(query,
		progress.UserID,
		progress.ModuleID,
		progress.StartedAt,
		progress.CompletedAt,
		progress.Progress,
		progress.CurrentPosition,
		progress.LastAccessed,
		progress.Status,
	).Scan(&progress.ID, &progress.StartedAt, &progress.LastAccessed)
	if err != nil {
		return fmt.Errorf("could not insert user_module_progress: %v", err)
	}
	return nil
}

func (r *userRepository) UpdateUserModuleProgress(progress *models.UserModuleProgress) error {
	query := `
	UPDATE user_module_progress SET
		started_at = $1,
		completed_at = $2,
		progress = $3,
		current_position = $4,
		last_accessed = NOW(),
		status = $5
	WHERE id = $6 AND user_id = $7`
	_, err := r.db.Exec(query,
		progress.StartedAt,
		progress.CompletedAt,
		progress.Progress,
		progress.CurrentPosition,
		progress.Status,
		progress.ID,
		progress.UserID)
	if err != nil {
		return fmt.Errorf("could not update user_module_progress: %v", err)
	}
	return nil
}

func (r *userRepository) DeleteUserModuleProgress(id int, userID int64) error {
	query := "DELETE FROM user_module_progress WHERE id = $1 AND user_id = $2"
	_, err := r.db.Exec(query, id, userID)
	if err != nil {
		return fmt.Errorf("could not delete user_module_progress: %v", err)
	}
	return nil
}

// GetAllUserAchievements retrieves all user achievements
func (r *userRepository) GetAllUserAchievements() ([]models.UserAchievement, error) {
	log := logger.Get()
	rows, err := r.db.Query("SELECT id, user_id, achievement_id, achieved_at FROM user_achievements")
	if err != nil {
		return nil, err
	}
	defer func(rows *sql.Rows) {
		err := rows.Close()
		if err != nil {
			log.Errorf("failed to close rows in repository func GetAllUserAchievements %v", err.Error())
		}
	}(rows)

	var userAchievements []models.UserAchievement
	for rows.Next() {
		var userAchievement models.UserAchievement
		err := rows.Scan(&userAchievement.ID, &userAchievement.UserID, &userAchievement.AchievementID, &userAchievement.AchievedAt)
		if err != nil {
			return nil, err
		}
		userAchievements = append(userAchievements, userAchievement)
	}

	if err := rows.Err(); err != nil {
		return nil, err
	}

	return userAchievements, nil
}

// GetUserAchievementsByUserID retrieves all achievements for a specific user
func (r *userRepository) GetUserAchievementsByUserID(userID int64) ([]models.UserAchievement, error) {
	log := logger.Get()
	query := `SELECT * FROM user_achievements WHERE user_id = $1`
	rows, err := r.db.Query(query, userID)
	if err != nil {
		return nil, fmt.Errorf("could not get user achievements: %v", err)
	}
	defer func(rows *sql.Rows) {
		err := rows.Close()
		if err != nil {
			log.Errorf("failed to close rows in repository func in GetUserAchievementsByUserID. %v", err.Error())
		}
	}(rows)

	var userAchievements []models.UserAchievement
	for rows.Next() {
		var userAchievement models.UserAchievement
		err := rows.Scan(
			&userAchievement.ID,
			&userAchievement.UserID,
			&userAchievement.AchievementID,
			&userAchievement.AchievedAt,
			&userAchievement.Name,
			&userAchievement.Description,
			&userAchievement.Points,
		)
		if err != nil {
			return nil, fmt.Errorf("could not scan user achievement: %v", err)
		}
		userAchievements = append(userAchievements, userAchievement)
	}

	if err = rows.Err(); err != nil {
		return nil, fmt.Errorf("rows error: %v", err)
	}

	return userAchievements, nil
}

// GetUserAchievementByID retrieves a user achievement by its ID
func (r *userRepository) GetUserAchievementByID(id int) (*models.UserAchievement, error) {
	row := r.db.QueryRow("SELECT id, user_id, achievement_id, achieved_at FROM user_achievements WHERE id = $1", id)

	var userAchievement models.UserAchievement
	err := row.Scan(&userAchievement.ID, &userAchievement.UserID, &userAchievement.AchievementID, &userAchievement.AchievedAt)
	if err != nil {
		return nil, err
	}

	return &userAchievement, nil
}

// CreateUserAchievement inserts a new user achievement into the database
func (r *userRepository) CreateUserAchievement(userAchievement *models.UserAchievement) error {
	err := r.db.QueryRow(
		"INSERT INTO user_achievements (user_id, achievement_id, achieved_at) VALUES ($1, $2, $3) RETURNING id",
		userAchievement.UserID, userAchievement.AchievementID, userAchievement.AchievedAt,
	).Scan(&userAchievement.ID)
	return err
}

// UpdateUserAchievement updates an existing user achievement in the database
func (r *userRepository) UpdateUserAchievement(userAchievement *models.UserAchievement) error {
	query := `
	UPDATE user_achievements SET
		user_id = $1,
		achievement_id = $2,
		achieved_at = $3
	WHERE id = $4`
	_, err := r.db.Exec(query,
		userAchievement.UserID,
		userAchievement.AchievementID,
		userAchievement.AchievedAt,
		userAchievement.ID)
	if err != nil {
		return fmt.Errorf("could not update user achievement: %v", err)
	}
	return nil
}

// DeleteUserAchievement deletes a user achievement from the database
func (r *userRepository) DeleteUserAchievement(id int) error {
	_, err := r.db.Exec("DELETE FROM user_achievements WHERE id = $1", id)
	return err
}

// ************************
// **** USER STREAKS ****
// ************************

// Helper function to execute a query and scan the streak
func (r *userRepository) queryStreak(query string, args ...interface{}) (models.Streak, error) {
	db := config.GetDB()
	row := db.QueryRow(query, args...)
	return r.scanStreak(row)
}

// Common function to scan streak rows
func (r *userRepository) scanStreak(row *sql.Row) (models.Streak, error) {
	var streak models.Streak
	err := row.Scan(
		&streak.ID,
		&streak.UserID,
		&streak.StartDate,
		&streak.EndDate,
		&streak.CurrentStreak,
		&streak.LongestStreak,
		&streak.CreatedAt,
		&streak.UpdatedAt,
	)

	if errors.Is(err, sql.ErrNoRows) {
		return streak, fmt.Errorf("streak not found")
	} else if err != nil {
		return streak, fmt.Errorf("could not scan streak: %v", err)
	}
	return streak, nil
}

// GetStreaksByUserID retrieves all streaks for a user
func (r *userRepository) GetStreaksByUserID(userID int64) ([]models.Streak, error) {
	log := logger.Get()
	query := fmt.Sprintf(`
	SELECT
		id,
		user_id,
		start_date,
		end_date,
		current_streak,
		longest_streak,
		created_at,
		updated_at
	FROM streaks WHERE user_id = $1`)
	rows, err := r.db.Query(query, userID)
	if err != nil {
		return nil, fmt.Errorf("could not get streaks: %v", err)
	}
	defer func(rows *sql.Rows) {
		err := rows.Close()
		if err != nil {
			log.Errorf("failed to close rows in repository func in GetStreaksByUserID. %v", err.Error())
		}
	}(rows)

	var streaks []models.Streak
	for rows.Next() {
		var streak models.Streak
		err := rows.Scan(
			&streak.ID,
			&streak.UserID,
			&streak.StartDate,
			&streak.EndDate,
			&streak.CurrentStreak,
			&streak.LongestStreak,
			&streak.CreatedAt,
			&streak.UpdatedAt,
		)
		if err != nil {
			return nil, fmt.Errorf("could not scan streak: %v", err)
		}
		streaks = append(streaks, streak)
	}

	if err = rows.Err(); err != nil {
		return nil, fmt.Errorf("rows error: %v", err)
	}

	return streaks, nil
}

// GetStreakByID retrieves a streak by its ID for a user
func (r *userRepository) GetStreakByID(id int, userID int64) (models.Streak, error) {
	query := fmt.Sprintf(`SELECT 
		id,
	user_id,
	start_date,
	end_date,
	current_streak,
	longest_streak,
	created_at,
	updated_at
	FROM streaks WHERE id = $1 AND user_id = $2`)
	return r.queryStreak(query, id, userID)
}

// CreateStreak inserts a new streak into the database
func (r *userRepository) CreateStreak(streak *models.Streak) error {
	query := `
	INSERT INTO streaks (
		user_id,
		start_date,
		end_date,
		current_streak,
		longest_streak,
		created_at,
		updated_at
	) VALUES ($1, $2, $3, $4, $5, NOW(), NOW())
	RETURNING id, created_at, updated_at`
	err := r.db.QueryRow(query,
		streak.UserID,
		streak.StartDate,
		streak.EndDate,
		streak.CurrentStreak,
		streak.LongestStreak,
	).Scan(&streak.ID, &streak.CreatedAt, &streak.UpdatedAt)
	if err != nil {
		return fmt.Errorf("could not insert streak: %v", err)
	}
	return nil
}

// UpdateStreak updates a streak's information in the database
func (r *userRepository) UpdateStreak(streak *models.Streak) error {
	query := `
	UPDATE streaks SET
		start_date = $1,
		end_date = $2,
		current_streak = $3,
		longest_streak = $4,
		updated_at = NOW()
	WHERE id = $5 AND user_id = $6`
	_, err := r.db.Exec(query,
		streak.StartDate,
		streak.EndDate,
		streak.CurrentStreak,
		streak.LongestStreak,
		streak.ID,
		streak.UserID)
	if err != nil {
		return fmt.Errorf("could not update streak: %v", err)
	}
	return nil
}

// DeleteStreak deletes a streak from the database
func (r *userRepository) DeleteStreak(id int, userID int64) error {
	query := "DELETE FROM streaks WHERE id = $1 AND user_id = $2"
	_, err := r.db.Exec(query, id, userID)
	if err != nil {
		return fmt.Errorf("could not delete streak: %v", err)
	}
	return nil
}
