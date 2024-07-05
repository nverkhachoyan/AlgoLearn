// internal/repository/module_questions.go
package repository

import (
	"algolearn-backend/internal/config"
	"algolearn-backend/internal/models"
)

func GetQuestionsByModuleID(moduleID int) ([]models.ModuleQuestion, error) {
	db := config.GetDB()
	rows, err := db.Query("SELECT id, module_id, content, created_at, updated_at FROM module_questions WHERE module_id = $1", moduleID)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var questions []models.ModuleQuestion
	for rows.Next() {
		var question models.ModuleQuestion
		err := rows.Scan(&question.ID, &question.ModuleID, &question.Content, &question.CreatedAt, &question.UpdatedAt)
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

func GetQuestionByID(id int) (*models.ModuleQuestion, error) {
	db := config.GetDB()
	row := db.QueryRow("SELECT id, module_id, content, created_at, updated_at FROM module_questions WHERE id = $1", id)

	var question models.ModuleQuestion
	err := row.Scan(&question.ID, &question.ModuleID, &question.Content, &question.CreatedAt, &question.UpdatedAt)
	if err != nil {
		return nil, err
	}

	return &question, nil
}

func CreateQuestion(question *models.ModuleQuestion) error {
	db := config.GetDB()
	err := db.QueryRow(
		"INSERT INTO module_questions (module_id, content) VALUES ($1, $2) RETURNING id, created_at, updated_at",
		question.ModuleID, question.Content,
	).Scan(&question.ID, &question.CreatedAt, &question.UpdatedAt)
	return err
}

func UpdateQuestion(question *models.ModuleQuestion) error {
	db := config.GetDB()
	_, err := db.Exec(
		"UPDATE module_questions SET content = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2",
		question.Content, question.ID,
	)
	return err
}

func DeleteQuestion(id int) error {
	db := config.GetDB()
	_, err := db.Exec("DELETE FROM module_questions WHERE id = $1", id)
	return err
}
