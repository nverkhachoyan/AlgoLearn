// internal/repository/user_answers.go
package repository

import (
	"algolearn-backend/internal/config"
	"algolearn-backend/internal/models"
)

func GetUserAnswersBySessionID(sessionID int) ([]models.UserAnswer, error) {
	db := config.GetDB()
	rows, err := db.Query("SELECT id, user_module_session_id, question_id, answer_id, answered_at, is_correct FROM user_answers WHERE user_module_session_id = $1", sessionID)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var userAnswers []models.UserAnswer
	for rows.Next() {
		var userAnswer models.UserAnswer
		err := rows.Scan(&userAnswer.ID, &userAnswer.UserModuleSessionID, &userAnswer.QuestionID, &userAnswer.AnswerID, &userAnswer.AnsweredAt, &userAnswer.IsCorrect)
		if err != nil {
			return nil, err
		}
		userAnswers = append(userAnswers, userAnswer)
	}

	if err := rows.Err(); err != nil {
		return nil, err
	}

	return userAnswers, nil
}

func GetUserAnswerByID(id int) (*models.UserAnswer, error) {
	db := config.GetDB()
	row := db.QueryRow("SELECT id, user_module_session_id, question_id, answer_id, answered_at, is_correct FROM user_answers WHERE id = $1", id)

	var userAnswer models.UserAnswer
	err := row.Scan(&userAnswer.ID, &userAnswer.UserModuleSessionID, &userAnswer.QuestionID, &userAnswer.AnswerID, &userAnswer.AnsweredAt, &userAnswer.IsCorrect)
	if err != nil {
		return nil, err
	}

	return &userAnswer, nil
}

func CreateUserAnswer(userAnswer *models.UserAnswer) error {
	db := config.GetDB()
	err := db.QueryRow(
		"INSERT INTO user_answers (user_module_session_id, question_id, answer_id, answered_at, is_correct) VALUES ($1, $2, $3, CURRENT_TIMESTAMP, $4) RETURNING id",
		userAnswer.UserModuleSessionID, userAnswer.QuestionID, userAnswer.AnswerID, userAnswer.IsCorrect,
	).Scan(&userAnswer.ID)
	return err
}

func UpdateUserAnswer(userAnswer *models.UserAnswer) error {
	db := config.GetDB()
	_, err := db.Exec(
		"UPDATE user_answers SET question_id = $1, answer_id = $2, answered_at = CURRENT_TIMESTAMP, is_correct = $3 WHERE id = $4",
		userAnswer.QuestionID, userAnswer.AnswerID, userAnswer.IsCorrect, userAnswer.ID,
	)
	return err
}

func DeleteUserAnswer(id int) error {
	db := config.GetDB()
	_, err := db.Exec("DELETE FROM user_answers WHERE id = $1", id)
	return err
}
