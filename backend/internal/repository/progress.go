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
	GetCoursesProgress(ctx context.Context, page int, pageSize int, userID int64) (int64, []models.CourseProgressSummary, error)
}

type progressRepository struct {
	db *sql.DB
}

func NewProgressService(db *sql.DB) ProgressRepository {
	return &progressRepository{db: db}
}

func (r *progressRepository) GetCoursesProgress(ctx context.Context, page int, pageSize int, userID int64) (int64, []models.CourseProgressSummary, error) {
	log := logger.Get().WithBaseFields(logger.Repository, "GetCoursesProgress")

	offset := (page - 1) * pageSize
	var totalCount int64

	rows, err := r.db.QueryContext(ctx, `
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
       NULLIF(u.id, 0),
       u.created_at,
       u.updated_at,
       NULLIF(u.name, ''),
       NULLIF(u.description, ''),
       NULLIF(m.id, 0),
       m.created_at,
       m.updated_at,
       NULLIF(m.unit_id, 0),
       NULLIF(m.name, ''),
       NULLIF(m.description, '')
	FROM courses c
	LEFT JOIN user_courses uc ON uc.course_id = c.id AND uc.user_id = $1
	LEFT JOIN units u ON u.id = uc.current_unit_id
	LEFT JOIN modules m ON m.id = uc.current_module_id
	ORDER BY c.id, uc.updated_at DESC
	LIMIT $2 OFFSET $3
	`, userID, pageSize, offset)
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
			unitName        sql.NullString
			unitDesc        sql.NullString
			moduleID        sql.NullInt64
			moduleCreatedAt sql.NullTime
			moduleUpdatedAt sql.NullTime
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
			&unitName,
			&unitDesc,
			&moduleID,
			&moduleCreatedAt,
			&moduleUpdatedAt,
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
			course.Unit = nil
		} else {
			course.Unit = &models.UnitProgressSummary{
				BaseModel: models.BaseModel{
					ID:        unitID.Int64,
					CreatedAt: unitCreatedAt.Time,
					UpdatedAt: unitUpdatedAt.Time,
				},
				Name:        unitName.String,
				Description: unitDesc.String,
			}
		}

		if !moduleID.Valid {
			course.Module = nil
		} else {
			course.Module = &models.ModuleProgressSummary{
				BaseModel: models.BaseModel{
					ID:        moduleID.Int64,
					CreatedAt: moduleCreatedAt.Time,
					UpdatedAt: moduleUpdatedAt.Time,
				},
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
