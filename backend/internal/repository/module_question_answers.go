// internal/repository/module_question_answers.go
package repository

import (
	"algolearn-backend/internal/config"
	"algolearn-backend/internal/models"
)

func GetAllModuleQuestionAnswers() []models.ModuleQuestionAnswer {
	db := config.GetDB()
	rows, err := db.Query("SELECT id, question_id, content, is_correct, created_at, updated_at FROM module_question_answers")
	if err != nil {
		return nil
	}
	defer rows.Close()

	var answers []models.ModuleQuestionAnswer
	for rows.Next() {
		var answer models.ModuleQuestionAnswer
		err := rows.Scan(&answer.ID, &answer.QuestionID, &answer.Content, &answer.IsCorrect, &answer.CreatedAt, &answer.UpdatedAt)
		if err != nil {
			return nil
		}
		answers = append(answers, answer)
	}

	if err := rows.Err(); err != nil {
		return nil
	}

	return answers
}

func GetAnswersByQuestionID(questionID int) ([]models.ModuleQuestionAnswer, error) {
	db := config.GetDB()
	rows, err := db.Query("SELECT id, question_id, content, is_correct, created_at, updated_at FROM module_question_answers WHERE question_id = $1", questionID)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var answers []models.ModuleQuestionAnswer
	for rows.Next() {
		var answer models.ModuleQuestionAnswer
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

func GetModuleQuestionAnswerByID(id int) (*models.ModuleQuestionAnswer, error) {
	db := config.GetDB()
	row := db.QueryRow("SELECT id, question_id, content, is_correct, created_at, updated_at FROM module_question_answers WHERE id = $1", id)

	var answer models.ModuleQuestionAnswer
	err := row.Scan(&answer.ID, &answer.QuestionID, &answer.Content, &answer.IsCorrect, &answer.CreatedAt, &answer.UpdatedAt)
	if err != nil {
		return nil, err
	}

	return &answer, nil
}

func CreateModuleQuestionAnswer(answer *models.ModuleQuestionAnswer) error {
	db := config.GetDB()
	err := db.QueryRow(
		"INSERT INTO module_question_answers (question_id, content, is_correct) VALUES ($1, $2, $3) RETURNING id, created_at, updated_at",
		answer.QuestionID, answer.Content, answer.IsCorrect,
	).Scan(&answer.ID, &answer.CreatedAt, &answer.UpdatedAt)
	return err
}

func UpdateModuleQuestionAnswer(answer *models.ModuleQuestionAnswer) error {
	db := config.GetDB()
	_, err := db.Exec(
		"UPDATE module_question_answers SET content = $1, is_correct = $2, updated_at = CURRENT_TIMESTAMP WHERE id = $3",
		answer.Content, answer.IsCorrect, answer.ID,
	)
	return err
}

func DeleteModuleQuestionAnswer(id int) error {
	db := config.GetDB()
	_, err := db.Exec("DELETE FROM module_question_answers WHERE id = $1", id)
	return err
}
