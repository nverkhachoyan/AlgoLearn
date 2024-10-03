// internal/repository/module_questions.go
package repository

import (
	"algolearn-backend/internal/config"
	"algolearn-backend/internal/models"
	"database/sql"
	"errors"
	"fmt"

	"github.com/lib/pq"
)

var (
	ErrModuleNotFound   = errors.New("Module with given module ID does not exist")
	ErrQuestionNotFound = errors.New("Question with given ID does not exist")
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
		if errors.Is(err, sql.ErrNoRows) {
			return nil, errors.New("No question found with the given ID")
		}
		return nil, err
	}

	return &question, nil
}

func CreateQuestion(question *models.ModuleQuestion) error {
	db := config.GetDB()
	stmt, err := db.Prepare("INSERT INTO module_questions (module_id, content) VALUES ($1, $2)")
	if err != nil {
		config.Log.Debug(err)
		return err
	}
	defer stmt.Close()

	res, err := stmt.Exec(question.ModuleID, question.Content)
	if err != nil {
		if pqErr, ok := err.(*pq.Error); ok {
			switch pqErr.Code.Class() {
			case "23":
				// Class 23 indicates an integrity constraint violation
				if pqErr.Code.Name() == "foreign_key_violation" {
					config.Log.Debug(ErrModuleNotFound, err)
					return ErrModuleNotFound
				}
			}
		}
		config.Log.Debug(err)
		return err
	}

	rowCnt, err := res.RowsAffected()
	if err != nil {
		config.Log.Debug(err)
		return err
	}
	if rowCnt == 0 {
		return errors.New("No rows affected")
	}

	return nil
}

func UpdateQuestion(question *models.ModuleQuestion) error {
	db := config.GetDB()
	stmt, err := db.Prepare("UPDATE module_questions SET content = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2 AND module_id = $3")
	if err != nil {
		config.Log.Debug(err)
		return err
	}
	defer stmt.Close()

	res, err := stmt.Exec(question.Content, question.ID, question.ModuleID)
	if err != nil {
		if pqErr, ok := err.(*pq.Error); ok {
			switch pqErr.Code.Class() {
			case "23":
				// Class 23 indicates an integrity constraint violation
				if pqErr.Code.Name() == "foreign_key_violation" {
					config.Log.Debug(ErrModuleNotFound, err)
					return ErrModuleNotFound
				}
			}
		}
		config.Log.Debug(err)
		return err
	}

	rowCnt, err := res.RowsAffected()
	if err != nil {
		return err
	}
	if rowCnt == 0 {
		// Check if the issue is with the module ID or the question ID
		exists, checkErr := checkModuleAndQuestionExist(db, int(question.ID), int(question.ModuleID))
		if checkErr != nil {
			return checkErr
		}
		if !exists {
			return ErrModuleNotFound
		}
		return ErrQuestionNotFound
	}
	return nil
}

func checkModuleAndQuestionExist(db *sql.DB, questionID, moduleID int) (bool, error) {
	var exists bool
	query := "SELECT EXISTS(SELECT 1 FROM modules WHERE id = $1)"
	err := db.QueryRow(query, moduleID).Scan(&exists)
	if err != nil {
		return false, fmt.Errorf("failed to check if module exists: %w", err)
	}
	if !exists {
		return false, nil
	}

	query = "SELECT EXISTS(SELECT 1 FROM module_questions WHERE id = $1)"
	err = db.QueryRow(query, questionID).Scan(&exists)
	if err != nil {
		return false, fmt.Errorf("failed to check if question exists: %w", err)
	}

	return true, nil
}

func DeleteQuestion(moduleID int, moduleQuestionID int) error {
	db := config.GetDB()
	stmt, err := db.Prepare("DELETE FROM module_questions WHERE id = $1 AND module_id = $2")
	if err != nil {
		return err
	}
	defer stmt.Close()

	res, err := stmt.Exec(moduleQuestionID, moduleID)
	if err != nil {
		return err
	}

	resCnt, err := res.RowsAffected()

	if resCnt == 0 {
		// Check if the issue is with the module ID or the question ID
		exists, checkErr := checkModuleAndQuestionExist(db, moduleQuestionID, moduleID)
		if checkErr != nil {
			return checkErr
		}
		if !exists {
			return ErrModuleNotFound
		}
		return ErrQuestionNotFound
	}

	return nil
}
