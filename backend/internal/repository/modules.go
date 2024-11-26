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
	CreateModule(ctx context.Context, authorID int64, module *models.Module) error
	UpdateModule(ctx context.Context, module *models.Module) error
	DeleteModule(ctx context.Context, id int64) error
	GetModuleWithProgress(ctx context.Context, userID int64, unitID int64, moduleID int64) (*models.Module, error)
	UpdateModuleProgress(ctx context.Context, userID int64, unitID int64, moduleID int64, batch *models.BatchModuleProgress) error
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
        'createdAt', m.created_at,
        'updatedAt', m.updated_at,
        'moduleNumber', m.module_number,
        'unitId', m.unit_id,
        'name', m.name,
        'description', m.description,
        'progress', ump.progress,
        'status', ump.status,
        'sections', COALESCE((
                SELECT DISTINCT jsonb_agg(
                                jsonb_build_object(
                                'id', s.id,
                                'createdAt', s.created_at,
                                'updatedAt', s.updated_at,
                                'type', s.type,
                                'position', s.position,
                                'content', CASE s.type
                                        WHEN 'text' THEN (
                                                SELECT jsonb_build_object('text', ts.text_content)
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
                                                JOIN questions q ON q.id = qs.question_id
                                                LEFT JOIN user_question_answers uqn ON uqn.question_id = qs.question_id
                                                WHERE qs.section_id = s.id
                                        )
                                        END,
                                        'sectionProgress', jsonb_build_object(
                                                'startedAt', usp.started_at,
                                                'completedAt', usp.completed_at,
                                                'hasSeen', usp.has_seen,
						'seenAt', usp.seen_at
                                        )
                                )
                                
                        )
                FROM sections s
                LEFT JOIN (
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

func (r *moduleRepository) CreateModule(ctx context.Context, authorID int64, module *models.Module) (err error) {
	log := logger.Get().WithBaseFields(logger.Repository, "CreateModule").
		WithField("module_id", module.ID)

	sectionsJson := make([]map[string]interface{}, 0)
	for _, section := range module.Sections {
		baseSection := section.GetBaseSection()
		sectionJson := map[string]interface{}{
			"type":     baseSection.Type,
			"position": baseSection.Position,
		}

		switch s := section.(type) {
		case models.TextSection:
			content := s.Content.(map[string]interface{})
			sectionJson["content"] = map[string]interface{}{
				"text": content["text"],
			}
		case models.VideoSection:
			content := s.Content.(map[string]interface{})
			sectionJson["content"] = map[string]interface{}{
				"url": content["url"],
			}
		case models.QuestionSection:
			content := s.Content.(map[string]interface{})
			sectionJson["content"] = content
		}
		sectionsJson = append(sectionsJson, sectionJson)
	}

	questionsJson := make([]map[string]interface{}, 0)
	sectionsBytes, err := json.Marshal(sectionsJson)
	if err != nil {
		return fmt.Errorf("failed to marshal sections: %w", err)
	}
	questionsBytes, err := json.Marshal(questionsJson)
	if err != nil {
		return fmt.Errorf("failed to marshal questions: %w", err)
	}

	_, err = r.db.ExecContext(ctx, `
		SELECT create_module($1, $2, $3, $4, $5::jsonb, $6::jsonb)
	`, authorID, module.ModuleUnitID, module.Name, module.Description, string(sectionsBytes), string(questionsBytes))

	if err != nil {
		log.WithError(err).Error("failed to create module")
		return fmt.Errorf("failed to create module: %w", err)
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
				`INSERT INTO text_sections (section_id, text_content)
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

func (r *moduleRepository) UpdateModuleProgress(ctx context.Context, userID int64, unitID int64, moduleID int64, batch *models.BatchModuleProgress) error {
	log := logger.Get().WithBaseFields(logger.Repository, "UpdateModuleProgress").
		WithField("unit_id", unitID).
		WithField("module_id", moduleID)

	sectionsJson, err := json.Marshal(batch.Sections)
	if err != nil {
		log.WithError(err).Errorf("failed to marshal sections")
		return fmt.Errorf("failed to marshal sections")
	}
	questionsJson, err := json.Marshal(batch.Questions)
	if err != nil {
		log.WithError(err).Errorf("failed to marshal questions")
		return fmt.Errorf("failed to marshal questions")
	}

	res, err := r.db.ExecContext(ctx, `SELECT save_module_progress($1, $2, $3, $4);`, userID, moduleID, sectionsJson, questionsJson)
	if err != nil {
		log.WithError(err).Errorf("query execution failed")
		return fmt.Errorf("query execution failed")
	}

	rowsAffected, err := res.RowsAffected()
	if err != nil {
		log.WithError(err).Errorf("failed to check rows affected")
		return fmt.Errorf("failed to check rows affected")
	}

	if rowsAffected <= 0 {
		log.WithError(err).Errorf("%v", codes.ErrNotFound)
		return codes.ErrNotFound
	}

	return nil
}
