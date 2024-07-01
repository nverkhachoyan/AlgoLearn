package repository

import (
	"algolearn-backend/internal/config"
	"algolearn-backend/internal/models"
)

func GetAllTopics() ([]models.Topic, error) {
	db := config.GetDB()
	rows, err := db.Query("SELECT id, name, description, created_at, updated_at FROM topics")
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var topics []models.Topic
	for rows.Next() {
		var topic models.Topic
		err := rows.Scan(&topic.ID, &topic.Name, &topic.Description, &topic.CreatedAt, &topic.UpdatedAt)
		if err != nil {
			return nil, err
		}
		topics = append(topics, topic)
	}

	if err := rows.Err(); err != nil {
		return nil, err
	}

	return topics, nil
}

func GetTopicByID(id int) (*models.Topic, error) {
	db := config.GetDB()
	row := db.QueryRow("SELECT id, name, description, created_at, updated_at FROM topics WHERE id = $1", id)

	var topic models.Topic
	err := row.Scan(&topic.ID, &topic.Name, &topic.Description, &topic.CreatedAt, &topic.UpdatedAt)
	if err != nil {
		return nil, err
	}

	return &topic, nil
}

func CreateTopic(topic *models.Topic) error {
	db := config.GetDB()
	err := db.QueryRow(
		"INSERT INTO topics (name, description) VALUES ($1, $2) RETURNING id, created_at, updated_at",
		topic.Name, topic.Description,
	).Scan(&topic.ID, &topic.CreatedAt, &topic.UpdatedAt)
	return err
}

func UpdateTopic(topic *models.Topic) error {
	db := config.GetDB()
	_, err := db.Exec(
		"UPDATE topics SET name = $1, description = $2, updated_at = CURRENT_TIMESTAMP WHERE id = $3",
		topic.Name, topic.Description, topic.ID,
	)
	return err
}

func DeleteTopic(id int) error {
	db := config.GetDB()
	_, err := db.Exec("DELETE FROM topics WHERE id = $1", id)
	return err
}
