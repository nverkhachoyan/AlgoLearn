package repository

import (
	"algolearn-backend/internal/config"
	"algolearn-backend/internal/models"
	"database/sql"
	"encoding/json"
	"fmt"
	"strings"

	"github.com/lib/pq"
)

type CourseRepository interface {
	GetAllCourses() ([]models.Course, error)
	GetCourseByID(id int64) (*models.Course, error)
	CreateCourse(course *models.Course) (*models.Course, error)
	UpdateCourse(course *models.Course) (*models.Course, error)
	DeleteCourse(id int64) error
	GetAllUnits(courseID int64) ([]models.Unit, error)
	GetUnitByID(id int64) (*models.Unit, error)
	CreateUnit(unit *models.Unit) error
	UpdateUnit(unit *models.Unit) error
	DeleteUnit(id int64) error
	GetAllModulesPartial(unitID int64) ([]models.Module, error)
	GetAllModules(unitID int64) ([]models.Module, error)
	GetModuleByID(id int64) (*models.Module, error)
	CreateModule(module *models.Module) error
	UpdateModule(module *models.Module) error
	DeleteModule(id int64) error
}

type courseRepository struct {
	db *sql.DB
}

func NewCourseRepository(db *sql.DB) CourseRepository {
	return &courseRepository{db: db}
}

func (r *courseRepository) GetAllCourses() ([]models.Course, error) {
	rows, err := r.db.Query("SELECT * FROM courses")
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var courses []models.Course

	for rows.Next() {
		var course models.Course

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
			&course.Authors,
			&course.Tags,
			&course.Rating,
			&course.LearnersCount,
		)
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

func (r *courseRepository) GetCourseByID(id int64) (*models.Course, error) {
	row := r.db.QueryRow("SELECT * FROM courses WHERE id = $1", id)

	var course models.Course
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
		&course.Authors,
		&course.Tags,
		&course.Rating,
		&course.LearnersCount,
	)
	if err != nil {
		return nil, err
	}

	return &course, nil
}

func (r *courseRepository) CreateCourse(course *models.Course) (*models.Course, error) {
	var createdCourse models.Course
	err := r.db.QueryRow(
		`INSERT INTO courses 
				(name, 
				description, 
				background_color, 
				icon_url, 
				duration, 
				difficulty_level, 
				authors, 
				tags, 
				rating, 
				learners_count) 
			VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10) 
			RETURNING 
				name, 
				description, 
				background_color, 
				icon_url, 
				duration, 
				difficulty_level, 
				authors, 
				tags, 
				rating, 
				learners_count`,
		course.Name,
		course.Description,
		course.BackgroundColor,
		course.IconURL,
		course.Duration,
		course.DifficultyLevel,
		course.Authors,
		course.Tags,
		course.Rating,
		course.LearnersCount,
	).Scan(
		&createdCourse.Name,
		&createdCourse.Description,
		&createdCourse.BackgroundColor,
		&createdCourse.IconURL,
		&createdCourse.Duration,
		&createdCourse.DifficultyLevel,
		&createdCourse.Authors,
		&createdCourse.Tags,
		&createdCourse.Rating,
		&createdCourse.LearnersCount,
	)

	if err != nil {
		return nil, err
	}

	return &createdCourse, nil
}

func (r *courseRepository) UpdateCourse(course *models.Course) (*models.Course, error) {
	query := "UPDATE courses SET "
	setClauses := []string{}
	args := []interface{}{}
	argID := 1

	addSetClause := func(field string, value interface{}) {
		setClauses = append(setClauses, fmt.Sprintf("%s = $%d", field, argID))
		args = append(args, value)
		argID++
	}

	// These are custom NullableStringSlice types
	if len(course.Authors) > 0 {
		addSetClause("authors", course.Authors)

	}
	if len(course.Tags) > 0 {
		addSetClause("tags", course.Tags)
	}

	if course.Name.Present {
		if course.Name.Valid {
			addSetClause("name", course.Name.Val)
		} else {
			addSetClause("name", nil)
		}
	}

	if course.Description.Present {
		if course.Description.Valid {
			addSetClause("description", course.Description.Val)
		} else {
			addSetClause("description", nil)
		}
	}
	if course.BackgroundColor.Present {
		if course.BackgroundColor.Valid {
			addSetClause("background_color", course.BackgroundColor.Val)
		} else {
			addSetClause("background_color", nil)
		}
	}
	if course.IconURL.Present {
		if course.IconURL.Valid {
			addSetClause("icon_url", course.IconURL.Val)
		} else {
			addSetClause("icon_url", nil)
		}
	}
	if course.Duration.Present {
		if course.Duration.Valid {
			addSetClause("duration", course.Duration.Val)
		} else {
			addSetClause("duration", nil)
		}
	}
	if course.DifficultyLevel.Present {
		if course.DifficultyLevel.Valid {
			addSetClause("difficulty_level", course.DifficultyLevel.Val)
		} else {
			addSetClause("difficulty_level", nil)
		}
	}

	if course.Rating.Present {
		if course.Rating.Valid {
			addSetClause("rating", course.Rating.Val)
		} else {
			addSetClause("rating", nil)
		}
	}
	if course.LearnersCount.Present {
		if course.LearnersCount.Valid {
			addSetClause("learners_count", course.LearnersCount.Val)
		} else {
			addSetClause("learners_count", nil)
		}
	}

	setClauses = append(setClauses, "updated_at = CURRENT_TIMESTAMP")
	query += strings.Join(setClauses, ", ")
	query += fmt.Sprintf(` WHERE id = $%d RETURNING name, 
				description, 
				background_color, 
				icon_url, 
				duration, 
				difficulty_level, 
				authors, 
				tags, 
				rating, 
				learners_count;`, argID)
	args = append(args, course.ID)

	var updatedCourse models.Course
	err := r.db.QueryRow(query, args...).Scan(
		&updatedCourse.Name,
		&updatedCourse.Description,
		&updatedCourse.BackgroundColor,
		&updatedCourse.IconURL,
		&updatedCourse.Duration,
		&updatedCourse.DifficultyLevel,
		&updatedCourse.Authors,
		&updatedCourse.Tags,
		&updatedCourse.Rating,
		&updatedCourse.LearnersCount,
	)
	if err != nil {
		return nil, fmt.Errorf("Failed to update course ID %d: %v", course.ID, err)
	}

	return &updatedCourse, nil
}

func (r *courseRepository) DeleteCourse(id int64) error {
	_, err := r.db.Exec("DELETE FROM courses WHERE id = $1", id)
	return err
}

// *****************
// **** UNITS ****
// *****************

func (r *courseRepository) GetAllUnits(courseID int64) ([]models.Unit, error) {
	rows, err := r.db.Query("SELECT * FROM units WHERE course_id = $1", courseID)
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

func (r *courseRepository) GetUnitByID(id int64) (*models.Unit, error) {
	row := r.db.QueryRow("SELECT id, created_at, updated_at, course_id, name, description FROM units WHERE id = $1", id)

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

func (r *courseRepository) CreateUnit(unit *models.Unit) error {
	err := r.db.QueryRow(
		"INSERT INTO units (course_id, name, description) VALUES ($1, $2, $3) RETURNING id, created_at, updated_at",
		unit.CourseID, unit.Name, unit.Description,
	).Scan(&unit.ID, &unit.CreatedAt, &unit.UpdatedAt)
	return err
}

func (r *courseRepository) UpdateUnit(unit *models.Unit) error {
	result, err := r.db.Exec(
		"UPDATE units SET name = $1, description = $2, updated_at = CURRENT_TIMESTAMP WHERE id = $3",
		unit.Name, unit.Description, unit.ID,
	)
	if err != nil {
		config.Log.Errorf("Failed to execute update query: %v", err)
		return fmt.Errorf("could not update unit: %w", err)
	}

	rowsAffected, err := result.RowsAffected()
	if err != nil {
		config.Log.Errorf("Failed to retrieve affected rows: %v", err)
		return fmt.Errorf("could not retrieve affected rows: %w", err)
	}

	if rowsAffected == 0 {
		return fmt.Errorf("no rows were updated, unit with id %d may not exist", unit.ID)
	}

	return nil
}

func (r *courseRepository) DeleteUnit(id int64) error {
	_, err := r.db.Exec("DELETE FROM units WHERE id = $1", id)
	return err
}

// ********************
// **** MODULES ****
// ********************

func (r *courseRepository) GetAllModulesPartial(unitID int64) ([]models.Module, error) {
	rows, err := r.db.Query("SELECT id, created_at, updated_at, unit_id, course_id, name, description FROM modules WHERE unit_id = $1", unitID)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var modules []models.Module
	for rows.Next() {
		var module models.Module
		err := rows.Scan(
			&module.ID,
			&module.CreatedAt,
			&module.UpdatedAt,
			&module.UnitID,
			&module.CourseID,
			&module.Name,
			&module.Description,
		)
		if err != nil {
			return nil, err
		}

		modules = append(modules, module)
	}

	if err := rows.Err(); err != nil {
		return nil, err
	}

	return modules, nil
}

func (r *courseRepository) GetAllModules(unitID int64) ([]models.Module, error) {
	rows, err := r.db.Query("SELECT id, created_at, updated_at, unit_id, course_id, name, description FROM modules WHERE unit_id = $1", unitID)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var modules []models.Module
	for rows.Next() {
		var module models.Module
		err := rows.Scan(
			&module.ID,
			&module.CreatedAt,
			&module.UpdatedAt,
			&module.UnitID,
			&module.CourseID,
			&module.Name,
			&module.Description,
		)
		if err != nil {
			return nil, err
		}

		modules = append(modules, module)
	}

	if err := rows.Err(); err != nil {
		return nil, err
	}

	return modules, nil
}

func (r *courseRepository) GetModuleByID(id int64) (*models.Module, error) {
	row := r.db.QueryRow("SELECT id, created_at, updated_at, unit_id, course_id, name, description, content FROM modules WHERE id = $1", id)

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

	sections, err := r.GetSectionsByModuleID(int(module.ID))
	if err != nil {
		return nil, err
	}
	module.Sections = sections

	return &module, nil
}

func (r *courseRepository) GetSectionsByModuleID(moduleID int) ([]models.Section, error) {
	rows, err := r.db.Query(`
	SELECT 
		id, 
		type, 
		position, 
		content, 
		url, 
		question_id, 
		question, 
		correct_answer_ids, 
		animation, 
		description 
		FROM sections 
	WHERE module_id = $1 
	ORDER BY position`,
		moduleID)

	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var sections []models.Section
	for rows.Next() {
		var section models.Section

		err := rows.Scan(
			&section.ID,
			&section.Type,
			&section.Position,
			&section.Content,
			&section.URL,
			&section.QuestionID,
			&section.Question,
			pq.Array(&section.CorrectAnswerIDs),
			&section.Animation,
			&section.Description,
		)
		if err != nil {
			return nil, err
		}

		sections = append(sections, section)
	}

	if err := rows.Err(); err != nil {
		return nil, err
	}

	return sections, nil
}

func (r *courseRepository) CreateModule(module *models.Module) error {
	sections, err := json.Marshal(module.Sections)
	if err != nil {
		return err
	}
	err = r.db.QueryRow(
		"INSERT INTO modules (unit_id, course_id, name, description, content) VALUES ($1, $2, $3, $4, $5) RETURNING id, created_at, updated_at",
		module.UnitID, module.CourseID, module.Name, module.Description, sections,
	).Scan(&module.ID, &module.CreatedAt, &module.UpdatedAt)
	return err
}

func (r *courseRepository) UpdateModule(module *models.Module) error {
	content, err := json.Marshal(module.Sections)
	if err != nil {
		return err
	}
	_, err = r.db.Exec(
		`UPDATE modules SET 
			name = $1, 
			description = $2, 
			content = $3, 
			updated_at = 
			CURRENT_TIMESTAMP 
		WHERE id = $4`,
		module.Name, module.Description, content, module.ID,
	)
	return err
}

func (r *courseRepository) DeleteModule(id int64) error {
	_, err := r.db.Exec("DELETE FROM modules WHERE id = $1", id)
	return err
}
