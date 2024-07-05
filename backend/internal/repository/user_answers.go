// internal/repository/user_answers.go
package repository

import (
	"algolearn-backend/internal/config"
	"algolearn-backend/internal/models"
	"database/sql"
	"fmt"
	"time"
)

// Fields to select in user_answers queries
var userAnswerFields = `
	id,
	user_module_session_id,
	question_id,
	answer_id,
	answered_at,
	is_correct
`

func queryUserAnswer(query string, args ...interface{}) (models.UserAnswer, error) {
	db := config.GetDB()
	row := db.QueryRow(query, args...)
	return scanUserAnswer(row)
}

func scanUserAnswer(row *sql.Row) (models.UserAnswer, error) {
	var answer models.UserAnswer
	err := row.Scan(
		&answer.ID,
		&answer.UserModuleSessionID,
		&answer.QuestionID,
		&answer.AnswerID,
		&answer.AnsweredAt,
		&answer.IsCorrect,
	)

	if err == sql.ErrNoRows {
		return answer, fmt.Errorf("user_answer not found")
	} else if err != nil {
		return answer, fmt.Errorf("could not scan user_answer: %v", err)
	}
	return answer, nil
}

func GetUserAnswersBySessionID(sessionID int) ([]models.UserAnswer, error) {
	db := config.GetDB()
	query := fmt.Sprintf("SELECT %s FROM user_answers WHERE user_module_session_id = $1", userAnswerFields)
	rows, err := db.Query(query, sessionID)
	if err != nil {
		return nil, fmt.Errorf("could not get user_answers: %v", err)
	}
	defer rows.Close()

	var answers []models.UserAnswer
	for rows.Next() {
		var answer models.UserAnswer
		err := rows.Scan(
			&answer.ID,
			&answer.UserModuleSessionID,
			&answer.QuestionID,
			&answer.AnswerID,
			&answer.AnsweredAt,
			&answer.IsCorrect,
		)
		if err != nil {
			return nil, fmt.Errorf("could not scan user_answer: %v", err)
		}
		answers = append(answers, answer)
	}

	if err = rows.Err(); err != nil {
		return nil, fmt.Errorf("rows error: %v", err)
	}

	return answers, nil
}

func GetUserAnswerByID(id int) (models.UserAnswer, error) {
	query := fmt.Sprintf("SELECT %s FROM user_answers WHERE id = $1", userAnswerFields)
	return queryUserAnswer(query, id)
}

func CreateUserAnswer(answer *models.UserAnswer) error {
	db := config.GetDB()
	query := `
	INSERT INTO user_answers (
		user_module_session_id,
		question_id,
		answer_id,
		answered_at,
		is_correct
	) VALUES ($1, $2, $3, $4, $5)
	RETURNING id, answered_at`
	err := db.QueryRow(query,
		answer.UserModuleSessionID,
		answer.QuestionID,
		answer.AnswerID,
		time.Now(),
		answer.IsCorrect,
	).Scan(&answer.ID, &answer.AnsweredAt)
	if err != nil {
		return fmt.Errorf("could not insert user_answer: %v", err)
	}
	return nil
}

func UpdateUserAnswer(answer *models.UserAnswer) error {
	db := config.GetDB()
	query := `
	UPDATE user_answers SET
		question_id = $1,
		answer_id = $2,
		answered_at = $3,
		is_correct = $4
	WHERE id = $5`
	_, err := db.Exec(query,
		answer.QuestionID,
		answer.AnswerID,
		time.Now(),
		answer.IsCorrect,
		answer.ID)
	if err != nil {
		return fmt.Errorf("could not update user_answer: %v", err)
	}
	return nil
}

func DeleteUserAnswer(id int) error {
	db := config.GetDB()
	query := "DELETE FROM user_answers WHERE id = $1"
	_, err := db.Exec(query, id)
	if err != nil {
		return fmt.Errorf("could not delete user_answer: %v", err)
	}
	return nil
}
