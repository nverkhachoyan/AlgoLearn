package repository

import (
	"algolearn-backend/internal/models"
	"context"
	"database/sql"
	"encoding/json"
	"time"

	"github.com/lib/pq"
)


type ModuleRepository interface {

	GetAllModulesPartial(ctx context.Context, unitID int64) ([]models.Module, error)
	GetAllModules(ctx context.Context, unitID int64) ([]models.Module, error)
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

func (r *moduleRepository) GetAllModulesPartial(_ context.Context, unitID int64) ([]models.Module, error) {
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

func (r *moduleRepository) GetAllModules(_ context.Context, unitID int64) ([]models.Module, error) {
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

// func (r *moduleRepository) GetModuleByID(id int64) (*models.Module, error) {
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

func (r *moduleRepository) GetModuleByModuleID(_ context.Context, unitID int64, moduleID int64) (*models.Module, error) {
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

func (r *moduleRepository) CreateModule(_ context.Context, module *models.Module) error {
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

func (r *moduleRepository) UpdateModule(_ context.Context, module *models.Module) error {
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

func (r *moduleRepository) DeleteModule(_ context.Context, id int64) error {
	_, err := r.db.Exec("DELETE FROM modules WHERE id = $1", id)
	return err
}
