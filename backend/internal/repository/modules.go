package repository

import (
	codes "algolearn/internal/errors"
	"algolearn/internal/models"
	"algolearn/pkg/logger"
	"fmt"

	"github.com/lib/pq"

	"context"
	"database/sql"
	"errors"
	"time"
)

type ModuleRepository interface {
	GetModules(ctx context.Context, unitID int64, isPartial bool) ([]models.Module, error)
	GetModuleByModuleID(ctx context.Context, unitID int64, moduleID int64) (*models.Module, error)
	CreateModule(ctx context.Context, module *models.Module) error
	UpdateModule(ctx context.Context, module *models.Module) error
	DeleteModule(ctx context.Context, id int64) error
}

type moduleRepository struct {
	db *sql.DB
}

func NewModuleRepository(db *sql.DB) ModuleRepository {
	return &moduleRepository{db: db}
}

func (r *moduleRepository) GetModules(ctx context.Context, unitID int64, isPartial bool) ([]models.Module, error) {
	if isPartial {
		return r.getModulesPartial(ctx, unitID)
	}
	return r.getModulesFull(ctx, unitID)
}

func (r *moduleRepository) getModulesPartial(ctx context.Context, unitID int64) ([]models.Module, error) {
	log := logger.Get().WithBaseFields(logger.Repository, "getModulesPartial").
		WithField("unit_id", unitID)

	rows, err := r.db.QueryContext(ctx, `
	SELECT 	id,
		  	created_at,
			updated_at,
			unit_id,
			name,
			description
	FROM modules WHERE unit_id = $1`,
		unitID)
	if err != nil {
		return nil, err
	}
	defer func(rows *sql.Rows) {
		err := rows.Close()
		if err != nil {
			log.Errorf("faild to close rows in repo func GetAllModulesPartial. %v", err.Error())
		}
	}(rows)

	var modules []models.Module
	for rows.Next() {
		var module models.Module
		err := rows.Scan(
			&module.ID,
			&module.CreatedAt,
			&module.UpdatedAt,
			&module.UnitID,
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

	if len(modules) == 0 {
		return nil, codes.ErrNotFound
	}

	return modules, nil
}

func (r *moduleRepository) getModulesFull(ctx context.Context, unitID int64) ([]models.Module, error) {
	log := logger.Get().WithBaseFields(logger.Repository, "getModulesFull").
		WithField("unit_id", unitID)

	rows, err := r.db.QueryContext(ctx, `
	SELECT
		m.id AS module_id,
		m.created_at AS module_created_at,
		m.updated_at AS module_updated_at,
		m.name AS module_name,
		m.description AS module_description,
		s.id AS section_id,
		s.created_at AS section_created_at,
		s.updated_at AS section_updated_at,
		s.type,
		s.position,
		ts.content AS text_content,
		vs.url AS video_url,
		qs.question_id AS question_id
	FROM
		modules m
	LEFT JOIN
		sections s ON m.id = s.module_id
	LEFT JOIN
		text_sections ts ON s.id = ts.section_id
	LEFT JOIN
		video_sections vs ON s.id = vs.section_id
	LEFT JOIN
		question_sections qs ON s.id = qs.section_id
	WHERE
		m.unit_id = $1
	ORDER BY m.id, s.position;`, unitID)
	if err != nil {
		return nil, err
	}
	defer func(rows *sql.Rows) {
		err := rows.Close()
		if err != nil {
			log.Errorf("faild to close rows in repo func GetAllModules. %v", err.Error())
		}
	}(rows)

	modulesMap := make(map[int64]models.Module)
	for rows.Next() {
		var (
			moduleID          int64
			moduleCreatedAt   time.Time
			moduleUpdatedAt   time.Time
			moduleName        sql.NullString
			moduleDescription sql.NullString
			sectionID         sql.NullInt64
			sectionCreatedAt  sql.NullTime
			sectionUpdatedAt  sql.NullTime
			sectionType       sql.NullString
			sectionPosition   sql.NullInt16
			textContent       sql.NullString
			videoUrl          sql.NullString
			questionId        sql.NullInt64
		)

		err := rows.Scan(
			&moduleID,
			&moduleCreatedAt,
			&moduleUpdatedAt,
			&moduleName,
			&moduleDescription,
			&sectionID,
			&sectionCreatedAt,
			&sectionUpdatedAt,
			&sectionType,
			&sectionPosition,
			&textContent,
			&videoUrl,
			&questionId,
		)
		if err != nil {
			return nil, err
		}

		module, exists := modulesMap[moduleID]
		if !exists {
			module = models.Module{
				BaseModel: models.BaseModel{
					ID:        moduleID,
					CreatedAt: moduleCreatedAt,
					UpdatedAt: moduleUpdatedAt,
				},
				UnitID:      unitID,
				Name:        moduleName.String,
				Description: moduleDescription.String,
				Sections:    []models.Section{},
			}
		}

		var section models.Section
		switch sectionType.String {
		case "text":
			section = models.TextSection{
				BaseModel: models.BaseModel{
					ID:        sectionID.Int64,
					CreatedAt: sectionCreatedAt.Time,
					UpdatedAt: sectionUpdatedAt.Time,
				},
				BaseSection: models.BaseSection{
					ModuleID: moduleID,
					Type:     sectionType.String,
					Position: sectionPosition.Int16,
				},
				// Content: textContent.String,
			}
		case "video":
			section = models.VideoSection{
				BaseModel: models.BaseModel{
					ID:        sectionID.Int64,
					CreatedAt: sectionCreatedAt.Time,
					UpdatedAt: sectionUpdatedAt.Time,
				},
				BaseSection: models.BaseSection{
					ModuleID: moduleID,
					Type:     sectionType.String,
					Position: sectionPosition.Int16,
				},
				// Url: videoUrl.String,
			}
		case "question":
			section = models.QuestionSection{
				BaseModel: models.BaseModel{
					ID:        sectionID.Int64,
					CreatedAt: sectionCreatedAt.Time,
					UpdatedAt: sectionUpdatedAt.Time,
				},
				BaseSection: models.BaseSection{
					ModuleID: moduleID,
					Type:     sectionType.String,
					Position: sectionPosition.Int16,
				},
				QuestionID: questionId.Int64,
			}
		}

		module.Sections = append(module.Sections, section)

		modulesMap[moduleID] = module
	}

	if err := rows.Err(); err != nil {
		return nil, err
	}

	var modules []models.Module
	for _, module := range modulesMap {
		modules = append(modules, module)
	}

	if len(modules) == 0 {
		return nil, codes.ErrNotFound
	}

	return modules, nil
}

func (r *moduleRepository) GetModuleByModuleID(ctx context.Context, unitID int64, moduleID int64) (*models.Module, error) {
	log := logger.Get().
		WithBaseFields(logger.Repository, "GetModuleByModuleID").
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

	rows, err := r.db.QueryContext(ctx, `
	SELECT
	m.created_at AS module_created_at,
	m.updated_at AS module_updated_at,
	m.name AS module_name,
	m.description AS module_description,
	s.id AS section_id,
	s.created_at AS section_created_at,
	s.updated_at AS section_updated_at,
	s.type,
	s.position,
	ts.content AS text_content,
	vs.url AS video_url,
	qs.question_id AS question_id
	FROM
	modules m
	LEFT JOIN
	sections s ON m.id = s.module_id
	LEFT JOIN
	text_sections ts ON s.id = ts.section_id
	LEFT JOIN
	video_sections vs ON s.id = vs.section_id
	LEFT JOIN
	question_sections qs ON s.id = qs.section_id
	WHERE
	m.unit_id = $1 AND m.id = $2
	ORDER BY m.id, s.position`, unitID, moduleID)
	if err != nil {
		log.WithError(err).Error("failed to execute query")
		return nil, fmt.Errorf("failed to execute query: %w", err)
	}

	module := models.Module{}
	questionSections := make(map[int64]*models.QuestionSection)
	var (
		moduleCreatedAt   time.Time
		moduleUpdatedAt   time.Time
		moduleName        sql.NullString
		moduleDescription sql.NullString
		sectionID         sql.NullInt64
		sectionCreatedAt  sql.NullTime
		sectionUpdatedAt  sql.NullTime
		sectionType       sql.NullString
		sectionPosition   sql.NullInt16
		textContent       sql.NullString
		videoUrl          sql.NullString
		questionId        sql.NullInt64
	)

	isFirstRow := true
	for rows.Next() {
		err := rows.Scan(
			&moduleCreatedAt,
			&moduleUpdatedAt,
			&moduleName,
			&moduleDescription,
			&sectionID,
			&sectionCreatedAt,
			&sectionUpdatedAt,
			&sectionType,
			&sectionPosition,
			&textContent,
			&videoUrl,
			&questionId,
		)
		if err != nil {
			log.WithError(err).Error("failed to scan row")
			return nil, fmt.Errorf("failed to scan row: %w", err)
		}

		if isFirstRow {
			module = models.Module{
				BaseModel: models.BaseModel{
					ID:        moduleID,
					CreatedAt: moduleCreatedAt,
					UpdatedAt: moduleUpdatedAt,
				},
				UnitID:      unitID,
				Name:        moduleName.String,
				Description: moduleDescription.String,
				Sections:    []models.Section{},
			}
			isFirstRow = false
		}

		if sectionID.Valid {
			var section models.Section
			switch sectionType.String {
			case "text":
				section = &models.TextSection{
					BaseModel: models.BaseModel{
						ID:        sectionID.Int64,
						CreatedAt: sectionCreatedAt.Time,
						UpdatedAt: sectionUpdatedAt.Time,
					},
					BaseSection: models.BaseSection{
						ModuleID: moduleID,
						Type:     sectionType.String,
						Position: sectionPosition.Int16,
					},
					// Content: textContent.String,
				}
			case "video":
				section = &models.VideoSection{
					BaseModel: models.BaseModel{
						ID:        sectionID.Int64,
						CreatedAt: sectionCreatedAt.Time,
						UpdatedAt: sectionUpdatedAt.Time,
					},
					BaseSection: models.BaseSection{
						ModuleID: moduleID,
						Type:     sectionType.String,
						Position: sectionPosition.Int16,
					},
					// Url: videoUrl.String,
				}
			case "question":
				questionSection := &models.QuestionSection{
					BaseModel: models.BaseModel{
						ID:        sectionID.Int64,
						CreatedAt: sectionCreatedAt.Time,
						UpdatedAt: sectionUpdatedAt.Time,
					},
					BaseSection: models.BaseSection{
						ModuleID: moduleID,
						Type:     sectionType.String,
						Position: sectionPosition.Int16,
					},
					QuestionID: questionId.Int64,
				}
				section = questionSection
				questionSections[sectionID.Int64] = questionSection
			}

			if section != nil {
				module.Sections = append(module.Sections, section)
			}
		}
	}

	if len(questionSections) > 0 {
		questionIDs := make([]int64, 0, len(questionSections))
		for _, questSect := range questionSections {
			if questSect.QuestionID > 0 {
				questionIDs = append(questionIDs, questSect.QuestionID)
			}
		}
		log.WithField("question_ids", questionIDs).Info("collecting question IDs")

		hasQuestionRows := false
		questionRows, err := r.db.QueryContext(ctx, `
		SELECT
		q.id,
		q.created_at,
		q.updated_at,
		q.type,
		q.question,
		q.difficulty_level,
		qo.id AS option_id,
		qo.content,
		qo.is_correct
		FROM
		questions q
		LEFT JOIN question_options qo ON q.id = qo.question_id
		WHERE q.id = ANY($1)
		ORDER BY q.id, qo.id`, pq.Array(questionIDs))
		if err != nil {
			log.WithError(err).Error("failed to fetch questions and options")
			return nil, fmt.Errorf("failed to fetch questions and options: %w", err)
		}
		defer func(questionRows *sql.Rows) {
			err := questionRows.Close()
			if err != nil {
				log.WithError(err).Error("failed to close questionRows")
			}
		}(questionRows)

		currentQuestionID := int64(0)
		var currentQuestion *models.Question
		for questionRows.Next() {
			hasQuestionRows = true
			var (
				questionID              int64
				questionCreatedAt       time.Time
				questionUpdatedAt       time.Time
				questionType            string
				questionQuestion        string
				questionDifficultyLevel string
				optionID                int64
				optionContent           string
				optionIsCorrect         bool
			)

			err = questionRows.Scan(
				&questionID,
				&questionCreatedAt,
				&questionUpdatedAt,
				&questionType,
				&questionQuestion,
				&questionDifficultyLevel,
				&optionID,
				&optionContent,
				&optionIsCorrect)
			if err != nil {
				log.WithError(err).Error("failed to scan question")
				return nil, fmt.Errorf("failed to scan question: %w", err)
			}

			if currentQuestionID != questionID {
				currentQuestionID = questionID
				currentQuestion = &models.Question{
					BaseModel: models.BaseModel{
						ID:        questionID,
						CreatedAt: questionCreatedAt,
						UpdatedAt: questionUpdatedAt,
					},
					Type:            questionType,
					Question:        questionQuestion,
					DifficultyLevel: models.DifficultyLevel(questionDifficultyLevel),
					Options:         []models.QuestionOption{},
				}
			}

			currentQuestion.Options = append(currentQuestion.Options, models.QuestionOption{
				ID:         optionID,
				QuestionID: questionID,
				Content:    optionContent,
				IsCorrect:  optionIsCorrect,
			})

			for _, section := range questionSections {
				if section.QuestionID == questionID {
					section.Question = *currentQuestion
				}
			}
		}

		if !hasQuestionRows {
			log.Warn("no questions were returned by query")
		}
	}

	if err = rows.Err(); err != nil {
		log.WithError(err).Error("error processing rows")
		return nil, fmt.Errorf("error processing rows: %w", err)
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
		module.UnitID, 3, module.Name, module.Description).Scan(
		&newModule.ID,
		&newModule.CreatedAt,
		&newModule.UpdatedAt,
		&newModule.ModuleNumber,
		&newModule.UnitID,
		&newModule.Name,
		&newModule.Description)
	if err != nil {
		return err
	}

	module.ID = newModule.ID
	module.CreatedAt = newModule.CreatedAt
	module.UpdatedAt = newModule.UpdatedAt
	module.UnitID = newModule.UnitID
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
				s.Question.Type,
				s.Question.Question,
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

			newSection.Question.ID = baseModelQuestion.ID
			newSection.Question.CreatedAt = baseModelQuestion.CreatedAt
			newSection.Question.UpdatedAt = baseModelQuestion.UpdatedAt

			// Then, we insert the options
			updatedOptions := make([]models.QuestionOption, 0, len(s.Question.Options))
			for _, option := range s.Question.Options {
				var optionID int64
				err = tx.QueryRowContext(ctx, `
					INSERT INTO question_options (question_id, content, is_correct)
					VALUES ($1, $2, $3)
					RETURNING id`,
					baseModelQuestion.ID,
					option.Content,
					option.IsCorrect).Scan(&optionID)
				option.ID = optionID

				newOption := option
				newOption.ID = optionID
				newOption.QuestionID = baseModelQuestion.ID
				updatedOptions = append(updatedOptions, newOption)
			}
			newSection.Question.Options = updatedOptions

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
		&module.UnitID,
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
