// internal/repository/units.go
package repository

import (
	"algolearn-backend/internal/config"
	"algolearn-backend/internal/models"
)

func GetAllUnitsByCourseID(courseID int) ([]models.Unit, error) {
	db := config.GetDB()
	rows, err := db.Query("SELECT id, course_id, name, description, created_at, updated_at FROM units WHERE course_id = $1", courseID)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var units []models.Unit
	for rows.Next() {
		var unit models.Unit
		err := rows.Scan(&unit.ID, &unit.CourseID, &unit.Name, &unit.Description, &unit.CreatedAt, &unit.UpdatedAt)
		if err != nil {
			return nil, err
		}
		units = append(units, unit)
	}

	if err := rows.Err(); err != nil {
		return nil, err
	}

	return units, nil
}

func GetUnitByID(id int) (*models.Unit, error) {
	db := config.GetDB()
	row := db.QueryRow("SELECT id, course_id, name, description, created_at, updated_at FROM units WHERE id = $1", id)

	var unit models.Unit
	err := row.Scan(&unit.ID, &unit.CourseID, &unit.Name, &unit.Description, &unit.CreatedAt, &unit.UpdatedAt)
	if err != nil {
		return nil, err
	}

	return &unit, nil
}

func GetUnitsByCourseID(courseID int) ([]models.Unit, error) {
	db := config.GetDB()
	rows, err := db.Query("SELECT id, course_id, name, description, created_at, updated_at FROM units WHERE course_id = $1", courseID)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var units []models.Unit
	for rows.Next() {
		var unit models.Unit
		err := rows.Scan(&unit.ID, &unit.CourseID, &unit.Name, &unit.Description, &unit.CreatedAt, &unit.UpdatedAt)
		if err != nil {
			return nil, err
		}
		units = append(units, unit)
	}

	if err := rows.Err(); err != nil {
		return nil, err
	}

	return units, nil
}

func CreateUnit(unit *models.Unit) error {
	db := config.GetDB()
	err := db.QueryRow(
		"INSERT INTO units (course_id, name, description) VALUES ($1, $2, $3) RETURNING id, created_at, updated_at",
		unit.CourseID, unit.Name, unit.Description,
	).Scan(&unit.ID, &unit.CreatedAt, &unit.UpdatedAt)
	return err
}

func UpdateUnit(unit *models.Unit) error {
	db := config.GetDB()
	_, err := db.Exec(
		"UPDATE units SET name = $1, description = $2, updated_at = CURRENT_TIMESTAMP WHERE id = $3",
		unit.Name, unit.Description, unit.ID,
	)
	return err
}

func DeleteUnit(id int) error {
	db := config.GetDB()
	_, err := db.Exec("DELETE FROM units WHERE id = $1", id)
	return err
}
