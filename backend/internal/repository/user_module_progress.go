// internal/repository/user_module_progress.go
package repository

import (
	"algolearn-backend/internal/config"
	"algolearn-backend/internal/models"
	"database/sql"
	"fmt"
)

// Fields to select in user_module_progress queries
var userModuleProgressFields = `
	id,
	user_id,
	module_id,
	started_at,
	completed_at,
	progress,
	current_position,
	last_accessed,
	status
`

// Helper function to execute a query and scan the user_module_progress
func queryUserModuleProgress(query string, args ...interface{}) (models.UserModuleProgress, error) {
	db := config.GetDB()
	row := db.QueryRow(query, args...)
	return scanUserModuleProgress(row)
}

// Common function to scan user_module_progress rows
func scanUserModuleProgress(row *sql.Row) (models.UserModuleProgress, error) {
	var progress models.UserModuleProgress
	err := row.Scan(
		&progress.ID,
		&progress.UserID,
		&progress.ModuleID,
		&progress.StartedAt,
		&progress.CompletedAt,
		&progress.Progress,
		&progress.CurrentPosition,
		&progress.LastAccessed,
		&progress.Status,
	)

	if err == sql.ErrNoRows {
		return progress, fmt.Errorf("user_module_progress not found")
	} else if err != nil {
		return progress, fmt.Errorf("could not scan user_module_progress: %v", err)
	}
	return progress, nil
}

func GetUserModuleProgressByUserID(userID int) ([]models.UserModuleProgress, error) {
	db := config.GetDB()
	query := fmt.Sprintf("SELECT %s FROM user_module_progress WHERE user_id = $1", userModuleProgressFields)
	rows, err := db.Query(query, userID)
	if err != nil {
		return nil, fmt.Errorf("could not get user_module_progress: %v", err)
	}
	defer rows.Close()

	var progresses []models.UserModuleProgress
	for rows.Next() {
		var progress models.UserModuleProgress
		err := rows.Scan(
			&progress.ID,
			&progress.UserID,
			&progress.ModuleID,
			&progress.StartedAt,
			&progress.CompletedAt,
			&progress.Progress,
			&progress.CurrentPosition,
			&progress.LastAccessed,
			&progress.Status,
		)
		if err != nil {
			return nil, fmt.Errorf("could not scan user_module_progress: %v", err)
		}
		progresses = append(progresses, progress)
	}

	if err = rows.Err(); err != nil {
		return nil, fmt.Errorf("rows error: %v", err)
	}

	return progresses, nil
}

func GetUserModuleProgressByID(id int, userID int) (models.UserModuleProgress, error) {
	query := fmt.Sprintf("SELECT %s FROM user_module_progress WHERE id = $1 AND user_id = $2", userModuleProgressFields)
	return queryUserModuleProgress(query, id, userID)
}

func CreateUserModuleProgress(progress *models.UserModuleProgress) error {
	db := config.GetDB()
	query := `
	INSERT INTO user_module_progress (
		user_id,
		module_id,
		started_at,
		completed_at,
		progress,
		current_position,
		last_accessed,
		status
	) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
	RETURNING id, started_at, last_accessed`
	err := db.QueryRow(query,
		progress.UserID,
		progress.ModuleID,
		progress.StartedAt,
		progress.CompletedAt,
		progress.Progress,
		progress.CurrentPosition,
		progress.LastAccessed,
		progress.Status,
	).Scan(&progress.ID, &progress.StartedAt, &progress.LastAccessed)
	if err != nil {
		return fmt.Errorf("could not insert user_module_progress: %v", err)
	}
	return nil
}

func UpdateUserModuleProgress(progress *models.UserModuleProgress) error {
	db := config.GetDB()
	query := `
	UPDATE user_module_progress SET
		started_at = $1,
		completed_at = $2,
		progress = $3,
		current_position = $4,
		last_accessed = NOW(),
		status = $5
	WHERE id = $6 AND user_id = $7`
	_, err := db.Exec(query,
		progress.StartedAt,
		progress.CompletedAt,
		progress.Progress,
		progress.CurrentPosition,
		progress.Status,
		progress.ID,
		progress.UserID)
	if err != nil {
		return fmt.Errorf("could not update user_module_progress: %v", err)
	}
	return nil
}

func DeleteUserModuleProgress(id int, userID int) error {
	db := config.GetDB()
	query := "DELETE FROM user_module_progress WHERE id = $1 AND user_id = $2"
	_, err := db.Exec(query, id, userID)
	if err != nil {
		return fmt.Errorf("could not delete user_module_progress: %v", err)
	}
	return nil
}
