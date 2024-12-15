package repository

import (
	gen "algolearn/internal/database/generated"
	codes "algolearn/internal/errors"
	"algolearn/internal/models"
	"algolearn/pkg/logger"
	"context"
	"database/sql"
	"encoding/json"
	"fmt"
)

type ModuleRepository interface {
	CreateModule(ctx context.Context, authorID int32, module *models.Module) error
	UpdateModule(ctx context.Context, module *models.Module) error
	DeleteModule(ctx context.Context, id int64) error
	GetModuleWithProgress(ctx context.Context, userID int32, unitID int64, moduleID int64) (*models.ModulePayload, error)
	GetModulesWithProgress(ctx context.Context, page int64, pageSize int64, userID int32, unitID int64) (int64, []*models.Module, error)
	UpdateModuleProgress(ctx context.Context, userID int32, unitID int64, moduleID int64, batch *models.BatchModuleProgress) error
}

type moduleRepository struct {
	queries *gen.Queries
}

func NewModuleRepository(db *sql.DB) ModuleRepository {
	return &moduleRepository{queries: gen.New(db)}
}

func (r *moduleRepository) GetModuleWithProgress(ctx context.Context, userID int32, unitID int64, moduleID int64) (*models.ModulePayload, error) {
	log := logger.Get().
		WithBaseFields(logger.Repository, "GetModuleWithProgress").
		WithField("unit_id", unitID).
		WithField("module_id", moduleID)

	result, err := r.queries.GetModuleWithProgress(ctx, gen.GetModuleWithProgressParams{
		UnitID:   int32(unitID),
		ModuleID: int32(moduleID),
	})
	if err != nil {
		if err == sql.ErrNoRows {
			return nil, codes.ErrNotFound
		}
		log.WithError(err).Error("failed to get module with progress")
		return nil, fmt.Errorf("failed to get module with progress: %w", err)
	}

	var module models.Module
	if err = json.Unmarshal(result.Module, &module); err != nil {
		log.WithError(err).Error("failed to unmarshal module")
		return nil, fmt.Errorf("failed to unmarshal module: %w", err)
	}

	return &models.ModulePayload{
		Module:        module,
		NextModuleID:  int64(result.NextModuleID),
		HasNextModule: result.HasNextModule,
	}, nil
}

func (r *moduleRepository) GetModulesWithProgress(ctx context.Context, page int64, pageSize int64, userID int32, unitID int64) (int64, []*models.Module, error) {
	log := logger.Get().
		WithBaseFields(logger.Repository, "GetModulesWithProgress").
		WithField("unit_id", unitID).
		WithField("page", page).
		WithField("pageSize", pageSize)

	totalCount, err := r.queries.GetModuleTotalCount(ctx, int32(unitID))
	if err != nil {
		log.WithError(err).Error("failed to get total count")
		return 0, nil, fmt.Errorf("failed to get total count: %w", err)
	}

	offset := (page - 1) * pageSize
	result, err := r.queries.GetModulesWithProgress(ctx, gen.GetModulesWithProgressParams{
		UnitID:     int32(unitID),
		UserID:     userID,
		PageSize:   int32(pageSize),
		PageOffset: int32(offset),
	})
	if err != nil {
		if err == sql.ErrNoRows {
			return totalCount, []*models.Module{}, nil
		}
		log.WithError(err).Error("failed to get modules with progress")
		return 0, nil, fmt.Errorf("failed to get modules with progress: %w", err)
	}

	var modules []*models.Module
	if err = json.Unmarshal(result.([]byte), &modules); err != nil {
		log.WithError(err).Error("failed to unmarshal modules")
		return 0, nil, fmt.Errorf("failed to unmarshal modules: %w", err)
	}

	return totalCount, modules, nil
}

func (r *moduleRepository) CreateModule(ctx context.Context, authorID int32, module *models.Module) error {
	log := logger.Get().WithBaseFields(logger.Repository, "CreateModule")

	result, err := r.queries.CreateModule(ctx, gen.CreateModuleParams{
		UnitID:      int32(module.ModuleUnitID),
		Name:        module.Name,
		Description: module.Description,
	})
	if err != nil {
		log.WithError(err).Error("failed to create module")
		return fmt.Errorf("failed to create module: %w", err)
	}

	module.ID = int64(result.ID)
	module.CreatedAt = result.CreatedAt
	module.UpdatedAt = result.UpdatedAt
	module.ModuleNumber = int16(result.ModuleNumber)

	return nil
}

func (r *moduleRepository) UpdateModule(ctx context.Context, module *models.Module) error {
	log := logger.Get().WithBaseFields(logger.Repository, "UpdateModule").
		WithField("module_id", module.ID)

	result, err := r.queries.UpdateModule(ctx, gen.UpdateModuleParams{
		ModuleID:    int32(module.ID),
		Name:        module.Name,
		Description: module.Description,
	})
	if err != nil {
		if err == sql.ErrNoRows {
			return codes.ErrNotFound
		}
		log.WithError(err).Error("failed to update module")
		return fmt.Errorf("failed to update module: %w", err)
	}

	module.UpdatedAt = result.UpdatedAt
	return nil
}

func (r *moduleRepository) DeleteModule(ctx context.Context, id int64) error {
	log := logger.Get().WithBaseFields(logger.Repository, "DeleteModule").
		WithField("module_id", id)

	err := r.queries.DeleteModule(ctx, int32(id))
	if err != nil {
		if err == sql.ErrNoRows {
			return codes.ErrNotFound
		}
		log.WithError(err).Error("failed to delete module")
		return fmt.Errorf("failed to delete module: %w", err)
	}

	return nil
}

func (r *moduleRepository) UpdateModuleProgress(ctx context.Context, userID int32, unitID int64, moduleID int64, batch *models.BatchModuleProgress) error {
	log := logger.Get().WithBaseFields(logger.Repository, "UpdateModuleProgress").
		WithField("unit_id", unitID).
		WithField("module_id", moduleID)

	sectionsJson, err := json.Marshal(batch.Sections)
	if err != nil {
		log.WithError(err).Error("failed to marshal sections")
		return fmt.Errorf("failed to marshal sections: %w", err)
	}

	questionsJson, err := json.Marshal(batch.Questions)
	if err != nil {
		log.WithError(err).Error("failed to marshal questions")
		return fmt.Errorf("failed to marshal questions: %w", err)
	}

	err = r.queries.SaveModuleProgress(ctx, gen.SaveModuleProgressParams{
		UserID:    userID,
		ModuleID:  int32(moduleID),
		Sections:  sectionsJson,
		Questions: questionsJson,
	})
	if err != nil {
		log.WithError(err).Error("failed to save module progress")
		return fmt.Errorf("failed to save module progress: %w", err)
	}

	return nil
}
