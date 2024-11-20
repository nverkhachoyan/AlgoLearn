package repository

import (
	"algolearn/internal/models"
	"algolearn/pkg/logger"
	"context"
	"database/sql"
	"encoding/json"
	"fmt"
)

type ProgressRepository interface {
	// StartModuleProgress(ctx context.Context, userID, moduleID int64) (*models.ModuleProgress, error)
	// GetModuleProgress(ctx context.Context, userID, moduleID int64) (*models.ModuleProgress, error)
	GetCourseProgressSummary(ctx context.Context, userID int64, courseID int64) (*models.CourseProgressSummary, error)
	GetCoursesProgressSummary(ctx context.Context, page int, pageSize int, userID int64, queryFilter string) (int64, []models.CourseProgressSummary, error)
}

type progressRepository struct {
	db *sql.DB
}

func NewProgressService(db *sql.DB) ProgressRepository {
	return &progressRepository{db: db}
}

func (r *progressRepository) GetCoursesProgressSummary(ctx context.Context, page int, pageSize int, userID int64, queryFilter string) (int64, []models.CourseProgressSummary, error) {
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

	var courses []models.CourseProgressSummary
	for rows.Next() {
		var course models.CourseProgressSummary
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
			course.CurrentUnit = &models.UnitProgressSummary{
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
			course.CurrentModule = &models.ModuleProgressSummary{
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

func (r *progressRepository) GetCourseProgressSummary(ctx context.Context, userID int64, courseID int64) (*models.CourseProgressSummary, error) {
	log := logger.Get().WithBaseFields(logger.Repository, "GetCourseProgress")

	var course models.CourseProgressSummary
	var authors, tags, current_unit, current_module, units []byte

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
            NULLIF(c.background_color, '') AS background_color,
            NULLIF(c.icon_url, '') AS icon_url,
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
            jsonb_build_object(
                    'id', u.id,
                    'created_at', u.created_at,
                    'updated_at', u.updated_at,
                    'name', u.name,
                    'description', u.description
            ) AS current_unit,
            jsonb_build_object(
                'id', m.id,
                'created_at', m.created_at,
                'updated_at', m.updated_at,
                'unit_id', m.unit_id,
                'name', m.name,
                'description', m.description,
                'progress', ump.progress,
                'status', ump.status
            ) AS current_module,
            COALESCE((SELECT
                          jsonb_agg(
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
	ORDER BY c.id, uc.updated_at DESC
	`, userID, courseID).Scan(
		&course.ID,
		&course.CreatedAt,
		&course.UpdatedAt,
		&course.Name,
		&course.Description,
		&backgroundColor,
		&iconURL,
		&course.Duration,
		&course.DifficultyLevel,
		&authors,
		&tags,
		&course.Rating,
		&current_unit,
		&current_module,
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
