package repository

import (
	codes "algolearn/internal/errors"
	"algolearn/internal/models"
	"algolearn/pkg/logger"
	"context"
	"database/sql"
	"encoding/json"
	"errors"
	"fmt"
)

type CourseRepository interface {
	GetCourses(ctx context.Context, expand []string) ([]models.Course, error)
	GetCourseByID(ctx context.Context, expand []string, id int64) (*models.Course, error)
	CreateCourse(ctx context.Context, course *models.Course) (*models.Course, error)
	UpdateCourse(ctx context.Context, course *models.Course) (*models.Course, error)
	DeleteCourse(ctx context.Context, id int64) error
	GetCourseProgressSummary(ctx context.Context, userID int64, courseID int64) (*models.Course, error)
	GetCourseProgressFull(ctx context.Context, userID int64, courseID int64) (*models.Course, error)
	GetCoursesProgressSummary(ctx context.Context, page int, pageSize int, userID int64, queryFilter string) (int64, []models.Course, error)
}

type courseRepository struct {
	db *sql.DB
}

func NewCourseRepository(db *sql.DB) CourseRepository {
	return &courseRepository{db: db}
}

func (r *courseRepository) GetCourses(ctx context.Context, expand []string) ([]models.Course, error) {
	switch {
	case containsAll(expand, "units", "modules"):
		return r.getCoursesWithUnitsModules(ctx)
	case contains(expand, "units"):
		return r.getCoursesWithUnits(ctx)
	default:
		return r.getCourses(ctx)
	}
}

func (r *courseRepository) getCourses(ctx context.Context) ([]models.Course, error) {
	log := logger.Get()
	rows, err := r.db.QueryContext(
		ctx, `
		SELECT
			c.id, c.created_at, c.updated_at, c.name, c.description, c.background_color,
			c.icon_url, c.duration, c.difficulty_level, c.rating,
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
	defer func(rows *sql.Rows) {
		err := rows.Close()
		if err != nil {
			log.Errorf("failed to close rows in repo func GetAllCourses")
		}
	}(rows)

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

func (r *courseRepository) getCoursesWithUnits(ctx context.Context) ([]models.Course, error) {
	log := logger.Get().WithBaseFields(logger.Repository, "getCoursesWithUnits")
	log.Info("querying courses with units")

	query := `
	SELECT
	c.*,
	COALESCE(
		(
		SELECT json_agg(
		json_build_object(
		'id', a.id,
		'name', a.name
		)
		)
		FROM course_authors ca
		LEFT JOIN authors a ON a.id = ca.author_id
		WHERE c.id = ca.course_id
		), '[]'::json
	) AS authors,
	COALESCE(
		(
		SELECT json_agg(
		json_build_object(
		'id', t.id,
		'name', t.name
		)
		) FROM course_tags ct
		  LEFT JOIN tags t ON ct.tag_id = t.id
		  WHERE c.id = ct.course_id
		), '[]'::json
	) AS tags,
	COALESCE(
		(
		SELECT json_agg(
		json_build_object(
			'id', u.id,
			'created_at', u.created_at,
			'updated_at', u.updated_at,
			'course_id', u.course_id,
			'name', u.name,
			'description', u.description
		))
		FROM units u
		WHERE u.course_id = c.id
		), '[]'::json
	) AS units
	FROM courses c;`

	var courses []models.Course
	rows, err := r.db.QueryContext(ctx, query)
	if err != nil {
		return nil, fmt.Errorf("failed to query courses: %w", err)
	}

	for rows.Next() {
		var course models.Course
		var authors []byte
		var tags []byte
		var units []byte

		err = rows.Scan(
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
			&authors,
			&tags,
			&units,
		)
		if err != nil {
			return nil, fmt.Errorf("failed to scan course: %w", err)
		}

		if err := json.Unmarshal(authors, &course.Authors); err != nil {
			return nil, fmt.Errorf("failed to unmarshal authors: %w", err)
		}

		if err := json.Unmarshal(tags, &course.Tags); err != nil {
			return nil, fmt.Errorf("failed to unmarshal authors: %w", err)
		}

		if err := json.Unmarshal(units, &course.Units); err != nil {
			return nil, fmt.Errorf("failed to unmarshal authors: %w", err)
		}

		courses = append(courses, course)
	}

	return courses, nil
}

func (r *courseRepository) getCoursesWithUnitsModules(ctx context.Context) ([]models.Course, error) {
	log := logger.Get().WithBaseFields(logger.Repository, "getCoursesWithUnits")
	log.Info("querying courses with units")

	query := `
	SELECT
	c.*,
	COALESCE(
		(
		SELECT json_agg(
		json_build_object(
		'id', a.id,
		'name', a.name
		)
		)
		FROM course_authors ca
		LEFT JOIN authors a ON a.id = ca.author_id
		WHERE c.id = ca.course_id
		), '[]'::json
	) AS authors,
	COALESCE(
		(
		SELECT json_agg(
		json_build_object(
		'id', t.id,
		'name', t.name
		)
		) FROM course_tags ct
		  LEFT JOIN tags t ON ct.tag_id = t.id
		  WHERE c.id = ct.course_id
		), '[]'::json
	) AS tags,
	COALESCE(
		(
		SELECT json_agg(
		json_build_object(
			'id', u.id,
			'created_at', u.created_at,
			'updated_at', u.updated_at,
			'course_id', u.course_id,
			'name', u.name,
			'description', u.description,
			'modules', COALESCE((
				SELECT json_agg(
				json_build_object(
					'id', m.id,
					'created_at', m.created_at,
					'name', m.name
				))
				FROM modules m
				WHERE m.unit_id = u.id
			), '[]'::json )
		))
		FROM units u
		WHERE u.course_id = c.id
		), '[]'::json
	) AS units
	FROM courses c`

	var courses []models.Course
	rows, err := r.db.QueryContext(ctx, query)
	if err != nil {
		return nil, fmt.Errorf("failed to query courses: %w", err)
	}

	for rows.Next() {
		var course models.Course
		var authors []byte
		var tags []byte
		var units []byte

		err = rows.Scan(
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
			&authors,
			&tags,
			&units,
		)
		if err != nil {
			return nil, fmt.Errorf("failed to scan course: %w", err)
		}

		if err := json.Unmarshal(authors, &course.Authors); err != nil {
			return nil, fmt.Errorf("failed to unmarshal authors: %w", err)
		}

		if err := json.Unmarshal(tags, &course.Tags); err != nil {
			return nil, fmt.Errorf("failed to unmarshal authors: %w", err)
		}

		if err := json.Unmarshal(units, &course.Units); err != nil {
			return nil, fmt.Errorf("failed to unmarshal authors: %w", err)
		}

		courses = append(courses, course)
	}

	return courses, nil
}

func (r *courseRepository) GetCourseByID(ctx context.Context, expand []string, courseID int64) (*models.Course, error) {
	switch {
	case containsAll(expand, "units", "modules"):
		return r.getCourseByIDWithUnitsModules(ctx, courseID)
	case contains(expand, "units"):
		return r.getCourseByIDWithUnits(ctx, courseID)
	default:
		return r.getCourseByID(ctx, courseID)
	}
}

func (r *courseRepository) getCourseByID(_ context.Context, courseID int64) (*models.Course, error) {
	query := `
		SELECT
			c.id, c.name, c.description, c.background_color,
			c.icon_url, c.duration, c.difficulty_level, c.rating,
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
		&authors,
		&tags,
	)
	if errors.Is(err, sql.ErrNoRows) {
		return nil, codes.ErrNotFound
	} else if err != nil {
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

func (r *courseRepository) getCourseByIDWithUnits(_ context.Context, courseID int64) (*models.Course, error) {
	logger.Get().
		WithBaseFields(logger.Repository, "getCourseByIDWithUnits").
		WithField("course_id", courseID).Debug("querying course with units")

	query := `
    SELECT
        c.*,
        COALESCE(
            (
                SELECT json_agg(json_build_object(
                    'id', a.id,
                    'name', a.name
                ))
                FROM course_authors ca
                JOIN authors a ON ca.author_id = a.id
                WHERE ca.course_id = c.id
            ), '[]'::json
        ) as authors,
        COALESCE(
            (
                SELECT json_agg(json_build_object(
						'id', t.id,
						'name', t.name
			))
                FROM course_tags ct
                JOIN tags t ON ct.tag_id = t.id
                WHERE ct.course_id = c.id
            ), '[]'::json
        ) as tags,
        COALESCE(
            (
                SELECT json_agg(json_build_object(
                    'id', u.id,
                    'created_at', u.created_at,
                    'updated_at', u.updated_at,
                    'course_id', u.course_id,
                    'name', u.name,
                    'description', u.description
                ))
                FROM units u
                WHERE u.course_id = c.id
            ), '[]'::json
        ) as units
    FROM courses c
    WHERE c.id = $1`

	var course models.Course
	var (
		authorsJSON []byte
		tagsJSON    []byte
		unitsJSON   []byte
	)

	err := r.db.QueryRow(query, courseID).Scan(
		&course.ID,
		&course.CreatedAt,
		&course.UpdatedAt,
		&course.Name,
		&course.Description,
		&course.BackgroundColor,
		&course.IconURL,
		&course.Duration,
		&course.DifficultyLevel,
		&course.Rating,
		&authorsJSON,
		&tagsJSON,
		&unitsJSON,
	)
	if errors.Is(err, sql.ErrNoRows) {
		return nil, codes.ErrNotFound
	} else if err != nil {
		return nil, fmt.Errorf("failed to scan course: %w", err)
	}

	if err := json.Unmarshal(authorsJSON, &course.Authors); err != nil {
		return nil, fmt.Errorf("failed to unmarshal authors: %w", err)
	}

	if err := json.Unmarshal(tagsJSON, &course.Tags); err != nil {
		return nil, fmt.Errorf("failed to unmarshal tags: %w", err)
	}

	if err := json.Unmarshal(unitsJSON, &course.Units); err != nil {
		return nil, fmt.Errorf("failed to unmarshal units: %w", err)
	}

	return &course, nil
}

func (r *courseRepository) getCourseByIDWithUnitsModules(_ context.Context, courseID int64) (*models.Course, error) {
	logger.Get().
		WithBaseFields(logger.Repository, "getCourseByIDWithUnitsModules").
		WithField("course_id", courseID).Debug("querying course with units.modules")

	query := `
	SELECT
	    c.*,
	    COALESCE(
	        (
	            SELECT json_agg(json_build_object(
	                'id', a.id,
	                'name', a.name
	            ))
	            FROM course_authors ca
	            JOIN authors a ON ca.author_id = a.id
	            WHERE ca.course_id = c.id
	        ), '[]'::json
	    ) as authors,
	    COALESCE(
	        (
	            SELECT json_agg(json_build_object(
	                'id', t.id,
	                'name', t.name
	            ))
	            FROM course_tags ct
	            JOIN tags t ON ct.tag_id = t.id
	            WHERE ct.course_id = c.id
	        ), '[]'::json
	    ) as tags,
	    COALESCE(
	        (
	            SELECT json_agg(json_build_object(
	                'id', u.id,
	                'created_at', u.created_at,
	                'updated_at', u.updated_at,
	                'course_id', u.course_id,
	                'name', u.name,
	                'description', u.description,
	                'modules', (
	                    SELECT COALESCE(
	                        json_agg(
	                            json_build_object(
	                                'id', m.id,
	                                'created_at', m.created_at,
	                                'updated_at', m.updated_at,
	                                'unit_id', m.unit_id,
	                                'name', m.name,
	                                'description', m.description
	                            ) ORDER BY m.id
	                        ),
	                        '[]'::json
	                    )
	                    FROM modules m
	                    WHERE m.unit_id = u.id
	                )
	            ) ORDER BY u.id)
	            FROM units u
	            WHERE u.course_id = c.id
	        ), '[]'::json
	    ) as units
	FROM courses c
	WHERE c.id = $1`

	var course models.Course
	var (
		authorsJSON []byte
		tagsJSON    []byte
		unitsJSON   []byte
	)

	err := r.db.QueryRow(query, courseID).Scan(
		&course.ID,
		&course.CreatedAt,
		&course.UpdatedAt,
		&course.Name,
		&course.Description,
		&course.BackgroundColor,
		&course.IconURL,
		&course.Duration,
		&course.DifficultyLevel,
		&course.Rating,
		&authorsJSON,
		&tagsJSON,
		&unitsJSON,
	)
	if errors.Is(err, sql.ErrNoRows) {
		return nil, codes.ErrNotFound
	} else if err != nil {
		return nil, fmt.Errorf("failed to scan course: %w", err)
	}

	if err := json.Unmarshal(authorsJSON, &course.Authors); err != nil {
		return nil, fmt.Errorf("failed to unmarshal authors: %w", err)
	}

	if err := json.Unmarshal(tagsJSON, &course.Tags); err != nil {
		return nil, fmt.Errorf("failed to unmarshal tags: %w", err)
	}

	if err := json.Unmarshal(unitsJSON, &course.Units); err != nil {
		return nil, fmt.Errorf("failed to unmarshal units: %w", err)
	}

	return &course, nil
}

// CreateCourse TODO: fix tags

func (r *courseRepository) CreateCourse(ctx context.Context, course *models.Course) (*models.Course, error) {
	log := logger.Get()
	tx, err := r.db.BeginTx(ctx, &sql.TxOptions{})
	if err != nil {
		return nil, err
	}
	defer func() {
		if err != nil {
			err = tx.Rollback()
			if err != nil {
				log.Errorf("Failed to roll back database transaction for CreateCourse with ID = %d", course.ID)
			}
			return
		} else {
			err = tx.Commit()
			if err != nil {
				log.Errorf("Failed to commit database transaction for CreateCourse with ID = %d", course.ID)
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
				rating`,
		course.Name,
		course.Description,
		course.BackgroundColor,
		course.IconURL,
		course.Duration,
		course.DifficultyLevel,
		course.Rating,
	).Scan(
		&createdCourse.ID,
		&createdCourse.Name,
		&createdCourse.Description,
		&createdCourse.BackgroundColor,
		&createdCourse.IconURL,
		&createdCourse.Duration,
		&createdCourse.DifficultyLevel,
		&createdCourse.Rating,
	)
	if err != nil {
		return nil, err
	}

	//	var tags []string
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

		//		tags = append(tags, tag)
		_, err = tx.ExecContext(ctx, `INSERT INTO course_tags (course_id, tag_id) VALUES ($1, $2)`, createdCourse.ID, tagID)
		if err != nil {
			return nil, err
		}
	}

	createdCourse.Tags = course.Tags

	return &createdCourse, nil
}

func (r *courseRepository) UpdateCourse(ctx context.Context, course *models.Course) (*models.Course, error) {
	log := logger.Get()
	tx, err := r.db.BeginTx(ctx, &sql.TxOptions{})
	if err != nil {
		return nil, err
	}
	defer func() {
		if err != nil {
			if rollbackErr := tx.Rollback(); rollbackErr != nil {
				log.Errorf("failed to roll back database transaction for UpdateCourse with ID = %d. %v", course.ID, rollbackErr)
			}
			return
		} else {
			if commitErr := tx.Commit(); commitErr != nil {
				log.Errorf("failed to commit database transaction for UpdateCourse with ID = %d. %v", course.ID, commitErr)
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
        updated_at = CURRENT_TIMESTAMP
    WHERE id = $8;`

	var difficultyLevel sql.NullString
	if course.DifficultyLevel == "" {
		difficultyLevel = sql.NullString{
			String: "",
			Valid:  false,
		}
	} else {
		difficultyLevel = sql.NullString{
			String: string(course.DifficultyLevel),
			Valid:  true,
		}
	}

	_, err = tx.ExecContext(ctx, updateCourseQuery,
		course.Name,
		course.Description,
		course.BackgroundColor,
		course.IconURL,
		course.Duration,
		difficultyLevel,
		course.Rating,
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

func (r *courseRepository) DeleteCourse(_ context.Context, id int64) error {
	result, err := r.db.Exec("DELETE FROM courses WHERE id = $1;", id)
	if err != nil {
		return err
	}

	rowsAffected, err := result.RowsAffected()
	if err != nil {
		return err
	}

	if rowsAffected == 0 {
		return codes.ErrNotFound
	}

	return nil
}

// *********
// WITH PROGRESS
// *********

func (r *courseRepository) GetCoursesProgressSummary(ctx context.Context, page int, pageSize int, userID int64, queryFilter string) (int64, []models.Course, error) {
	log := logger.Get().WithBaseFields(logger.Repository, "GetCoursesProgress")

	offset := (page - 1) * pageSize
	var totalCount int64

	filterClause := ""
	switch queryFilter {
	case "learning":
		filterClause = "WHERE (uc.current_unit_id IS NOT NULL OR uc.current_module_id IS NOT NULL) AND uc.user_id = $1"
	case "explore":
		filterClause = "WHERE (uc.current_unit_id IS NULL AND uc.current_module_id IS NULL OR uc.user_id != $1 OR uc.user_id IS NULL)"
	default:
		// No filter, return all courses
		filterClause = "WHERE true"
	}

	query := fmt.Sprintf(`
	SELECT DISTINCT ON (c.id)
	   COUNT(*) OVER() AS total_count,
       c.id,
       c.created_at,
       c.updated_at,
       c.name,
       c.description,
	   NULLIF(c.requirements, ''),
       NULLIF(c.what_you_learn, ''),
       COALESCE(c.background_color, ''),
       COALESCE(c.icon_url, ''),
       c.duration,
       c.difficulty_level,
       COALESCE((SELECT json_agg(jsonb_build_object(
                          'id', ca.author_id,
                          'name', a.name
                                   ))
                FROM course_authors ca
                 LEFT JOIN authors a ON a.id = ca.author_id
                 WHERE ca.course_id = c.id
       ), '[]'::json) AS authors,
       COALESCE((SELECT json_agg(jsonb_build_object(
                                'id', t.id,
                                'name', t.name
                                ))
         FROM course_tags ct
                 LEFT JOIN tags t ON t.id = ct.tag_id
                 WHERE ct.course_id = c.id
       ), '[]'::json) AS tags,
       	c.rating,
	   	NULLIF(u.id, 0) AS unit_id,
		u.created_at AS unit_created_at,
		u.updated_at AS unit_updated_at,
		u.unit_number AS unit_number,
		NULLIF(u.name, '') AS unit_name,
		NULLIF(u.description, '') AS unit_description,
		NULLIF(m.id, 0) AS module_id,
		m.created_at AS module_created_at,
		m.updated_at AS module_updated_at,
		m.module_number AS module_number,
		NULLIF(m.unit_id, 0) AS module_unit_id,
		NULLIF(m.name, '') AS module_name,
		NULLIF(m.description, '') AS module_description
	FROM courses c
	LEFT JOIN user_courses uc ON uc.course_id = c.id AND uc.user_id = $1
	LEFT JOIN units u ON u.id = uc.current_unit_id
	LEFT JOIN modules m ON m.id = uc.current_module_id
	%s
	ORDER BY c.id, uc.updated_at DESC
	LIMIT $2 OFFSET $3`, filterClause)

	rows, err := r.db.QueryContext(ctx, query, userID, pageSize, offset)
	if err != nil {
		log.WithError(err).Errorf("failed to get courses progress")
		return 0, nil, err
	}
	defer rows.Close()

	var courses []models.Course
	for rows.Next() {
		var course models.Course
		var authors, tags []byte

		var (
			backgroundColor sql.NullString
			iconURL         sql.NullString
			unitID          sql.NullInt64
			unitCreatedAt   sql.NullTime
			unitUpdatedAt   sql.NullTime
			unitNumber      sql.NullInt16
			unitName        sql.NullString
			unitDesc        sql.NullString
			moduleID        sql.NullInt64
			moduleCreatedAt sql.NullTime
			moduleUpdatedAt sql.NullTime
			moduleNumber    sql.NullInt16
			moduleUnitID    sql.NullInt64
			moduleName      sql.NullString
			moduleDesc      sql.NullString
		)

		err = rows.Scan(
			&totalCount,
			&course.ID,
			&course.CreatedAt,
			&course.UpdatedAt,
			&course.Name,
			&course.Description,
			&course.Requirements,
			&course.WhatYouLearn,
			&backgroundColor,
			&iconURL,
			&course.Duration,
			&course.DifficultyLevel,
			&authors,
			&tags,
			&course.Rating,
			&unitID,
			&unitCreatedAt,
			&unitUpdatedAt,
			&unitNumber,
			&unitName,
			&unitDesc,
			&moduleID,
			&moduleCreatedAt,
			&moduleUpdatedAt,
			&moduleNumber,
			&moduleUnitID,
			&moduleName,
			&moduleDesc,
		)
		if err != nil {
			log.WithError(err).Errorf("failed to scan courses progress")
			return 0, nil, fmt.Errorf("failed to scan courses progress: %w", err)
		}

		course.BackgroundColor = backgroundColor.String
		course.IconURL = iconURL.String

		if !unitID.Valid {
			course.CurrentUnit = nil
		} else {
			course.CurrentUnit = &models.Unit{
				BaseModel: models.BaseModel{
					ID:        unitID.Int64,
					CreatedAt: unitCreatedAt.Time,
					UpdatedAt: unitUpdatedAt.Time,
				},
				UnitNumber:  unitNumber.Int16,
				Name:        unitName.String,
				Description: unitDesc.String,
			}
		}

		if !moduleID.Valid {
			course.CurrentModule = nil
		} else {
			course.CurrentModule = &models.Module{
				BaseModel: models.BaseModel{
					ID:        moduleID.Int64,
					CreatedAt: moduleCreatedAt.Time,
					UpdatedAt: moduleUpdatedAt.Time,
				},
				ModuleNumber: moduleNumber.Int16,
				ModuleUnitID: moduleUnitID.Int64,
				Name:         moduleName.String,
				Description:  moduleDesc.String,
			}
		}

		if len(authors) > 0 {
			if err = json.Unmarshal(authors, &course.Authors); err != nil {
				log.WithError(err).Errorf("failed to unmarshal authors")
				return 0, nil, fmt.Errorf("failed to unmarshal authors: %w", err)
			}
		}

		if len(tags) > 0 {
			if err = json.Unmarshal(tags, &course.Tags); err != nil {
				log.WithError(err).Errorf("failed to unmarshal tags")
				return 0, nil, fmt.Errorf("failed to unmarshal tags: %w", err)
			}
		}

		courses = append(courses, course)
	}

	if err = rows.Err(); err != nil {
		log.WithError(err).Errorf("error with queried rows")
		return 0, nil, fmt.Errorf("error with queried rows: %w", err)
	}

	return totalCount, courses, nil
}

func (r *courseRepository) GetCourseProgressSummary(ctx context.Context, userID int64, courseID int64) (*models.Course, error) {
	log := logger.Get().WithBaseFields(logger.Repository, "GetCourseProgress")

	var course models.Course
	var authors, tags, currentUnit, currentModule, units []byte

	var (
		backgroundColor sql.NullString
		iconURL         sql.NullString
	)

	err := r.db.QueryRowContext(ctx, `
SELECT DISTINCT ON (c.id)
    c.id,
    c.created_at,
    c.updated_at,
    c.name,
    c.description,
    NULLIF(c.requirements, ''),
    NULLIF(c.what_you_learn, ''),
    NULLIF(c.background_color, '') AS background_color,
    NULLIF(c.icon_url, '') AS icon_url,
    c.duration,
    c.difficulty_level,
    COALESCE((SELECT json_agg(jsonb_build_object(
            'id', ca.author_id,
            'name', a.name))
              FROM course_authors ca
              LEFT JOIN authors a ON a.id = ca.author_id
              WHERE ca.course_id = c.id
             ), '[]'::json) AS authors,
    COALESCE((SELECT json_agg(jsonb_build_object(
            'id', t.id,
            'name', t.name))
              FROM course_tags ct
              LEFT JOIN tags t ON t.id = ct.tag_id
              WHERE ct.course_id = c.id
             ), '[]'::json) AS tags,
    c.rating,
    jsonb_build_object(
            'id', u.id,
            'created_at', u.created_at,
            'updated_at', u.updated_at,
            'unit_number', u.unit_number,
            'name', u.name,
            'description', u.description
    ) AS current_unit,
    jsonb_build_object(
            'id', m.id,
            'created_at', m.created_at,
            'updated_at', m.updated_at,
            'module_number', m.module_number,
            'unit_id', m.unit_id,
            'name', m.name,
            'description', m.description,
            'progress', ump.progress,
            'status', ump.status
    ) AS current_module,
    COALESCE((SELECT jsonb_agg(
    jsonb_build_object(
    'id', sub_u.id,
    'created_at', sub_u.created_at,
    'updated_at', sub_u.updated_at,
    'unit_number', sub_u.unit_number,
    'course_id', sub_u.course_id,
    'name', sub_u.name,
    'description', sub_u.description,
    'modules', COALESCE((SELECT
                jsonb_agg(
                    jsonb_build_object(
                        'id', sub_m.id,
                        'created_at', sub_m.created_at,
                        'updated_at', sub_m.updated_at,
                        'module_number', sub_m.module_number,
                        'unit_id', sub_m.unit_id,
                        'name', sub_m.name,
                        'description', sub_m.description,
                        'progress', sub_ump.progress,
                        'status', sub_ump.status
                    )
                )
                FROM modules AS sub_m
                LEFT JOIN user_module_progress sub_ump ON sub_ump.module_id = sub_m.id
                WHERE sub_u.id = sub_m.unit_id
                ),
                '[]'::jsonb)
    ))
    FROM units AS sub_u
    WHERE sub_u.course_id = c.id
    ),
    '[]'::jsonb) AS units
FROM courses c
JOIN user_courses uc ON uc.course_id = c.id AND uc.user_id = $1
LEFT JOIN units u ON u.id = uc.current_unit_id
LEFT JOIN modules m ON m.id = uc.current_module_id
JOIN user_module_progress ump ON ump.module_id = m.id
WHERE c.id = $2
ORDER BY c.id, uc.updated_at DESC;
	`, userID, courseID).Scan(
		&course.ID,
		&course.CreatedAt,
		&course.UpdatedAt,
		&course.Name,
		&course.Description,
		&course.Requirements,
		&course.WhatYouLearn,
		&backgroundColor,
		&iconURL,
		&course.Duration,
		&course.DifficultyLevel,
		&authors,
		&tags,
		&course.Rating,
		&currentUnit,
		&currentModule,
		&units,
	)

	if err != nil {
		log.WithError(err).Errorf("error with queried rows")
		return nil, fmt.Errorf("error with queried rows: %w", err)
	}

	if err = json.Unmarshal(authors, &course.Authors); err != nil {
		log.WithError(err).Errorf("failed to unmarshal authors")
		return nil, fmt.Errorf("failed to unmarshal authors")
	}

	if err = json.Unmarshal(tags, &course.Tags); err != nil {
		log.WithError(err).Errorf("failed to unmarshal tags")
		return nil, fmt.Errorf("failed to unmarshal tags")
	}

	if err = json.Unmarshal(units, &course.Units); err != nil {
		log.WithError(err).Errorf("failed to unmarshal units")
		return nil, fmt.Errorf("failed to unmarshal units")
	}

	if err = json.Unmarshal(currentUnit, &course.CurrentUnit); err != nil {
		log.WithError(err).Errorf("failed to unmarshal units")
		return nil, fmt.Errorf("failed to unmarshal units")
	}

	if err = json.Unmarshal(currentModule, &course.CurrentModule); err != nil {
		log.WithError(err).Errorf("failed to unmarshal units")
		return nil, fmt.Errorf("failed to unmarshal units")
	}

	return &course, nil
}

func (r *courseRepository) GetCourseProgressFull(ctx context.Context, userID int64, courseID int64) (*models.Course, error) {
	log := logger.Get().WithBaseFields(logger.Repository, "GetCourseProgress")

	var course models.Course
	var authors, tags, currentUnit, currentModule, units []byte

	var (
		backgroundColor sql.NullString
		iconURL         sql.NullString
	)

	err := r.db.QueryRowContext(ctx, `

	SELECT DISTINCT ON (c.id)
	c.id,
	c.created_at,
	c.updated_at,
	c.name,
	c.description,
	NULLIF(c.requirements, ''),
	NULLIF(c.what_you_learn, ''),
	NULLIF(c.background_color, '') AS background_color,
	NULLIF(c.icon_url, '') AS icon_url,
	c.duration,
	c.difficulty_level,
	COALESCE((SELECT json_agg(jsonb_build_object(
	'id', ca.author_id,
	'name', a.name))
	FROM course_authors ca
	LEFT JOIN authors a ON a.id = ca.author_id
	WHERE ca.course_id = c.id
	), '[]'::json) AS authors,
	COALESCE((SELECT json_agg(jsonb_build_object(
	'id', t.id,
	'name', t.name))
	FROM course_tags ct
	LEFT JOIN tags t ON t.id = ct.tag_id
	WHERE ct.course_id = c.id
	), '[]'::json) AS tags,
	c.rating,
	jsonb_build_object(
	'id', u.id,
	'created_at', u.created_at,
	'updated_at', u.updated_at,
	'unit_number', u.unit_number,
	'name', u.name,
	'description', u.description
	) AS current_unit,
	jsonb_build_object(
	'id', m.id,
	'created_at', m.created_at,
	'updated_at', m.updated_at,
	'module_number', m.module_number,
	'unit_id', m.unit_id,
	'name', m.name,
	'description', m.description,
	'progress', ump.progress,
	'status', ump.status
	) AS current_module,
	COALESCE((SELECT jsonb_agg(
	jsonb_build_object(
	'id', sub_u.id,
	'created_at', sub_u.created_at,
	'updated_at', sub_u.updated_at,
	'unit_number', sub_u.unit_number,
	'course_id', sub_u.course_id,
	'name', sub_u.name,
	'description', sub_u.description,
	'modules', COALESCE((SELECT
	jsonb_agg(
	jsonb_build_object(
	'id', sub_m.id,
	'created_at', sub_m.created_at,
	'updated_at', sub_m.updated_at,
	'module_number', sub_m.module_number,
	'unit_id', sub_m.unit_id,
	'name', sub_m.name,
	'description', sub_m.description,
	'progress', sub_ump.progress,
	'status', sub_ump.status,
	'sections', COALESCE((
	SELECT jsonb_agg(
	jsonb_build_object(
	'id', sub_s.id,
	'created_at', sub_s.created_at,
	'updated_at', sub_s.updated_at,
	'type', sub_s.type,
	'position', sub_s.position,
	'content', CASE sub_s.type
	WHEN 'text' THEN (
	SELECT jsonb_build_object('text', ts.content)
	FROM text_sections ts
	WHERE ts.section_id = sub_s.id
	)
	WHEN 'video' THEN (
	SELECT jsonb_build_object('url', vs.url)
	FROM video_sections vs
	WHERE vs.section_id = sub_s.id
	)
	WHEN 'question' THEN (
	SELECT jsonb_build_object(
	'id', qs.question_id,
	'question', q.question,
	'type', q.type,
	'options', COALESCE((
	SELECT jsonb_agg( jsonb_build_object(
	'id', qo.id,
	'content', qo.content,
	'is_correct', qo.is_correct
	))
	FROM question_options qo
	WHERE qo.question_id = q.id
	), '[]'::jsonb
	),
	'user_question_answer', COALESCE(jsonb_build_object(
	'answer_id', uqn.answer_id,
	'answered_at', uqn.answered_at,
	'is_correct', uqn.is_correct
	), NULL)
	)
	FROM question_sections qs
	LEFT JOIN questions q ON q.id = qs.question_id
	LEFT JOIN user_question_answers uqn ON uqn.question_id = qs.question_id
	WHERE qs.section_id = sub_s.id
	)
	END,
	'section_progress', jsonb_build_object(
	'started_at', usp.started_at,
	'completed_at', usp.completed_at,
	'status', usp.status
	)
	)

	)
	FROM sections sub_s
	LEFT JOIN user_section_progress usp ON usp.section_id = sub_s.id
	WHERE sub_s.module_id = sub_m.id
	), '[]'::jsonb)
	)
	)
	FROM modules AS sub_m
	LEFT JOIN user_module_progress sub_ump ON sub_ump.module_id = sub_m.id
	WHERE sub_u.id = sub_m.unit_id
	),
	'[]'::jsonb)
	))
	FROM units AS sub_u
	WHERE sub_u.course_id = c.id
	),
	'[]'::jsonb) AS units
	FROM courses c
	JOIN user_courses uc ON uc.course_id = c.id AND uc.user_id = $1
	LEFT JOIN units u ON u.id = uc.current_unit_id
	LEFT JOIN modules m ON m.id = uc.current_module_id
	JOIN user_module_progress ump ON ump.module_id = m.id
	WHERE c.id = $2
	ORDER BY c.id, uc.updated_at DESC;
	`, userID, courseID).Scan(
		&course.ID,
		&course.CreatedAt,
		&course.UpdatedAt,
		&course.Name,
		&course.Description,
		&course.Requirements,
		&course.WhatYouLearn,
		&backgroundColor,
		&iconURL,
		&course.Duration,
		&course.DifficultyLevel,
		&authors,
		&tags,
		&course.Rating,
		&currentUnit,
		&currentModule,
		&units,
	)

	if err != nil {
		log.WithError(err).Errorf("error with queried rows")
		return nil, fmt.Errorf("error with queried rows: %w", err)
	}

	if err = json.Unmarshal(authors, &course.Authors); err != nil {
		log.WithError(err).Errorf("failed to unmarshal authors")
		return nil, fmt.Errorf("failed to unmarshal authors")
	}

	if err = json.Unmarshal(tags, &course.Tags); err != nil {
		log.WithError(err).Errorf("failed to unmarshal tags")
		return nil, fmt.Errorf("failed to unmarshal tags")
	}

	if err = json.Unmarshal(units, &course.Units); err != nil {
		log.WithError(err).Errorf("failed to unmarshal units")
		return nil, fmt.Errorf("failed to unmarshal units")
	}

	if err = json.Unmarshal(currentUnit, &course.CurrentUnit); err != nil {
		log.WithError(err).Errorf("failed to unmarshal units")
		return nil, fmt.Errorf("failed to unmarshal units")
	}

	if err = json.Unmarshal(currentModule, &course.CurrentModule); err != nil {
		log.WithError(err).Errorf("failed to unmarshal units")
		return nil, fmt.Errorf("failed to unmarshal units")
	}

	return &course, nil
}