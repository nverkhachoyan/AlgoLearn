package repository

import (
	codes "algolearn/internal/errors"
	"algolearn/internal/models"
	"algolearn/pkg/logger"

	"context"
	"database/sql"
	"encoding/json"
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
	log := logger.Get()
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
	log := logger.Get()
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
				Content: textContent.String,
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
				Url: videoUrl.String,
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
	module := models.Module{}
	isFirstIter := true

	rows, err := r.db.QueryContext(ctx,
		`
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
	ORDER BY m.id, s.position;
	`, unitID, moduleID)
	if err != nil {
		return nil, err
	}

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
			return nil, err
		}

		if isFirstIter {
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
			isFirstIter = false
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
				Content: textContent.String,
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
				Url: videoUrl.String,
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
	}

	return &module, nil
}

// TODO: everything below

func (r *moduleRepository) CreateModule(ctx context.Context, module *models.Module) error {
	log := logger.Get()

	tx, err := r.db.BeginTx(ctx, &sql.TxOptions{})
	if err != nil {
		return err
	}

	var txErr error
	defer func() {
		if err != nil {
			rbErr := tx.Rollback()
			if rbErr != nil {
				log.WithFields(logger.Fields{
					"func":     "CreateModule",
					"package":  "repository",
					"error":    rbErr,
					"moduleID": module.ID}).Errorf("failed to roll back database transaction")
			}
		} else {
			cmtErr := tx.Commit()
			if cmtErr != nil {
				log.WithFields(logger.Fields{
					"func":     "CreateModule",
					"package":  "repository",
					"error":    cmtErr,
					"moduleID": module.ID}).Errorf("failed to commit database transaction")
				txErr = cmtErr
			}
		}
	}()

	var newModule models.Module
	err = tx.QueryRowContext(ctx, `
	INSERT INTO modules (unit_id, name, description)
	VALUES ($1, $2, $3)
	RETURNING id, created_at, updated_at, unit_id, name, description`,
		module.UnitID, module.Name, module.Description).Scan(
		&newModule.ID,
		&newModule.CreatedAt,
		&newModule.UpdatedAt,
		&newModule.UnitID,
		&newModule.Name,
		&newModule.Description)
	if err != nil {
		return err
	}

	if len(module.Sections) > 0 {
		err = r.insertSections(ctx, tx, newModule.ID, module.Sections)
		if err != nil {
			return err
		}
		newModule.Sections = module.Sections
	}

	if txErr != nil {
		return txErr
	}

	return err
}

func (r *moduleRepository) insertSections(ctx context.Context, tx *sql.Tx, moduleID int64, sections []models.Section) error {
	log := logger.Get()

	for _, section := range sections {
		baseSection := section.GetBaseSection()
		var sectionID int64
		err := tx.QueryRowContext(ctx, `
		INSERT INTO sections (module_id, type, position)
		VALUES ($1, $2, $3) RETURNING id;`, moduleID, baseSection.Type, baseSection.Position).Scan(&sectionID)
		if err != nil {
			log.WithFields(logger.Fields{
				"section_id": sectionID,
				"module_id":  moduleID,
			}).Error("failed to insert section base")
			return err
		}

		switch s := section.(type) {
		case models.TextSection:
			_, err = tx.ExecContext(ctx,
				`INSERT INTO text_sections (section_id, content)
				VALUES ($1, $2);`, sectionID, s.Content)
		case models.VideoSection:
			_, err = tx.ExecContext(ctx,
				`INSERT INTO video_sections (section_id, url)
				VALUES ($1, $2);`, sectionID, s.Url)
		case models.QuestionSection:
			// First, we insert the question into the questions
			var baseModelQuestion models.BaseModel
			err := tx.QueryRowContext(ctx, `
			INSERT INTO questions (type, question, difficulty_level)
			VALUES ($1, $2, $3)
			RETURNING id, created_at, updated_at;`,
				s.Question.Type,
				s.Question.Question,
				"beginner").Scan(
				&baseModelQuestion.ID,
				&baseModelQuestion.CreatedAt,
				&baseModelQuestion.UpdatedAt,
			)
			if err != nil {
				return err
			}

			s.BaseModel.ID = sectionID
			s.BaseModel.CreatedAt = baseModelQuestion.CreatedAt
			s.BaseModel.UpdatedAt = baseModelQuestion.UpdatedAt

			s.Question.ID = baseModelQuestion.ID
			s.Question.CreatedAt = baseModelQuestion.CreatedAt
			s.Question.UpdatedAt = baseModelQuestion.UpdatedAt

			// Then, we insert the options
			if len(s.Question.Options) > 0 {
				for _, option := range s.Question.Options {
					var optionID int64
					err = tx.QueryRowContext(ctx, `
					INSERT INTO question_options (question_id, content, is_correct)
					VALUES ($1, $2, $3)
					RETURNING id;`,
						baseModelQuestion.ID,
						option.Content,
						option.IsCorrect).Scan(&optionID)
					option.ID = optionID
				}
			}

			// Finally, the question is associated with the question section
			_, err = tx.ExecContext(ctx, `
			INSERT INTO question_sections (section_id, question_id)
			VALUES ($1, $2);`, sectionID, baseModelQuestion.ID)

		}
		if err != nil {
			log.WithFields(logger.Fields{
				"section_id": sectionID,
				"module_id":  moduleID,
			}).Error("failed to insert sections")
			return err
		}
	}

	return nil
}

func (r *moduleRepository) UpdateModule(ctx context.Context, module *models.Module) error {
	content, err := json.Marshal(module.Sections)
	if err != nil {
		return err
	}
	_, err = r.db.ExecContext(ctx,
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

func (r *moduleRepository) DeleteModule(ctx context.Context, id int64) error {
	_, err := r.db.ExecContext(ctx, "DELETE FROM modules WHERE id = $1", id)
	return err
}
