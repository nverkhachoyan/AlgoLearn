// internal/repository/courses.go
package repository

import (
	"algolearn-backend/internal/config"
	"algolearn-backend/internal/models"
	"database/sql"
	"encoding/json"

	"github.com/lib/pq"
)

// GetAllCourses retrieves all courses from the database.
func GetAllCourses() ([]models.Course, error) {
	db := config.GetDB()
	rows, err := db.Query("SELECT * FROM courses")
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var courses []models.Course
	for rows.Next() {
		var course models.Course
		var tags pq.StringArray // Use pq.StringArray for scanning PostgreSQL arrays
		err := rows.Scan(
			&course.ID,
			&course.CreatedAt,
			&course.UpdatedAt,
			&course.Name,
			&course.Description,
			&course.BackgroundColor,
			&course.IconURL,
			&course.Duration,
			&course.DifficultyLevel,
			&course.Author,
			&tags, // Scan into pq.StringArray
			&course.Rating,
			&course.LearnersCount,
			&course.LastUpdated,
		)
		if err != nil {
			return nil, err
		}
		course.Tags = []string(tags) // Convert pq.StringArray to []string
		courses = append(courses, course)
	}

	if err := rows.Err(); err != nil {
		return nil, err
	}

	return courses, nil
}

// GetCourseByID retrieves a course by its ID.
func GetCourseByID(id int) (*models.Course, error) {
	db := config.GetDB()
	row := db.QueryRow("SELECT id, created_at, updated_at, name, description, background_color, icon_url, duration, difficulty_level, author, tags, rating, learners_count, last_updated FROM courses WHERE id = $1", id)

	var course models.Course
	var tags pq.StringArray
	err := row.Scan(
		&course.ID,
		&course.CreatedAt,
		&course.UpdatedAt,
		&course.Name,
		&course.Description,
		&course.BackgroundColor,
		&course.IconURL,
		&course.Duration,
		&course.DifficultyLevel,
		&course.Author,
		&tags,
		&course.Rating,
		&course.LearnersCount,
		&course.LastUpdated,
	)
	if err != nil {
		return nil, err
	}
	course.Tags = []string(tags)

	return &course, nil
}

// CreateCourse inserts a new course into the database.
func CreateCourse(course *models.Course) error {
	db := config.GetDB()
	err := db.QueryRow(
		"INSERT INTO courses (name, description, background_color, icon_url, duration, difficulty_level, author, tags, rating, learners_count) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10) RETURNING id, created_at, updated_at",
		course.Name, course.Description, course.BackgroundColor, course.IconURL, course.Duration, course.DifficultyLevel, course.Author, pq.Array(course.Tags), course.Rating, course.LearnersCount,
	).Scan(&course.ID, &course.CreatedAt, &course.UpdatedAt)
	return err
}

// UpdateCourse updates an existing course in the database.
func UpdateCourse(course *models.Course) error {
	db := config.GetDB()
	_, err := db.Exec(
		"UPDATE courses SET name = $1, description = $2, background_color = $3, icon_url = $4, duration = $5, difficulty_level = $6, author = $7, tags = $8, rating = $9, learners_count = $10, updated_at = CURRENT_TIMESTAMP WHERE id = $11",
		course.Name, course.Description, course.BackgroundColor, course.IconURL, course.Duration, course.DifficultyLevel, course.Author, pq.Array(course.Tags), course.Rating, course.LearnersCount, course.ID,
	)
	return err
}

// DeleteCourse deletes a course by its ID.
func DeleteCourse(id int) error {
	db := config.GetDB()
	_, err := db.Exec("DELETE FROM courses WHERE id = $1", id)
	return err
}

// *****************
// **** UNITS ****
// *****************

// GetAllUnits retrieves all units for a specific course.
func GetAllUnits(courseID int) ([]models.Unit, error) {
	db := config.GetDB()
	rows, err := db.Query("SELECT * FROM units WHERE course_id = $1", courseID)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var units []models.Unit
	for rows.Next() {
		var unit models.Unit
		err := rows.Scan(
			&unit.ID,
			&unit.CreatedAt,
			&unit.UpdatedAt,
			&unit.CourseID,
			&unit.Name,
			&unit.Description,
		)
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

// GetUnitByID retrieves a unit by its ID.
func GetUnitByID(id int) (*models.Unit, error) {
	db := config.GetDB()
	row := db.QueryRow("SELECT id, created_at, updated_at, course_id, name, description FROM units WHERE id = $1", id)

	var unit models.Unit
	err := row.Scan(
		&unit.ID,
		&unit.CreatedAt,
		&unit.UpdatedAt,
		&unit.CourseID,
		&unit.Name,
		&unit.Description,
	)
	if err != nil {
		return nil, err
	}

	return &unit, nil
}

// CreateUnit inserts a new unit into the database.
func CreateUnit(unit *models.Unit) error {
	db := config.GetDB()
	err := db.QueryRow(
		"INSERT INTO units (course_id, name, description) VALUES ($1, $2, $3) RETURNING id, created_at, updated_at",
		unit.CourseID, unit.Name, unit.Description,
	).Scan(&unit.ID, &unit.CreatedAt, &unit.UpdatedAt)
	return err
}

// UpdateUnit updates an existing unit in the database.
func UpdateUnit(unit *models.Unit) error {
	db := config.GetDB()
	_, err := db.Exec(
		"UPDATE units SET name = $1, description = $2, updated_at = CURRENT_TIMESTAMP WHERE id = $3",
		unit.Name, unit.Description, unit.ID,
	)
	return err
}

// DeleteUnit deletes a unit by its ID.
func DeleteUnit(id int) error {
	db := config.GetDB()
	_, err := db.Exec("DELETE FROM units WHERE id = $1", id)
	return err
}

// ********************
// **** MODULES ****
// ********************

// GetAllModules retrieves all modules for a specific unit.
func GetAllModules(unitID int) ([]models.Module, error) {
	db := config.GetDB()
	rows, err := db.Query("SELECT * FROM modules WHERE unit_id = $1", unitID)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var modules []models.Module
	for rows.Next() {
		var module models.Module
		var content []byte
		err := rows.Scan(
			&module.ID,
			&module.CreatedAt,
			&module.UpdatedAt,
			&module.UnitID,
			&module.CourseID,
			&module.Name,
			&module.Description,
			&content,
		)
		if err != nil {
			return nil, err
		}
		json.Unmarshal(content, &module.Content)
		modules = append(modules, module)
	}

	if err := rows.Err(); err != nil {
		return nil, err
	}

	return modules, nil
}

// GetModuleByID retrieves a module by its ID, including its sections.
func GetModuleByID(id int) (*models.Module, error) {
	db := config.GetDB()
	row := db.QueryRow("SELECT id, created_at, updated_at, unit_id, course_id, name, description, content FROM modules WHERE id = $1", id)

	var module models.Module
	var content []byte
	err := row.Scan(
		&module.ID,
		&module.CreatedAt,
		&module.UpdatedAt,
		&module.UnitID,
		&module.CourseID,
		&module.Name,
		&module.Description,
		&content,
	)
	if err != nil {
		return nil, err
	}

	// Fetch sections for this module
	sections, err := GetSectionsByModuleID(module.ID)
	if err != nil {
		return nil, err
	}
	module.Content.Sections = sections

	return &module, nil
}

// GetSectionsByModuleID retrieves sections for a given module ID.
func GetSectionsByModuleID(moduleID int) ([]models.Section, error) {
	db := config.GetDB()
	rows, err := db.Query("SELECT id, type, position, content, url, question_id, question, correct_answer_ids, animation, description FROM sections WHERE module_id = $1 ORDER BY position", moduleID)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var sections []models.Section
	for rows.Next() {
		var baseSection models.BaseSection
		var content, url, animation, description sql.NullString
		var questionID sql.NullInt64
		var question sql.NullString
		var sectionID sql.NullInt64
		var correctAnswerIDs pq.Int64Array

		err := rows.Scan(
			&sectionID,
			&baseSection.Type,
			&baseSection.Position,
			&content,
			&url,
			&questionID,
			&question,
			&correctAnswerIDs,
			&animation,
			&description,
		)
		if err != nil {
			return nil, err
		}

		// Convert pq.Int64Array to []int
		correctAnswerIDsInt := make([]int, len(correctAnswerIDs))
		for i, id := range correctAnswerIDs {
			correctAnswerIDsInt[i] = int(id)
		}

		var section models.Section
		switch baseSection.Type {
		case "text":
			section = models.TextSection{
				BaseSection: baseSection,
				Content:     content.String,
			}
		case "question":
			section = models.QuestionSection{
				BaseSection:      baseSection,
				QuestionID:       int(questionID.Int64),
				Question:         question.String,
				CorrectAnswerIDs: correctAnswerIDsInt,
			}
		case "video":
			section = models.VideoSection{
				BaseSection: baseSection,
				URL:         url.String,
			}
		case "code":
			section = models.CodeSection{
				BaseSection: baseSection,
				Content:     content.String,
			}
		case "lottie":
			section = models.LottieSection{
				BaseSection: baseSection,
				Animation:   animation.String,
			}
		case "image":
			section = models.ImageSection{
				BaseSection: baseSection,
				Url:         url.String,
				Description: description.String,
			}
		}

		sections = append(sections, section)
	}

	if err := rows.Err(); err != nil {
		return nil, err
	}

	return sections, nil
}

// CreateModule inserts a new module into the database.
func CreateModule(module *models.Module) error {
	db := config.GetDB()
	content, err := json.Marshal(module.Content)
	if err != nil {
		return err
	}
	err = db.QueryRow(
		"INSERT INTO modules (unit_id, course_id, name, description, content) VALUES ($1, $2, $3, $4, $5) RETURNING id, created_at, updated_at",
		module.UnitID, module.CourseID, module.Name, module.Description, content,
	).Scan(&module.ID, &module.CreatedAt, &module.UpdatedAt)
	return err
}

// UpdateModule updates an existing module in the database.
func UpdateModule(module *models.Module) error {
	db := config.GetDB()
	content, err := json.Marshal(module.Content)
	if err != nil {
		return err
	}
	_, err = db.Exec(
		"UPDATE modules SET name = $1, description = $2, content = $3, updated_at = CURRENT_TIMESTAMP WHERE id = $4",
		module.Name, module.Description, content, module.ID,
	)
	return err
}

// DeleteModule deletes a module by its ID.
func DeleteModule(id int) error {
	db := config.GetDB()
	_, err := db.Exec("DELETE FROM modules WHERE id = $1", id)
	return err
}
