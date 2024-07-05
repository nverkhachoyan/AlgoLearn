// internal/repository/courses.go
package repository

import (
	"algolearn-backend/internal/config"
	"algolearn-backend/internal/models"
)

func GetAllCourses() ([]models.Course, error) {
	db := config.GetDB()
	rows, err := db.Query("SELECT id, name, description, created_at, updated_at FROM courses")
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var courses []models.Course
	for rows.Next() {
		var course models.Course
		err := rows.Scan(&course.ID, &course.Name, &course.Description, &course.CreatedAt, &course.UpdatedAt)
		if err != nil {
			return nil, err
		}
		courses = append(courses, course)
	}

	if err := rows.Err(); err != nil {
		return nil, err
	}

	return courses, nil
}

func GetCourseByID(id int) (*models.Course, error) {
	db := config.GetDB()
	row := db.QueryRow("SELECT id, name, description, created_at, updated_at FROM courses WHERE id = $1", id)

	var course models.Course
	err := row.Scan(&course.ID, &course.Name, &course.Description, &course.CreatedAt, &course.UpdatedAt)
	if err != nil {
		return nil, err
	}

	return &course, nil
}

func CreateCourse(course *models.Course) error {
	db := config.GetDB()
	err := db.QueryRow(
		"INSERT INTO courses (name, description) VALUES ($1, $2) RETURNING id, created_at, updated_at",
		course.Name, course.Description,
	).Scan(&course.ID, &course.CreatedAt, &course.UpdatedAt)
	return err
}

func UpdateCourse(course *models.Course) error {
	db := config.GetDB()
	_, err := db.Exec(
		"UPDATE courses SET name = $1, description = $2, updated_at = CURRENT_TIMESTAMP WHERE id = $3",
		course.Name, course.Description, course.ID,
	)
	return err
}

func DeleteCourse(id int) error {
	db := config.GetDB()
	_, err := db.Exec("DELETE FROM courses WHERE id = $1", id)
	return err
}
