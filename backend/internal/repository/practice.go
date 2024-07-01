package repository

import (
	"algolearn-backend/internal/config"
	"algolearn-backend/internal/models"
)

func GetAllPracticeSessions() ([]models.PracticeSession, error) {
	db := config.GetDB()
	rows, err := db.Query("SELECT id, user_id, subtopic_id, started_at, completed_at FROM practice_sessions")
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var sessions []models.PracticeSession
	for rows.Next() {
		var session models.PracticeSession
		err := rows.Scan(&session.ID, &session.UserID, &session.SubtopicID, &session.StartedAt, &session.CompletedAt)
		if err != nil {
			return nil, err
		}
		sessions = append(sessions, session)
	}

	if err := rows.Err(); err != nil {
		return nil, err
	}

	return sessions, nil
}

func GetPracticeSessionByID(id int) (*models.PracticeSession, error) {
	db := config.GetDB()
	row := db.QueryRow("SELECT id, user_id, subtopic_id, started_at, completed_at FROM practice_sessions WHERE id = $1", id)

	var session models.PracticeSession
	err := row.Scan(&session.ID, &session.UserID, &session.SubtopicID, &session.StartedAt, &session.CompletedAt)
	if err != nil {
		return nil, err
	}

	return &session, nil
}

func CreatePracticeSession(session *models.PracticeSession) error {
	db := config.GetDB()
	err := db.QueryRow(
		"INSERT INTO practice_sessions (user_id, subtopic_id, started_at) VALUES ($1, $2, $3) RETURNING id, completed_at",
		session.UserID, session.SubtopicID, session.StartedAt,
	).Scan(&session.ID, &session.CompletedAt)
	return err
}

func UpdatePracticeSession(session *models.PracticeSession) error {
	db := config.GetDB()
	_, err := db.Exec(
		"UPDATE practice_sessions SET user_id = $1, subtopic_id = $2, started_at = $3, completed_at = $4 WHERE id = $5",
		session.UserID, session.SubtopicID, session.StartedAt, session.CompletedAt, session.ID,
	)
	return err
}

func DeletePracticeSession(id int) error {
	db := config.GetDB()
	_, err := db.Exec("DELETE FROM practice_sessions WHERE id = $1", id)
	return err
}
