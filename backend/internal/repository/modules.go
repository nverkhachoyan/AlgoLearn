package repository

import (
	codes "algolearn/internal/errors"
	"algolearn/internal/models"
	"algolearn/pkg/logger"
	"encoding/json"
	"fmt"

	"context"
	"database/sql"
	"errors"
)

type ModuleRepository interface {
	// GetModules(ctx context.Context, unitID int64, isPartial bool) ([]models.Module, error)
	// GetModuleByModuleID(ctx context.Context, unitID int64, moduleID int64) (*models.Module, error)
	CreateModule(ctx context.Context, module *models.Module) error
	UpdateModule(ctx context.Context, module *models.Module) error
	DeleteModule(ctx context.Context, id int64) error
	GetModuleWithProgress(ctx context.Context, userID int64, unitID int64, moduleID int64) (*models.Module, error)
}

type moduleRepository struct {
	db *sql.DB
}

func NewModuleRepository(db *sql.DB) ModuleRepository {
	return &moduleRepository{db: db}
}

func (r *moduleRepository) GetModuleWithProgress(ctx context.Context, userID int64, unitID int64, moduleID int64) (*models.Module, error) {
	log := logger.Get().
	WithBaseFields(logger.Repository, "GetModuleWithProgress").
	WithField("unit_id", unitID).
	WithField("module_id", moduleID)

	var moduleExists bool
	err := r.db.
		QueryRowContext(ctx, `SELECT EXISTS(SELECT 1 FROM modules WHERE id = $1 AND unit_id = $2)`,
			moduleID, unitID).
		Scan(&moduleExists)
	if err != nil {
		log.WithError(err).Error("failed to check module existence")
		return nil, fmt.Errorf("failed to check module existence: %w", err)
	}

	if !moduleExists {
		return nil, codes.ErrNotFound
	}

	var moduleJson []byte
	var module models.Module
	err = r.db.QueryRowContext(ctx, `
SELECT jsonb_build_object(
        'id', m.id,
        'created_at', m.created_at,
        'updated_at', m.updated_at,
        'module_number', m.module_number,
        'unit_id', m.unit_id,
        'name', m.name,
        'description', m.description,
        'progress', ump.progress,
        'status', ump.status,
        'sections', COALESCE((
                SELECT DISTINCT jsonb_agg(
                                jsonb_build_object(
                                'id', s.id,
                                'created_at', s.created_at,
                                'updated_at', s.updated_at,
                                'type', s.type,
                                'position', s.position,
                                'content', CASE s.type
                                        WHEN 'text' THEN (
                                                SELECT jsonb_build_object('text', ts.content)
                                                FROM text_sections ts
                                                WHERE ts.section_id = s.id
                                        )
                                        WHEN 'video' THEN (
                                                SELECT jsonb_build_object('url', vs.url)
                                                FROM video_sections vs
                                                WHERE vs.section_id = s.id
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
                                                JOIN questions q ON q.id = qs.question_id
                                                LEFT JOIN user_question_answers uqn ON uqn.question_id = qs.question_id
                                                WHERE qs.section_id = s.id
                                        )
                                        END,
                                        'section_progress', jsonb_build_object(
                                                'started_at', usp.started_at,
                                                'completed_at', usp.completed_at,
                                                'status', usp.status
                                        )
                                )
                                
                        )
                FROM sections s
                JOIN (
                    SELECT DISTINCT ON (section_id) *
                    FROM user_section_progress
                ) usp ON usp.section_id = s.id
                WHERE s.module_id = m.id
                        ), '[]'::jsonb)
                )
FROM modules AS m
JOIN user_module_progress ump ON ump.module_id = m.id
WHERE m.unit_id = $1 AND m.id = $2;
	`, unitID, moduleID).
	Scan(&moduleJson)

	if err != nil {
		log.WithError(err).Errorf("failed to query module progress")
		return nil, fmt.Errorf("failed to query module progress")
	}

	if err = json.Unmarshal(moduleJson, &module); err != nil {
		log.WithError(err).Errorf("failed to unmarshal module")
	}

	return &module, nil
}

func (r *moduleRepository) CreateModule(ctx context.Context, module *models.Module) (err error) {
	log := logger.Get().WithBaseFields(logger.Repository, "CreateModule").
		WithField("module_id", module.ID)

	tx, err := r.db.BeginTx(ctx, &sql.TxOptions{})
	if err != nil {
		return err
	}

	logger.WithFields(log, logger.Fields{
		"moduleID": module.ID,
	}).Printf("creating a new module")

	defer func() {
		if err != nil {
			rbErr := tx.Rollback()
			if rbErr != nil {
				log.WithError(rbErr).Error("failed to roll back database transaction")
			}
		} else {
			cmtErr := tx.Commit()
			if cmtErr != nil {
				log.WithError(cmtErr).Error("failed to commit database transaction")
				err = cmtErr
			}
		}
	}()

	var newModule models.Module
	err = tx.QueryRowContext(ctx, `
	INSERT INTO modules (unit_id, module_number, name, description)
	VALUES ($1, $2, $3, $4)
	RETURNING id, created_at, updated_at, module_number, unit_id, name, description`,
		module.ModuleUnitID, 3, module.Name, module.Description).Scan(
		&newModule.ID,
		&newModule.CreatedAt,
		&newModule.UpdatedAt,
		&newModule.ModuleNumber,
		&newModule.ModuleUnitID,
		&newModule.Name,
		&newModule.Description)
	if err != nil {
		return err
	}

	module.ID = newModule.ID
	module.CreatedAt = newModule.CreatedAt
	module.UpdatedAt = newModule.UpdatedAt
	module.ModuleUnitID = newModule.ModuleUnitID
	module.Name = newModule.Name
	module.Description = newModule.Description

	if len(module.Sections) > 0 {
		updatedSections, err := r.insertSections(ctx, tx, newModule.ID, module.Sections)
		if err != nil {
			return err
		}
		module.Sections = updatedSections
	}

	return nil
}

func (r *moduleRepository) insertSections(ctx context.Context, tx *sql.Tx, moduleID int64, sections []models.Section) ([]models.Section, error) {
	log := logger.Get().WithBaseFields(logger.Repository, "insertSections").
		WithField("moduleID", moduleID)

	updatedSections := make([]models.Section, 0, len(sections))

	for _, section := range sections {
		baseSection := section.GetBaseSection()
		var sectionID int64
		err := tx.QueryRowContext(ctx, `
		INSERT INTO sections (module_id, type, position)
		VALUES ($1, $2, $3) RETURNING id`, moduleID, baseSection.Type, baseSection.Position).Scan(&sectionID)
		if err != nil {
			log.WithError(err).
				WithField("sectionID", sectionID).
				Error("failed to insert section base")
			return nil, err
		}

		var updatedSection models.Section
		switch s := section.(type) {
		case models.TextSection:
			newSection := s
			newSection.BaseModel.ID = sectionID
			_, err = tx.ExecContext(ctx,
				`INSERT INTO text_sections (section_id, content)
				VALUES ($1, $2)`, sectionID, s.Content)
			updatedSection = newSection
		case models.VideoSection:
			newSection := s
			newSection.BaseModel.ID = sectionID
			_, err = tx.ExecContext(ctx,
				`INSERT INTO video_sections (section_id, url)
				VALUES ($1, $2)`, sectionID)
			updatedSection = newSection
		case models.QuestionSection:
			newSection := s
			newSection.BaseModel.ID = sectionID
			// First, we insert the question into the questions
			var baseModelQuestion models.BaseModel
			err := tx.QueryRowContext(ctx, `
			INSERT INTO questions (type, question, difficulty_level)
			VALUES ($1, $2, $3)
			RETURNING id, created_at, updated_at`,
				// s.Question.Type,
				// s.Question.Question,
				"beginner").Scan(
				&baseModelQuestion.ID,
				&baseModelQuestion.CreatedAt,
				&baseModelQuestion.UpdatedAt,
			)
			if err != nil {
				return nil, err
			}

			newSection.BaseModel.ID = sectionID
			newSection.BaseModel.CreatedAt = baseModelQuestion.CreatedAt
			newSection.BaseModel.UpdatedAt = baseModelQuestion.UpdatedAt

			// newSection.Question.ID = baseModelQuestion.ID
			// newSection.Question.CreatedAt = baseModelQuestion.CreatedAt
			// newSection.Question.UpdatedAt = baseModelQuestion.UpdatedAt

			// Then, we insert the options
			// updatedOptions := make([]models.QuestionOption, 0, len(s.Question.Options))
			// for _, option := range s.Question.Options {
			// 	var optionID int64
			// 	err = tx.QueryRowContext(ctx, `
			// 		INSERT INTO question_options (question_id, content, is_correct)
			// 		VALUES ($1, $2, $3)
			// 		RETURNING id`,
			// 		baseModelQuestion.ID,
			// 		option.Content,
			// 		option.IsCorrect).Scan(&optionID)
			// 	option.ID = optionID

			// 	newOption := option
			// 	newOption.ID = optionID
			// 	newOption.QuestionID = baseModelQuestion.ID
			// 	updatedOptions = append(updatedOptions, newOption)
			// }
			// newSection.Question.Options = updatedOptions

			// Finally, the question is associated with the question section
			_, err = tx.ExecContext(ctx, `
			INSERT INTO question_sections (section_id, question_id)
			VALUES ($1, $2)`, sectionID, baseModelQuestion.ID)

			updatedSection = newSection
		}

		if err != nil {
			log.WithField("sectionID", sectionID).Error("failed to insert sections")
			return nil, fmt.Errorf("failed to insert sections %w", err)
		}

		updatedSections = append(updatedSections, updatedSection)
	}

	return updatedSections, nil
}

func (r *moduleRepository) UpdateModule(ctx context.Context, module *models.Module) (err error) {
	log := logger.Get().WithBaseFields(logger.Repository, "UpdateModule").
		WithField("moduleID", module.ID)

	tx, err := r.db.BeginTx(ctx, &sql.TxOptions{})
	if err != nil {
		return err
	}

	defer func() {
		if err != nil {
			rbErr := tx.Rollback()
			if rbErr != nil {
				log.WithError(rbErr).Error("failed to rollback database transaction")
			}
		} else {
			cmtErr := tx.Commit()
			if cmtErr != nil {
				log.WithError(cmtErr).Error("failed to commit database transaction")
				err = cmtErr
			}
		}
	}()

	query := `
		UPDATE modules
		SET name = COALESCE(NULLIF($1, ''), name),
			description = COALESCE(NULLIF($2, ''), description),
			updated_at = CURRENT_TIMESTAMP
		WHERE id = $3
		RETURNING
			id,
			created_at,
			updated_at,
			unit_id,
			name,
			description`

	err = tx.QueryRowContext(ctx, query,
		sql.NullString{String: module.Name, Valid: module.Name != ""},
		sql.NullString{String: module.Description, Valid: module.Description != ""},
		module.ID,
	).Scan(
		&module.ID,
		&module.CreatedAt,
		&module.UpdatedAt,
		&module.ModuleUnitID,
		&module.Name,
		&module.Description)
	if errors.Is(err, sql.ErrNoRows) {
		log.WithError(err).Error("failed to update module")
		return codes.ErrNotFound
	} else if err != nil {
		log.WithError(err).Error("failed to update module")
		return fmt.Errorf("failed to update module %v", err)
	}

	if len(module.Sections) > 0 {
		log.Info("updating module sections")

		_, err = tx.ExecContext(ctx, `DELETE FROM sections WHERE module_id = $1`, module.ID)
		if err != nil {
			log.WithError(err).WithField("section_count", len(module.Sections)).
				Error("failed to delete existing sections")
			return fmt.Errorf("failed to delete sections for module %d: %w", module.ID, err)
		}

		updatedSections, err := r.insertSections(ctx, tx, module.ID, module.Sections)
		if err != nil {
			log.WithError(err).WithField("section_count", len(module.Sections)).
				Error("failed to insert new sections")
			return fmt.Errorf("failed to insert new sections for module %d: %w", module.ID, err)
		}
		module.Sections = updatedSections
	}

	log.Info("module updated successfully")
	return
}

func (r *moduleRepository) DeleteModule(ctx context.Context, id int64) error {
	log := logger.Get().WithBaseFields(logger.Repository, "DeleteModule").
		WithField("module_id", id)

	result, err := r.db.ExecContext(ctx, "DELETE FROM modules WHERE id = $1", id)
	if err != nil {
		log.WithError(err).Error("failed to delete module")
	}
	rowsAffected, err := result.RowsAffected()
	if rowsAffected == 0 {
		log.Warn("module not found")
		return codes.ErrNotFound
	}

	return nil
}
