package repository

import (
	"algolearn-backend/internal/config"
	"algolearn-backend/internal/models"
)

func GetAllAchievements() ([]models.Achievement, error) {
	db := config.GetDB()
	rows, err := db.Query("SELECT id, name, description, points, created_at, updated_at FROM achievements")
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var achievements []models.Achievement
	for rows.Next() {
		var achievement models.Achievement
		err := rows.Scan(&achievement.ID, &achievement.Name, &achievement.Description, &achievement.Points, &achievement.CreatedAt, &achievement.UpdatedAt)
		if err != nil {
			return nil, err
		}
		achievements = append(achievements, achievement)
	}

	if err := rows.Err(); err != nil {
		return nil, err
	}

	return achievements, nil
}

func GetAchievementByID(id int) (*models.Achievement, error) {
	db := config.GetDB()
	row := db.QueryRow("SELECT id, name, description, points, created_at, updated_at FROM achievements WHERE id = $1", id)

	var achievement models.Achievement
	err := row.Scan(&achievement.ID, &achievement.Name, &achievement.Description, &achievement.Points, &achievement.CreatedAt, &achievement.UpdatedAt)
	if err != nil {
		return nil, err
	}

	return &achievement, nil
}

func CreateAchievement(achievement *models.Achievement) error {
	db := config.GetDB()
	err := db.QueryRow(
		"INSERT INTO achievements (name, description, points) VALUES ($1, $2, $3) RETURNING id, created_at, updated_at",
		achievement.Name, achievement.Description, achievement.Points,
	).Scan(&achievement.ID, &achievement.CreatedAt, &achievement.UpdatedAt)
	return err
}

func UpdateAchievement(achievement *models.Achievement) error {
	db := config.GetDB()
	_, err := db.Exec(
		"UPDATE achievements SET name = $1, description = $2, points = $3, updated_at = CURRENT_TIMESTAMP WHERE id = $4",
		achievement.Name, achievement.Description, achievement.Points, achievement.ID,
	)
	return err
}

func DeleteAchievement(id int) error {
	db := config.GetDB()
	_, err := db.Exec("DELETE FROM achievements WHERE id = $1", id)
	return err
}
