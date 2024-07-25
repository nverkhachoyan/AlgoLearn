package repository

import (
	"algolearn-backend/internal/config"
	"algolearn-backend/internal/models"
	"fmt"
)

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
