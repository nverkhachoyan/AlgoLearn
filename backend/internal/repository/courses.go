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
	GetAllCourses(ctx context.Context) ([]models.Course, error)
	GetCourseByID(ctx context.Context, id int64) (*models.Course, error)
	CreateCourse(ctx context.Context, course *models.Course) (*models.Course, error)
	UpdateCourse(ctx context.Context, course *models.Course) (*models.Course, error)
	DeleteCourse(ctx context.Context, id int64) error
}

type courseRepository struct {
	db *sql.DB
}

func NewCourseRepository(db *sql.DB) CourseRepository {
	return &courseRepository{db: db}
}

func (r *courseRepository) GetAllCourses(ctx context.Context) ([]models.Course, error) {
	log := logger.Get()
	rows, err := r.db.QueryContext(
		ctx, `
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

func (r *courseRepository) GetCourseByID(_ context.Context, courseID int64) (*models.Course, error) {
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
        learners_count = COALESCE($8, learners_count),
        updated_at = CURRENT_TIMESTAMP
    WHERE id = $9;`

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
