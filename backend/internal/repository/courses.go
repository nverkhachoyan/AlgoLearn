package repository

import (
	"algolearn-backend/internal/config"
	"algolearn-backend/internal/models"
	"context"
	"database/sql"
	"encoding/json"
	"errors"
	"fmt"
	"time"

	"github.com/lib/pq"
)

var ErrUnitNotFound = errors.New("unit not found")

type CourseRepository interface {
	GetAllCourses(ctx context.Context) ([]models.Course, error)
	GetCourseByID(ctx context.Context, id int64) (*models.Course, error)
	CreateCourse(ctx context.Context, course *models.Course) (*models.Course, error)
	UpdateCourse(ctx context.Context, course *models.Course) (*models.Course, error)
	DeleteCourse(ctx context.Context, id int64) error
	GetAllUnits(ctx context.Context, courseID int64) ([]models.Unit, error)
	GetUnitByID(ctx context.Context, id int64) (*models.Unit, error)
	CreateUnit(ctx context.Context, unit *models.Unit) (*models.Unit, error)
	UpdateUnit(ctx context.Context, unit *models.Unit) (*models.Unit, error)
	DeleteUnit(ctx context.Context, id int64) error
	GetAllModulesPartial(ctx context.Context, unitID int64) ([]models.Module, error)
	GetAllModules(ctx context.Context, unitID int64) ([]models.Module, error)
	GetModuleByModuleID(ctx context.Context, unitID int64, moduleID int64) (*models.Module, error)
	CreateModule(ctx context.Context, module *models.Module) error
	UpdateModule(ctx context.Context, module *models.Module) error
	DeleteModule(ctx context.Context, id int64) error
}

type courseRepository struct {
	db *sql.DB
}

func NewCourseRepository(db *sql.DB) CourseRepository {
	return &courseRepository{db: db}
}

func (r *courseRepository) GetAllCourses(ctx context.Context) ([]models.Course, error) {
	rows, err := r.db.QueryContext(
		ctx,`
		SELECT
			c.id, c.created_at, c.updated_at, c.name, c.description, c.background_color,
			c.icon_url, c.duration, c.difficulty_level, c.rating, c.learners_count,
			COALESCE(jsonb_agg(DISTINCT a.name) FILTER (WHERE a.id IS NOT NULL), '[]') AS authors,
			COALESCE(jsonb_agg(DISTINCT t.name) FILTER (WHERE t.id IS NOT NULL), '[]') AS tags
		FROM
			courses c
		LEFT JOIN course_authors ca ON c.id = ca.course_id
		LEFT JOIN authors a ON ca.author_id = a.id
		LEFT JOIN course_tags ct ON c.id = ct.course_id
		LEFT JOIN tags t ON ct.tag_id = t.id
		GROUP BY c.id;`,
	)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var courses []models.Course

	for rows.Next() {
		var course models.Course
		var authors, tags []byte

		err := rows.Scan(
			&course.BaseModel.ID,
			&course.BaseModel.CreatedAt,
			&course.BaseModel.UpdatedAt,
			&course.Name,
			&course.Description,
			&course.BackgroundColor,
			&course.IconURL,
			&course.Duration,
			&course.DifficultyLevel,
			&course.Rating,
			&course.LearnersCount,
			&authors,
			&tags,
		)
		if err != nil {
			return nil, err
		}

		if err := json.Unmarshal(authors, &course.Authors); err != nil {
			return nil, err
		}
		if err := json.Unmarshal(tags, &course.Tags); err != nil {
			return nil, err
		}

		courses = append(courses, course)
	}

	if err := rows.Err(); err != nil {
		return nil, err
	}

	return courses, nil
}

func (r *courseRepository) GetCourseByID(ctx context.Context, courseID int64) (*models.Course, error) {
	query := `
		SELECT 
			c.id, c.name, c.description, c.background_color, 
			c.icon_url, c.duration, c.difficulty_level, c.rating, c.learners_count,
			COALESCE(jsonb_agg(DISTINCT a.name) FILTER (WHERE a.id IS NOT NULL), '[]') AS authors,
			COALESCE(jsonb_agg(DISTINCT t.name) FILTER (WHERE t.id IS NOT NULL), '[]') AS tags
		FROM 
			courses c
		LEFT JOIN course_authors ca ON c.id = ca.course_id
		LEFT JOIN authors a ON ca.author_id = a.id
		LEFT JOIN course_tags ct ON c.id = ct.course_id
		LEFT JOIN tags t ON ct.tag_id = t.id
		WHERE 
			c.id = $1
		GROUP BY 
			c.id;
	`

	var course models.Course
	var authors, tags []byte

	err := r.db.QueryRow(query, courseID).Scan(
		&course.ID,
		&course.Name,
		&course.Description,
		&course.BackgroundColor,
		&course.IconURL,
		&course.Duration,
		&course.DifficultyLevel,
		&course.Rating,
		&course.LearnersCount,
		&authors,
		&tags,
	)
	if err != nil {
		return nil, err
	}

	if err := json.Unmarshal(authors, &course.Authors); err != nil {
		return nil, err
	}
	if err := json.Unmarshal(tags, &course.Tags); err != nil {
		return nil, err
	}

	return &course, nil
}

func (r *courseRepository) CreateCourse(ctx context.Context, course *models.Course) (*models.Course, error) {
	tx, err := r.db.BeginTx(ctx, &sql.TxOptions{})
	if err != nil {
		return nil, err
	}
	defer func() {
		if err != nil {
			err = tx.Rollback()
			if err != nil {
				config.Log.Errorf("Failed to roll back database transaction for CreateCourse with ID = %d", course.ID)
			}
			return
		} else {
			err =tx.Commit()
			if err != nil {
				config.Log.Errorf("Failed to commit database transaction for CreateCourse with ID = %d", course.ID)
			}
		}
	}()

	var createdCourse models.Course
	err = tx.QueryRowContext(
		ctx,
		`INSERT INTO courses 
				(name, 
				description, 
				background_color, 
				icon_url, 
				duration, 
				difficulty_level, 
				rating, 
				learners_count) 
			VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
			RETURNING 
				id,
				name, 
				description, 
				background_color, 
				icon_url, 
				duration, 
				difficulty_level, 
				rating, 
				learners_count`,
		course.Name,
		course.Description,
		course.BackgroundColor,
		course.IconURL,
		course.Duration,
		course.DifficultyLevel,
		course.Rating,
		course.LearnersCount,
	).Scan(
		&createdCourse.ID,
		&createdCourse.Name,
		&createdCourse.Description,
		&createdCourse.BackgroundColor,
		&createdCourse.IconURL,
		&createdCourse.Duration,
		&createdCourse.DifficultyLevel,
		&createdCourse.Rating,
		&createdCourse.LearnersCount,
	)
	if err != nil {
		return nil, err
	}

	var tags []string
	for _, tag := range course.Tags {
		var tagID int64
		err = tx.QueryRowContext(ctx, `SELECT id FROM tags WHERE name = $1`, tag).Scan(&tagID)
		if errors.Is(err, sql.ErrNoRows) {
			err = tx.QueryRowContext(ctx, `INSERT INTO tags (name) VALUES ($1) RETURNING id`, tag).Scan(&tagID)
			if err != nil {
				return nil, err
			}
		} else if err != nil {
			return nil, err
		}

		tags = append(tags, tag)
		_, err = tx.ExecContext(ctx, `INSERT INTO course_tags (course_id, tag_id) VALUES ($1, $2)`, createdCourse.ID, tagID)
		if err != nil {
			return nil, err
		}
	}

	createdCourse.Tags = course.Tags

	return &createdCourse, nil
}

func (r *courseRepository) UpdateCourse(ctx context.Context, course *models.Course) (*models.Course, error) {
    tx, err := r.db.BeginTx(ctx, &sql.TxOptions{})
    if err != nil {
        return nil, err
    }
    defer func() {
        if err != nil {
            if rollbackErr := tx.Rollback(); rollbackErr != nil {
                config.Log.Errorf("failed to roll back database transaction for UpdateCourse with ID = %d. %v", course.ID, rollbackErr)
            }
            return
        } else {
            if commitErr := tx.Commit(); commitErr != nil {
                config.Log.Errorf("failed to commit database transaction for UpdateCourse with ID = %d. %v", course.ID, commitErr)
                err = commitErr
            }
        }
    }()

    updateCourseQuery := `UPDATE courses SET
        name = COALESCE($1, name),
        description = COALESCE($2, description),
        background_color = COALESCE($3, background_color),
        icon_url = COALESCE($4, icon_url),
        duration = COALESCE($5, duration),
        difficulty_level = COALESCE($6::difficulty_level, difficulty_level),
        rating = COALESCE($7, rating),
        learners_count = COALESCE($8, learners_count),
        updated_at = CURRENT_TIMESTAMP
    WHERE id = $9;`

    _, err = tx.ExecContext(ctx, updateCourseQuery,
        course.Name,
        course.Description,
        course.BackgroundColor,
        course.IconURL,
        course.Duration,
        course.DifficultyLevel,
        course.Rating,
        course.LearnersCount,
        course.ID,
    )
    if err != nil {
        return nil, fmt.Errorf("failed to update course ID %d: %v", course.ID, err)
    }

    if len(course.Tags) > 0 {
        _, err = tx.ExecContext(ctx, `DELETE FROM course_tags WHERE course_id = $1`, course.ID)
        if err != nil {
            return nil, err
        }

        for _, tag := range course.Tags {
            var tagID int64
            err = tx.QueryRowContext(ctx, `SELECT id FROM tags WHERE name = $1`, tag).Scan(&tagID)
            if errors.Is(err, sql.ErrNoRows) {
                err = tx.QueryRowContext(ctx, `INSERT INTO tags (name) VALUES ($1) RETURNING id`, tag).Scan(&tagID)
                if err != nil {
                    return nil, err
                }
            } else if err != nil {
                return nil, err
            }

            _, err = tx.ExecContext(ctx, `INSERT INTO course_tags (course_id, tag_id) VALUES ($1, $2)`, course.ID, tagID)
            if err != nil {
                return nil, err
            }
        }
    }

    if len(course.Authors) > 0 {
        _, err = tx.ExecContext(ctx, `DELETE FROM course_authors WHERE course_id = $1`, course.ID)
        if err != nil {
            return nil, err
        }

        for _, author := range course.Authors {
            var authorID int64
            err = tx.QueryRowContext(ctx, `SELECT id FROM authors WHERE name = $1`, author).Scan(&authorID)
            if errors.Is(err, sql.ErrNoRows) {
                err = tx.QueryRowContext(ctx, `INSERT INTO authors (name) VALUES ($1) RETURNING id`, author).Scan(&authorID)
                if err != nil {
                    return nil, err
                }
            } else if err != nil {
                return nil, err
            }

            _, err = tx.ExecContext(ctx, `INSERT INTO course_authors (course_id, author_id) VALUES ($1, $2)`, course.ID, authorID)
            if err != nil {
                return nil, err
            }
        }
    }

    var updatedCourse models.Course
    var tagsJSON, authorsJSON []byte
    query := `
    SELECT
        c.id,
        c.name,
        c.description,
        c.background_color,
        c.icon_url,
        c.duration,
        c.difficulty_level,
        c.rating,
        c.learners_count,
        COALESCE(json_agg(DISTINCT t.name) FILTER (WHERE t.name IS NOT NULL), '[]') AS tags,
        COALESCE(json_agg(DISTINCT a.name) FILTER (WHERE a.name IS NOT NULL), '[]') AS authors
    FROM courses c
    LEFT JOIN course_tags ct ON c.id = ct.course_id
    LEFT JOIN tags t ON ct.tag_id = t.id
    LEFT JOIN course_authors ca ON c.id = ca.course_id
    LEFT JOIN authors a ON ca.author_id = a.id
    WHERE c.id = $1
    GROUP BY c.id;
    `

    row := tx.QueryRowContext(ctx, query, course.ID)
    err = row.Scan(
        &updatedCourse.ID,
        &updatedCourse.Name,
        &updatedCourse.Description,
        &updatedCourse.BackgroundColor,
        &updatedCourse.IconURL,
        &updatedCourse.Duration,
        &updatedCourse.DifficultyLevel,
        &updatedCourse.Rating,
        &updatedCourse.LearnersCount,
        &tagsJSON,
        &authorsJSON,
    )
    if err != nil {
        return nil, err
    }

    err = json.Unmarshal(tagsJSON, &updatedCourse.Tags)
    if err != nil {
        return nil, err
    }

    err = json.Unmarshal(authorsJSON, &updatedCourse.Authors)
    if err != nil {
        return nil, err
    }

    return &updatedCourse, nil
}


func (r *courseRepository) DeleteCourse(ctx context.Context, id int64) error {
	_, err := r.db.Exec("DELETE FROM courses WHERE id = $1", id)
	return err
}

// *****************
// **** UNITS ****
// *****************

func (r *courseRepository) GetAllUnits(ctx context.Context, courseID int64) ([]models.Unit, error) {
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

func (r *courseRepository) GetUnitByID(ctx context.Context, id int64) (*models.Unit, error) {
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
	if errors.Is(err, sql.ErrNoRows) {
		return nil, ErrUnitNotFound
	} else if err != nil {
		return nil, err
	}

	return &unit, nil
}

func (r *courseRepository) CreateUnit(ctx context.Context, unit *models.Unit) (*models.Unit, error) {
	var newUnit models.Unit
	err := r.db.QueryRowContext(ctx,
`INSERT INTO units (course_id, name, description)
		VALUES ($1, $2, $3)
		RETURNING
			id,
			created_at,
			updated_at,
			course_id,
			name,
			description;
		`,
		unit.CourseID, unit.Name, unit.Description,
		).Scan(
		&newUnit.ID,
		&newUnit.CreatedAt,
		&newUnit.UpdatedAt,
		&newUnit.CourseID,
		&newUnit.Name,
		&newUnit.Description,
		)
	if err != nil {
		return nil, err
	}

	return &newUnit, nil
}

func (r *courseRepository) UpdateUnit(ctx context.Context, unit *models.Unit) (*models.Unit, error) {
	var newUnit models.Unit
	row := r.db.QueryRowContext(ctx,
`UPDATE units
		SET name = $1, description = $2, updated_at = CURRENT_TIMESTAMP
		WHERE id = $3
		RETURNING
			id,
			created_at,
			updated_at,
			course_id,
			name,
			description;
		`,
		unit.Name, unit.Description, unit.ID,).Scan(
			&newUnit.ID,
			&newUnit.CreatedAt,
			&newUnit.UpdatedAt,
			&newUnit.CourseID,
			&newUnit.Name,
			&newUnit.Description,
			)

	if errors.Is(row, sql.ErrNoRows) {
		return nil, ErrUnitNotFound
	}

	return &newUnit, nil
}

func (r *courseRepository) DeleteUnit(ctx context.Context, id int64) error {
	_, err := r.db.Exec("DELETE FROM units WHERE id = $1", id)
	return err
}

// ********************
// **** MODULES ****
// ********************

func (r *courseRepository) GetAllModulesPartial(ctx context.Context, unitID int64) ([]models.Module, error) {
	rows, err := r.db.Query(`
	SELECT 	id, 
		  	created_at, 
			updated_at, 
			unit_id, 
			course_id, 
			name, 
			description 
	FROM modules WHERE unit_id = $1`,
		unitID)
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

func (r *courseRepository) GetAllModules(ctx context.Context, unitID int64) ([]models.Module, error) {
	rows, err := r.db.Query(`
	SELECT 
		m.id AS module_id,
		m.created_at AS module_created_at,
		m.updated_at AS module_updated_at,
		m.unit_id,
		m.course_id,
		m.name AS module_name,
		m.description AS module_description,
		s.id AS section_id,
		s.type,
		s.position,
		s.content,
		s.question_id,
		s.question,
		s.user_answer_id,
		s.correct_answer_ids,
		s.url,
		s.animation,
		s.description AS section_description
	FROM 
		modules m
	LEFT JOIN 
		sections s ON m.id = s.module_id
	WHERE 
		m.unit_id = $1
	ORDER BY m.id, s.position;`, unitID)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var modulesMap = make(map[int64]models.Module)
	for rows.Next() {
		var (
			moduleID          int64
			createdAt         time.Time
			updatedAt         time.Time
			unitID            int64
			courseID          int64
			moduleName        string
			moduleDescription string
			section           models.Section
			sectionID         sql.NullInt64
		)

		err := rows.Scan(
			&moduleID,
			&createdAt,
			&updatedAt,
			&unitID,
			&courseID,
			&moduleName,
			&moduleDescription,
			&sectionID,
			&section.Type,
			&section.Position,
			&section.Content,
			&section.QuestionID,
			&section.Question,
			&section.UserAnswerID,
			pq.Array(&section.CorrectAnswerIDs),
			&section.URL,
			&section.Animation,
			&section.Description,
		)
		if err != nil {
			return nil, err
		}

		module, exists := modulesMap[moduleID]
		if !exists {
			module = models.Module{
				BaseModel: models.BaseModel{
					ID:        moduleID,
					CreatedAt: createdAt,
					UpdatedAt: updatedAt,
				},
				UnitID:      unitID,
				CourseID:    courseID,
				Name:        moduleName,
				Description: moduleDescription,
				Sections:    []models.Section{},
			}
		}

		if sectionID.Valid {
			section.ID = sectionID.Int64
			module.Sections = append(module.Sections, section)
		}

		modulesMap[moduleID] = module
	}

	if err := rows.Err(); err != nil {
		return nil, err
	}

	var modules []models.Module
	for _, module := range modulesMap {
		modules = append(modules, module)
	}

	return modules, nil
}

// func (r *courseRepository) GetModuleByID(id int64) (*models.Module, error) {
// 	row := r.db.QueryRow("SELECT id, created_at, updated_at, unit_id, course_id, name, description, content FROM modules WHERE id = $1", id)

// 	var module models.Module
// 	var content []byte
// 	err := row.Scan(
// 		&module.ID,
// 		&module.CreatedAt,
// 		&module.UpdatedAt,
// 		&module.UnitID,
// 		&module.CourseID,
// 		&module.Name,
// 		&module.Description,
// 		&content,
// 	)
// 	if err != nil {
// 		return nil, err
// 	}

// 	sections, err := r.GetSectionsByModuleID(int(module.ID))
// 	if err != nil {
// 		return nil, err
// 	}
// 	module.Sections = sections

// 	return &module, nil
// }

func (r *courseRepository) GetModuleByModuleID(ctx context.Context, unitID int64, moduleID int64) (*models.Module, error) {
	rows, err := r.db.Query(`
	SELECT 
		m.id AS module_id,
		m.created_at AS module_created_at,
		m.updated_at AS module_updated_at,
		m.unit_id,
		m.course_id,
		m.name AS module_name,
		m.description AS module_description,
		s.id AS section_id,
		s.type,
		s.position,
		s.content,
		s.question_id,
		s.question,
		s.user_answer_id,
		s.correct_answer_ids,
		s.url,
		s.animation,
		s.description AS section_description
	FROM 
		modules m
	LEFT JOIN 
		sections s ON m.id = s.module_id
	WHERE 
		m.unit_id = $1 AND m.id = $2
	ORDER BY m.id, s.position;`, unitID, moduleID)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var module *models.Module
	for rows.Next() {
		var (
			section   models.Section
			sectionID sql.NullInt64
		)

		err := rows.Scan(
			&module.BaseModel.ID,
			&module.BaseModel.CreatedAt,
			&module.BaseModel.UpdatedAt,
			&module.UnitID,
			&module.CourseID,
			&module.Name,
			&module.Description,
			&sectionID,
			&section.Type,
			&section.Position,
			&section.Content,
			&section.QuestionID,
			&section.Question,
			&section.UserAnswerID,
			pq.Array(&section.CorrectAnswerIDs),
			&section.URL,
			&section.Animation,
			&section.Description,
		)
		if err != nil {
			return nil, err
		}

		if module == nil {
			module = &models.Module{
				BaseModel: models.BaseModel{
					ID:        module.BaseModel.ID,
					CreatedAt: module.BaseModel.CreatedAt,
					UpdatedAt: module.BaseModel.UpdatedAt,
				},
				UnitID:      module.UnitID,
				CourseID:    module.CourseID,
				Name:        module.Name,
				Description: module.Description,
				Sections:    []models.Section{},
			}
		}

		if sectionID.Valid {
			section.ID = sectionID.Int64
			module.Sections = append(module.Sections, section)
		}
	}

	if err := rows.Err(); err != nil {
		return nil, err
	}

	if module == nil {
		return nil, sql.ErrNoRows
	}

	return module, nil
}

func (r *courseRepository) GetSectionsByModuleID(ctx context.Context, moduleID int) ([]models.Section, error) {
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

func (r *courseRepository) CreateModule(ctx context.Context, module *models.Module) error {
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

func (r *courseRepository) UpdateModule(ctx context.Context, module *models.Module) error {
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

func (r *courseRepository) DeleteModule(ctx context.Context, id int64) error {
	_, err := r.db.Exec("DELETE FROM modules WHERE id = $1", id)
	return err
}
