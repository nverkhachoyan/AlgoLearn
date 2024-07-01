package repository

import (
	"algolearn-backend/internal/config"
	"algolearn-backend/internal/models"
)

func GetAllSubtopics() ([]models.Subtopic, error) {
	db := config.GetDB()
	rows, err := db.Query("SELECT id, topic_id, name, description, created_at, updated_at FROM subtopics")
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var subtopics []models.Subtopic
	for rows.Next() {
		var subtopic models.Subtopic
		err := rows.Scan(&subtopic.ID, &subtopic.TopicID, &subtopic.Name, &subtopic.Description, &subtopic.CreatedAt, &subtopic.UpdatedAt)
		if err != nil {
			return nil, err
		}
		subtopics = append(subtopics, subtopic)
	}

	if err := rows.Err(); err != nil {
		return nil, err
	}

	return subtopics, nil
}

func GetSubtopicByID(id int) (*models.Subtopic, error) {
	db := config.GetDB()
	row := db.QueryRow("SELECT id, topic_id, name, description, created_at, updated_at FROM subtopics WHERE id = $1", id)

	var subtopic models.Subtopic
	err := row.Scan(&subtopic.ID, &subtopic.TopicID, &subtopic.Name, &subtopic.Description, &subtopic.CreatedAt, &subtopic.UpdatedAt)
	if err != nil {
		return nil, err
	}

	return &subtopic, nil
}

func CreateSubtopic(subtopic *models.Subtopic) error {
	db := config.GetDB()
	err := db.QueryRow(
		"INSERT INTO subtopics (topic_id, name, description) VALUES ($1, $2, $3) RETURNING id, created_at, updated_at",
		subtopic.TopicID, subtopic.Name, subtopic.Description,
	).Scan(&subtopic.ID, &subtopic.CreatedAt, &subtopic.UpdatedAt)
	return err
}

func UpdateSubtopic(subtopic *models.Subtopic) error {
	db := config.GetDB()
	_, err := db.Exec(
		"UPDATE subtopics SET topic_id = $1, name = $2, description = $3, updated_at = CURRENT_TIMESTAMP WHERE id = $4",
		subtopic.TopicID, subtopic.Name, subtopic.Description, subtopic.ID,
	)
	return err
}

func DeleteSubtopic(id int) error {
	db := config.GetDB()
	_, err := db.Exec("DELETE FROM subtopics WHERE id = $1", id)
	return err
}
