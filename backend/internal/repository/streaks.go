// internal/repository/streaks.go
package repository

import (
	"algolearn-backend/internal/config"
	"algolearn-backend/internal/models"
	"database/sql"
	"fmt"
)

// Fields to select in streak queries
var streakFields = `
	id,
	user_id,
	start_date,
	end_date,
	current_streak,
	longest_streak,
	created_at,
	updated_at
`

// Helper function to execute a query and scan the streak
func queryStreak(query string, args ...interface{}) (models.Streak, error) {
	db := config.GetDB()
	row := db.QueryRow(query, args...)
	return scanStreak(row)
}

// Common function to scan streak rows
func scanStreak(row *sql.Row) (models.Streak, error) {
	var streak models.Streak
	err := row.Scan(
		&streak.ID,
		&streak.UserID,
		&streak.StartDate,
		&streak.EndDate,
		&streak.CurrentStreak,
		&streak.LongestStreak,
		&streak.CreatedAt,
		&streak.UpdatedAt,
	)

	if err == sql.ErrNoRows {
		return streak, fmt.Errorf("streak not found")
	} else if err != nil {
		return streak, fmt.Errorf("could not scan streak: %v", err)
	}
	return streak, nil
}

// GetStreaksByUserID retrieves all streaks for a user
func GetStreaksByUserID(userID int) ([]models.Streak, error) {
	db := config.GetDB()
	query := fmt.Sprintf("SELECT %s FROM streaks WHERE user_id = $1", streakFields)
	rows, err := db.Query(query, userID)
	if err != nil {
		return nil, fmt.Errorf("could not get streaks: %v", err)
	}
	defer rows.Close()

	var streaks []models.Streak
	for rows.Next() {
		var streak models.Streak
		err := rows.Scan(
			&streak.ID,
			&streak.UserID,
			&streak.StartDate,
			&streak.EndDate,
			&streak.CurrentStreak,
			&streak.LongestStreak,
			&streak.CreatedAt,
			&streak.UpdatedAt,
		)
		if err != nil {
			return nil, fmt.Errorf("could not scan streak: %v", err)
		}
		streaks = append(streaks, streak)
	}

	if err = rows.Err(); err != nil {
		return nil, fmt.Errorf("rows error: %v", err)
	}

	return streaks, nil
}

// GetStreakByID retrieves a streak by its ID for a user
func GetStreakByID(id int, userID int) (models.Streak, error) {
	query := fmt.Sprintf("SELECT %s FROM streaks WHERE id = $1 AND user_id = $2", streakFields)
	return queryStreak(query, id, userID)
}

// CreateStreak inserts a new streak into the database
func CreateStreak(streak *models.Streak) error {
	db := config.GetDB()
	query := `
	INSERT INTO streaks (
		user_id,
		start_date,
		end_date,
		current_streak,
		longest_streak,
		created_at,
		updated_at
	) VALUES ($1, $2, $3, $4, $5, NOW(), NOW())
	RETURNING id, created_at, updated_at`
	err := db.QueryRow(query,
		streak.UserID,
		streak.StartDate,
		streak.EndDate,
		streak.CurrentStreak,
		streak.LongestStreak,
	).Scan(&streak.ID, &streak.CreatedAt, &streak.UpdatedAt)
	if err != nil {
		return fmt.Errorf("could not insert streak: %v", err)
	}
	return nil
}

// UpdateStreak updates a streak's information in the database
func UpdateStreak(streak *models.Streak) error {
	db := config.GetDB()
	query := `
	UPDATE streaks SET
		start_date = $1,
		end_date = $2,
		current_streak = $3,
		longest_streak = $4,
		updated_at = NOW()
	WHERE id = $5 AND user_id = $6`
	_, err := db.Exec(query,
		streak.StartDate,
		streak.EndDate,
		streak.CurrentStreak,
		streak.LongestStreak,
		streak.ID,
		streak.UserID)
	if err != nil {
		return fmt.Errorf("could not update streak: %v", err)
	}
	return nil
}

// DeleteStreak deletes a streak from the database
func DeleteStreak(id int, userID int) error {
	db := config.GetDB()
	query := "DELETE FROM streaks WHERE id = $1 AND user_id = $2"
	_, err := db.Exec(query, id, userID)
	if err != nil {
		return fmt.Errorf("could not delete streak: %v", err)
	}
	return nil
}
