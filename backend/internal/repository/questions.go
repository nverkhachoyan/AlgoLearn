package repository

import (
	"algolearn-backend/internal/config"
	"algolearn-backend/internal/models"
)

func GetAllQuestions() ([]models.Question, error) {
	db := config.GetDB()
	rows, err := db.Query("SELECT id, subtopic_id, content, created_at, updated_at FROM questions")
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var questions []models.Question
	for rows.Next() {
		var question models.Question
		err := rows.Scan(&question.ID, &question.SubtopicID, &question.Content, &question.CreatedAt, &question.UpdatedAt)
		if err != nil {
			return nil, err
		}
		questions = append(questions, question)
	}

	if err := rows.Err(); err != nil {
		return nil, err
	}

	return questions, nil
}

func GetQuestionByID(id int) (*models.Question, error) {
	db := config.GetDB()
	row := db.QueryRow("SELECT id, subtopic_id, content, created_at, updated_at FROM questions WHERE id = $1", id)

	var question models.Question
	err := row.Scan(&question.ID, &question.SubtopicID, &question.Content, &question.CreatedAt, &question.UpdatedAt)
	if err != nil {
		return nil, err
	}

	return &question, nil
}

func CreateQuestion(question *models.Question) error {
	db := config.GetDB()
	err := db.QueryRow(
		"INSERT INTO questions (subtopic_id, content) VALUES ($1, $2) RETURNING id, created_at, updated_at",
		question.SubtopicID, question.Content,
	).Scan(&question.ID, &question.CreatedAt, &question.UpdatedAt)
	return err
}

func UpdateQuestion(question *models.Question) error {
	db := config.GetDB()
	_, err := db.Exec(
		"UPDATE questions SET subtopic_id = $1, content = $2, updated_at = CURRENT_TIMESTAMP WHERE id = $3",
		question.SubtopicID, question.Content, question.ID,
	)
	return err
}

func DeleteQuestion(id int) error {
	db := config.GetDB()
	_, err := db.Exec("DELETE FROM questions WHERE id = $1", id)
	return err
}
