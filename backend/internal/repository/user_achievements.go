package repository

import (
	"algolearn-backend/internal/config"
	"algolearn-backend/internal/models"
	"database/sql"
	"fmt"
)

// Fields to select in streak queries
var streakFields = `
	id,
	user_id,
	start_date,
	end_date,
	current_streak,
	longest_streak,
	created_at,
	updated_at
`

// GetAllUserAchievements retrieves all user achievements
func GetAllUserAchievements() ([]models.UserAchievement, error) {
	db := config.GetDB()
	rows, err := db.Query("SELECT id, user_id, achievement_id, achieved_at FROM user_achievements")
	if err != nil {
		return nil, err
	}
	defer rows.Close()

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
func GetUserAchievementsByUserID(userID int) ([]models.UserAchievement, error) {
	db := config.GetDB()
	query := `SELECT * FROM user_achievements WHERE user_id = $1`
	rows, err := db.Query(query, userID)
	if err != nil {
		return nil, fmt.Errorf("could not get user achievements: %v", err)
	}
	defer rows.Close()

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
func GetUserAchievementByID(id int) (*models.UserAchievement, error) {
	db := config.GetDB()
	row := db.QueryRow("SELECT id, user_id, achievement_id, achieved_at FROM user_achievements WHERE id = $1", id)

	var userAchievement models.UserAchievement
	err := row.Scan(&userAchievement.ID, &userAchievement.UserID, &userAchievement.AchievementID, &userAchievement.AchievedAt)
	if err != nil {
		return nil, err
	}

	return &userAchievement, nil
}

// CreateUserAchievement inserts a new user achievement into the database
func CreateUserAchievement(userAchievement *models.UserAchievement) error {
	db := config.GetDB()
	err := db.QueryRow(
		"INSERT INTO user_achievements (user_id, achievement_id, achieved_at) VALUES ($1, $2, $3) RETURNING id",
		userAchievement.UserID, userAchievement.AchievementID, userAchievement.AchievedAt,
	).Scan(&userAchievement.ID)
	return err
}

// UpdateUserAchievement updates an existing user achievement in the database
func UpdateUserAchievement(userAchievement *models.UserAchievement) error {
	db := config.GetDB()
	query := `
	UPDATE user_achievements SET
		user_id = $1,
		achievement_id = $2,
		achieved_at = $3
	WHERE id = $4`
	_, err := db.Exec(query,
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
func DeleteUserAchievement(id int) error {
	db := config.GetDB()
	_, err := db.Exec("DELETE FROM user_achievements WHERE id = $1", id)
	return err
}

// ************************
// **** USER STREAKS ****
// ************************

// Helper function to execute a query and scan the streak
func queryStreak(query string, args ...interface{}) (models.Streak, error) {
	db := config.GetDB()
	row := db.QueryRow(query, args...)
	return scanStreak(row)
}

// Common function to scan streak rows
func scanStreak(row *sql.Row) (models.Streak, error) {
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

	if err == sql.ErrNoRows {
		return streak, fmt.Errorf("streak not found")
	} else if err != nil {
		return streak, fmt.Errorf("could not scan streak: %v", err)
	}
	return streak, nil
}

// GetStreaksByUserID retrieves all streaks for a user
func GetStreaksByUserID(userID int) ([]models.Streak, error) {
	db := config.GetDB()
	query := fmt.Sprintf("SELECT %s FROM streaks WHERE user_id = $1", streakFields)
	rows, err := db.Query(query, userID)
	if err != nil {
		return nil, fmt.Errorf("could not get streaks: %v", err)
	}
	defer rows.Close()

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
func GetStreakByID(id int, userID int) (models.Streak, error) {
	query := fmt.Sprintf("SELECT %s FROM streaks WHERE id = $1 AND user_id = $2", streakFields)
	return queryStreak(query, id, userID)
}

// CreateStreak inserts a new streak into the database
func CreateStreak(streak *models.Streak) error {
	db := config.GetDB()
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
	err := db.QueryRow(query,
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
func UpdateStreak(streak *models.Streak) error {
	db := config.GetDB()
	query := `
	UPDATE streaks SET
		start_date = $1,
		end_date = $2,
		current_streak = $3,
		longest_streak = $4,
		updated_at = NOW()
	WHERE id = $5 AND user_id = $6`
	_, err := db.Exec(query,
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
func DeleteStreak(id int, userID int) error {
	db := config.GetDB()
	query := "DELETE FROM streaks WHERE id = $1 AND user_id = $2"
	_, err := db.Exec(query, id, userID)
	if err != nil {
		return fmt.Errorf("could not delete streak: %v", err)
	}
	return nil
}
