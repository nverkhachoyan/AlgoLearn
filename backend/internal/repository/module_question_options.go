// internal/repository/module_question_answers.go
package repository

import (
	"algolearn-backend/internal/config"
	"algolearn-backend/internal/models"
)

func GetAllModuleQuestionOptions() []models.ModuleQuestionOption {
	db := config.GetDB()
	rows, err := db.Query("SELECT id, question_id, content, is_correct, created_at, updated_at FROM module_question_options")
	if err != nil {
		return nil
	}
	defer rows.Close()

	var answers []models.ModuleQuestionOption
	for rows.Next() {
		var answer models.ModuleQuestionOption
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

func GetOptionsByQuestionID(questionID int) ([]models.ModuleQuestionOption, error) {
	db := config.GetDB()
	rows, err := db.Query("SELECT id, question_id, content, is_correct, created_at, updated_at FROM module_question_options WHERE question_id = $1", questionID)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var answers []models.ModuleQuestionOption
	for rows.Next() {
		var answer models.ModuleQuestionOption
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

func GetModuleQuestionOptionByID(id int) (*models.ModuleQuestionOption, error) {
	db := config.GetDB()
	row := db.QueryRow("SELECT id, question_id, content, is_correct, created_at, updated_at FROM module_question_options WHERE id = $1", id)

	var answer models.ModuleQuestionOption
	err := row.Scan(&answer.ID, &answer.QuestionID, &answer.Content, &answer.IsCorrect, &answer.CreatedAt, &answer.UpdatedAt)
	if err != nil {
		return nil, err
	}

	return &answer, nil
}

func CreateModuleQuestionOption(answer *models.ModuleQuestionOption) error {
	db := config.GetDB()
	err := db.QueryRow(
		"INSERT INTO module_question_options (question_id, content, is_correct) VALUES ($1, $2, $3) RETURNING id, created_at, updated_at",
		answer.QuestionID, answer.Content, answer.IsCorrect,
	).Scan(&answer.ID, &answer.CreatedAt, &answer.UpdatedAt)
	return err
}

func UpdateModuleQuestionOption(answer *models.ModuleQuestionOption) error {
	db := config.GetDB()
	_, err := db.Exec(
		"UPDATE module_question_options SET content = $1, is_correct = $2, updated_at = CURRENT_TIMESTAMP WHERE id = $3",
		answer.Content, answer.IsCorrect, answer.ID,
	)
	return err
}

func DeleteModuleQuestionOption(id int) error {
	db := config.GetDB()
	_, err := db.Exec("DELETE FROM module_question_options WHERE id = $1", id)
	return err
}
