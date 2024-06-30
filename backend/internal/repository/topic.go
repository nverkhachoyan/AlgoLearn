package repository

import (
	"algolearn-backend/internal/config"
	"algolearn-backend/internal/models"
)

func GetAllTopics() ([]models.Topic, error) {
	db := config.GetDB()
	rows, err := db.Query("SELECT topic_id, name, description FROM topics")
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var topics []models.Topic
	for rows.Next() {
		var topic models.Topic
		err := rows.Scan(&topic.ID, &topic.Name, &topic.Description)
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