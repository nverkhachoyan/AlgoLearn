package repository

import (
	"algolearn-backend/internal/config"
	"algolearn-backend/internal/models"
)

func GetAllAnswers() ([]models.Answer, error) {
	db := config.GetDB()
	rows, err := db.Query("SELECT id, question_id, content, is_correct, created_at, updated_at FROM answers")
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var answers []models.Answer
	for rows.Next() {
		var answer models.Answer
		err := rows.Scan(&answer.ID, &answer.QuestionID, &answer.Content, &answer.IsCorrect, &answer.CreatedAt, &answer.UpdatedAt)
		if err != nil {
			return nil, err
		}
		answers = append(answers, answer)
	}

	if err := rows.Err(); err != nil {
		return nil, err
	}

	return answers, nil
}

func GetAnswerByID(id int) (*models.Answer, error) {
	db := config.GetDB()
	row := db.QueryRow("SELECT id, question_id, content, is_correct, created_at, updated_at FROM answers WHERE id = $1", id)

	var answer models.Answer
	err := row.Scan(&answer.ID, &answer.QuestionID, &answer.Content, &answer.IsCorrect, &answer.CreatedAt, &answer.UpdatedAt)
	if err != nil {
		return nil, err
	}

	return &answer, nil
}

func CreateAnswer(answer *models.Answer) error {
	db := config.GetDB()
	err := db.QueryRow(
		"INSERT INTO answers (question_id, content, is_correct) VALUES ($1, $2, $3) RETURNING id, created_at, updated_at",
		answer.QuestionID, answer.Content, answer.IsCorrect,
	).Scan(&answer.ID, &answer.CreatedAt, &answer.UpdatedAt)
	return err
}

func UpdateAnswer(answer *models.Answer) error {
	db := config.GetDB()
	_, err := db.Exec(
		"UPDATE answers SET question_id = $1, content = $2, is_correct = $3, updated_at = CURRENT_TIMESTAMP WHERE id = $4",
		answer.QuestionID, answer.Content, answer.IsCorrect, answer.ID,
	)
	return err
}

func DeleteAnswer(id int) error {
	db := config.GetDB()
	_, err := db.Exec("DELETE FROM answers WHERE id = $1", id)
	return err
}
