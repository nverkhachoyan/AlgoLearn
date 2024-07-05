// internal/repository/module_sessions.go
package repository

import (
	"algolearn-backend/internal/config"
	"algolearn-backend/internal/models"
)

func GetModuleSession(userID, moduleID int) (*models.UserModuleSession, error) {
	db := config.GetDB()
	row := db.QueryRow("SELECT id, user_id, module_id, started_at, completed_at, progress, current_position, last_accessed FROM user_module_sessions WHERE user_id = $1 AND module_id = $2", userID, moduleID)

	var session models.UserModuleSession
	err := row.Scan(&session.ID, &session.UserID, &session.ModuleID, &session.StartedAt, &session.CompletedAt, &session.Progress, &session.CurrentPosition, &session.LastAccessed)
	if err != nil {
		return nil, err
	}

	return &session, nil
}

func CreateModuleSession(session *models.UserModuleSession) error {
	db := config.GetDB()
	err := db.QueryRow(
		"INSERT INTO user_module_sessions (user_id, module_id, started_at, progress, current_position, last_accessed) VALUES ($1, $2, CURRENT_TIMESTAMP, 0.00, 0, CURRENT_TIMESTAMP) RETURNING id",
		session.UserID, session.ModuleID,
	).Scan(&session.ID)
	return err
}

func UpdateModuleSession(session *models.UserModuleSession) error {
	db := config.GetDB()
	_, err := db.Exec(
		"UPDATE user_module_sessions SET progress = $1, current_position = $2, last_accessed = CURRENT_TIMESTAMP WHERE user_id = $3 AND module_id = $4",
		session.Progress, session.CurrentPosition, session.UserID, session.ModuleID,
	)
	return err
}

func CompleteModuleSession(userID, moduleID int) error {
	db := config.GetDB()
	_, err := db.Exec("UPDATE user_module_sessions SET progress = 100.00, completed_at = CURRENT_TIMESTAMP WHERE user_id = $1 AND module_id = $2", userID, moduleID)
	return err
}
