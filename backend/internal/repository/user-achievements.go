package repository

import (
	"algolearn-backend/internal/config"
	"algolearn-backend/internal/models"
)

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

func CreateUserAchievement(userAchievement *models.UserAchievement) error {
	db := config.GetDB()
	err := db.QueryRow(
		"INSERT INTO user_achievements (user_id, achievement_id, achieved_at) VALUES ($1, $2, $3) RETURNING id",
		userAchievement.UserID, userAchievement.AchievementID, userAchievement.AchievedAt,
	).Scan(&userAchievement.ID)
	return err
}

func DeleteUserAchievement(id int) error {
	db := config.GetDB()
	_, err := db.Exec("DELETE FROM user_achievements WHERE id = $1", id)
	return err
}
