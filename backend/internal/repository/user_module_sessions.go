// internal/repository/user_module_sessions.go
package repository

import (
	"algolearn-backend/internal/config"
	"algolearn-backend/internal/models"
	"database/sql"
	"fmt"
)

// Fields to select in user_module_sessions queries
var userModuleSessionFields = `
	id,
	user_id,
	module_id,
	started_at,
	completed_at,
	progress,
	current_position,
	last_accessed
`

// Helper function to execute a query and scan the user_module_session
func queryUserModuleSession(query string, args ...interface{}) (models.UserModuleSession, error) {
	db := config.GetDB()
	row := db.QueryRow(query, args...)
	return scanUserModuleSession(row)
}

// Common function to scan user_module_session rows
func scanUserModuleSession(row *sql.Row) (models.UserModuleSession, error) {
	var session models.UserModuleSession
	err := row.Scan(
		&session.ID,
		&session.UserID,
		&session.ModuleID,
		&session.StartedAt,
		&session.CompletedAt,
		&session.Progress,
		&session.CurrentPosition,
		&session.LastAccessed,
	)

	if err == sql.ErrNoRows {
		return session, fmt.Errorf("user_module_session not found")
	} else if err != nil {
		return session, fmt.Errorf("could not scan user_module_session: %v", err)
	}
	return session, nil
}

// GetUserModuleSessionsByUserID retrieves all user_module_sessions for a user
func GetUserModuleSessionsByUserID(userID int) ([]models.UserModuleSession, error) {
	db := config.GetDB()
	query := fmt.Sprintf("SELECT %s FROM user_module_sessions WHERE user_id = $1", userModuleSessionFields)
	rows, err := db.Query(query, userID)
	if err != nil {
		return nil, fmt.Errorf("could not get user_module_sessions: %v", err)
	}
	defer rows.Close()

	var sessions []models.UserModuleSession
	for rows.Next() {
		var session models.UserModuleSession
		err := rows.Scan(
			&session.ID,
			&session.UserID,
			&session.ModuleID,
			&session.StartedAt,
			&session.CompletedAt,
			&session.Progress,
			&session.CurrentPosition,
			&session.LastAccessed,
		)
		if err != nil {
			return nil, fmt.Errorf("could not scan user_module_session: %v", err)
		}
		sessions = append(sessions, session)
	}

	if err = rows.Err(); err != nil {
		return nil, fmt.Errorf("rows error: %v", err)
	}

	return sessions, nil
}

// GetUserModuleSessionByID retrieves a user_module_session by its ID for a user
func GetUserModuleSessionByID(id int, userID int) (models.UserModuleSession, error) {
	query := fmt.Sprintf("SELECT %s FROM user_module_sessions WHERE id = $1 AND user_id = $2", userModuleSessionFields)
	return queryUserModuleSession(query, id, userID)
}

// CreateUserModuleSession inserts a new user_module_session into the database
func CreateUserModuleSession(session *models.UserModuleSession) error {
	db := config.GetDB()
	query := `
	INSERT INTO user_module_sessions (
		user_id,
		module_id,
		started_at,
		completed_at,
		progress,
		current_position,
		last_accessed
	) VALUES ($1, $2, $3, $4, $5, $6, $7)
	RETURNING id, started_at, last_accessed`
	err := db.QueryRow(query,
		session.UserID,
		session.ModuleID,
		session.StartedAt,
		session.CompletedAt,
		session.Progress,
		session.CurrentPosition,
		session.LastAccessed,
	).Scan(&session.ID, &session.StartedAt, &session.LastAccessed)
	if err != nil {
		return fmt.Errorf("could not insert user_module_session: %v", err)
	}
	return nil
}

// UpdateUserModuleSession updates a user_module_session's information in the database
func UpdateUserModuleSession(session *models.UserModuleSession) error {
	db := config.GetDB()
	query := `
	UPDATE user_module_sessions SET
		started_at = $1,
		completed_at = $2,
		progress = $3,
		current_position = $4,
		last_accessed = NOW()
	WHERE id = $5 AND user_id = $6`
	_, err := db.Exec(query,
		session.StartedAt,
		session.CompletedAt,
		session.Progress,
		session.CurrentPosition,
		session.ID,
		session.UserID)
	if err != nil {
		return fmt.Errorf("could not update user_module_session: %v", err)
	}
	return nil
}

// DeleteUserModuleSession deletes a user_module_session from the database
func DeleteUserModuleSession(id int, userID int) error {
	db := config.GetDB()
	query := "DELETE FROM user_module_sessions WHERE id = $1 AND user_id = $2"
	_, err := db.Exec(query, id, userID)
	if err != nil {
		return fmt.Errorf("could not delete user_module_session: %v", err)
	}
	return nil
}
