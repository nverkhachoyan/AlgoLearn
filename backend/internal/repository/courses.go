package repository

import (
	codes "algolearn/internal/errors"
	"algolearn/internal/models"
	"algolearn/pkg/logger"
	"context"
	"database/sql"
	"encoding/json"
	"fmt"
)

type CourseRepository interface {
	GetCourseSummary(ctx context.Context, courseID int64) (*models.Course, error)
	GetCourseFull(ctx context.Context, courseID int64) (*models.Course, error)
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

func (r *courseRepository) GetCourseSummary(ctx context.Context, courseID int64) (*models.Course, error) {
	log := logger.Get().WithBaseFields(logger.Repository, "GetCourseProgress")

	var course models.Course
	var authors, tags, units []byte

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
    NULLIF(c.requirements, '') AS requirements,
    NULLIF(c.what_you_learn, '') AS what_you_learn,
    NULLIF(c.background_color, '') AS backgroundColor,
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
    COALESCE((SELECT jsonb_agg(
    jsonb_build_object(
    'id', sub_u.id,
    'createdAt', sub_u.created_at,
    'updatedAt', sub_u.updated_at,
    'unitNumber', sub_u.unit_number,
    'courseId', sub_u.course_id,
    'name', sub_u.name,
    'description', sub_u.description,
    'modules', COALESCE((SELECT
                jsonb_agg(
                    jsonb_build_object(
                        'id', sub_m.id,
                        'createdAt', sub_m.created_at,
                        'updatedAt', sub_m.updated_at,
                        'moduleNumber', sub_m.module_number,
                        'unitId', sub_m.unit_id,
                        'name', sub_m.name,
                        'description', sub_m.description
                    )
                )
                FROM modules AS sub_m
                WHERE sub_u.id = sub_m.unit_id
                ),
                '[]'::jsonb)
    ))
    FROM units AS sub_u
    WHERE sub_u.course_id = c.id
    ),
    '[]'::jsonb) AS units
	FROM courses c
	LEFT JOIN units u ON u.course_id = c.id
	LEFT JOIN modules m ON m.unit_id = u.id
	WHERE c.id = $1
	ORDER BY c.id;
	`, courseID).Scan(
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

	return &course, nil
}

func (r *courseRepository) GetCourseFull(ctx context.Context, courseID int64) (*models.Course, error) {
	log := logger.Get().WithBaseFields(logger.Repository, "GetCourseProgress")

	var course models.Course
	var authors, tags, units []byte

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
	NULLIF(c.requirements, '') AS requirements,
	NULLIF(c.what_you_learn, '') AS what_you_learn,
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
	COALESCE((SELECT jsonb_agg(jsonb_build_object(
                'id', sub_u.id,
                'createdAt', sub_u.created_at,
                'updatedAt', sub_u.updated_at,
                'unitNumber', sub_u.unit_number,
                'courseId', sub_u.course_id,
                'name', sub_u.name,
	            'description', sub_u.description,
	            'modules', COALESCE((
	            SELECT jsonb_agg(jsonb_build_object(
                        'id', sub_m.id,
                        'createdAt', sub_m.created_at,
                        'updatedAt', sub_m.updated_at,
                        'moduleNumber', sub_m.module_number,
                        'unitId', sub_m.unit_id,
                        'name', sub_m.name,
                        'description', sub_m.description,
                        'sections', COALESCE((
                        SELECT jsonb_agg(jsonb_build_object(
                                'id', sub_s.id,
                                'createdAt', sub_s.created_at,
                                'updatedAt', sub_s.updated_at,
                                'type', sub_s.type,
                                'position', sub_s.position,
                                'content', CASE sub_s.type
                                        WHEN 'text' THEN (
                                            SELECT jsonb_build_object('text', ts.content)
                                            FROM text_sections ts
                                            WHERE ts.section_id = sub_s.id)
                                        WHEN 'video' THEN (
                                            SELECT jsonb_build_object('url', vs.url)
                                            FROM video_sections vs
                                            WHERE vs.section_id = sub_s.id)
                                        WHEN 'question' THEN (
                                            SELECT jsonb_build_object(
                                            'id', qs.question_id,
                                            'question', q.question,
                                            'type', q.type,
                                            'options', COALESCE((SELECT jsonb_agg( jsonb_build_object(
                                                    'id', qo.id,
                                                    'content', qo.content,
                                                    'isCorrect', qo.is_correct
                                                    ))
                                                            FROM question_options qo
                                                            WHERE qo.question_id = q.id
                                            ), '[]'::jsonb))
                                                FROM question_sections qs
                                                LEFT JOIN questions q ON q.id = qs.question_id
                                                WHERE qs.section_id = sub_s.id)
                                        END
                                    )) -- sections SELECT END
                                        FROM sections sub_s
                                        WHERE sub_s.module_id = sub_m.id), '[]'::jsonb)
                            )
                        )
					FROM modules AS sub_m
					WHERE sub_u.id = sub_m.unit_id),
					'[]'::jsonb) -- modules SELECT END
		)) -- units SELECT END
		FROM units AS sub_u
		WHERE sub_u.course_id = c.id),
		'[]'::jsonb) AS units
	FROM courses c
	LEFT JOIN units u ON u.course_id = c.id
	LEFT JOIN modules m ON m.unit_id = u.id
	WHERE c.id = $1;
	`, courseID).Scan(
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

	return &course, nil
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
    NULLIF(c.background_color, '') AS backgroundColor,
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
            'createdAt', u.created_at,
            'updatedAt', u.updated_at,
            'unitNumber', u.unit_number,
            'name', u.name,
            'description', u.description
    ) AS current_unit,
    jsonb_build_object(
            'id', m.id,
            'createdAt', m.created_at,
            'updatedAt', m.updated_at,
            'moduleNumber', m.module_number,
            'unitId', m.unit_id,
            'name', m.name,
            'description', m.description,
            'progress', ump.progress,
            'status', ump.status
    ) AS current_module,
    COALESCE((SELECT jsonb_agg(
    jsonb_build_object(
    'id', sub_u.id,
    'createdAt', sub_u.created_at,
    'updatedAt', sub_u.updated_at,
    'unitNumber', sub_u.unit_number,
    'courseId', sub_u.course_id,
    'name', sub_u.name,
    'description', sub_u.description,
    'modules', COALESCE((SELECT
                jsonb_agg(
                    jsonb_build_object(
                        'id', sub_m.id,
                        'createdAt', sub_m.created_at,
                        'updatedAt', sub_m.updated_at,
                        'moduleNumber', sub_m.module_number,
                        'unitId', sub_m.unit_id,
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
	'createdAt', u.created_at,
	'updatedAt', u.updated_at,
	'unitNumber', u.unit_number,
	'name', u.name,
	'description', u.description
	) AS current_unit,
	jsonb_build_object(
	'id', m.id,
	'createdAt', m.created_at,
	'updatedAt', m.updated_at,
	'moduleNumber', m.module_number,
	'unitId', m.unit_id,
	'name', m.name,
	'description', m.description,
	'progress', ump.progress,
	'status', ump.status
	) AS current_module,
	COALESCE((SELECT jsonb_agg(
	jsonb_build_object(
	'id', sub_u.id,
	'createdAt', sub_u.created_at,
	'updatedAt', sub_u.updated_at,
	'unitNumber', sub_u.unit_number,
	'courseId', sub_u.course_id,
	'name', sub_u.name,
	'description', sub_u.description,
	'modules', COALESCE((SELECT
	jsonb_agg(
	jsonb_build_object(
	'id', sub_m.id,
	'createdAt', sub_m.created_at,
	'updatedAt', sub_m.updated_at,
	'moduleNumber', sub_m.module_number,
	'unitId', sub_m.unit_id,
	'name', sub_m.name,
	'description', sub_m.description,
	'progress', sub_ump.progress,
	'status', sub_ump.status,
	'sections', COALESCE((
	SELECT jsonb_agg(
	jsonb_build_object(
	'id', sub_s.id,
	'createdAt', sub_s.created_at,
	'updatedAt', sub_s.updated_at,
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
	'isCorrect', qo.is_correct
	))
	FROM question_options qo
	WHERE qo.question_id = q.id
	), '[]'::jsonb
	),
	'userQuestionAnswer', COALESCE(jsonb_build_object(
	'optionId', uqn.option_id,
	'answeredAt', uqn.answered_at,
	'isCorrect', uqn.is_correct
	), NULL)
	)
	FROM question_sections qs
	LEFT JOIN questions q ON q.id = qs.question_id
	LEFT JOIN user_question_answers uqn ON uqn.question_id = qs.question_id
	WHERE qs.section_id = sub_s.id
	)
	END,
	'sectionProgress', jsonb_build_object(
	'seenAt', usp.seen_at,
	'startedAt', usp.started_at,
	'completedAt', usp.completed_at,
	'hasSeen', usp.has_seen
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
