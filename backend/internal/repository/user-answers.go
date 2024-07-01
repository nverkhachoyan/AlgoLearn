package repository

import (
	"algolearn-backend/internal/config"
	"algolearn-backend/internal/models"
)

func GetAllUserAnswers() ([]models.UserAnswer, error) {
	db := config.GetDB()
	rows, err := db.Query("SELECT id, session_id, question_id, answer_id, answered_at, is_correct FROM user_answers")
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var userAnswers []models.UserAnswer
	for rows.Next() {
		var userAnswer models.UserAnswer
		err := rows.Scan(&userAnswer.ID, &userAnswer.SessionID, &userAnswer.QuestionID, &userAnswer.AnswerID, &userAnswer.AnsweredAt, &userAnswer.IsCorrect)
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
	row := db.QueryRow("SELECT id, session_id, question_id, answer_id, answered_at, is_correct FROM user_answers WHERE id = $1", id)

	var userAnswer models.UserAnswer
	err := row.Scan(&userAnswer.ID, &userAnswer.SessionID, &userAnswer.QuestionID, &userAnswer.AnswerID, &userAnswer.AnsweredAt, &userAnswer.IsCorrect)
	if err != nil {
		return nil, err
	}

	return &userAnswer, nil
}

func CreateUserAnswer(userAnswer *models.UserAnswer) error {
	db := config.GetDB()
	err := db.QueryRow(
		"INSERT INTO user_answers (session_id, question_id, answer_id, answered_at, is_correct) VALUES ($1, $2, $3, $4, $5) RETURNING id",
		userAnswer.SessionID, userAnswer.QuestionID, userAnswer.AnswerID, userAnswer.AnsweredAt, userAnswer.IsCorrect,
	).Scan(&userAnswer.ID)
	return err
}

func UpdateUserAnswer(userAnswer *models.UserAnswer) error {
	db := config.GetDB()
	_, err := db.Exec(
		"UPDATE user_answers SET session_id = $1, question_id = $2, answer_id = $3, answered_at = $4, is_correct = $5 WHERE id = $6",
		userAnswer.SessionID, userAnswer.QuestionID, userAnswer.AnswerID, userAnswer.AnsweredAt, userAnswer.IsCorrect, userAnswer.ID,
	)
	return err
}

func DeleteUserAnswer(id int) error {
	db := config.GetDB()
	_, err := db.Exec("DELETE FROM user_answers WHERE id = $1", id)
	return err
}
