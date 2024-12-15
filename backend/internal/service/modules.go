package service

import (
	gen "algolearn/internal/database/generated"
	"algolearn/internal/models"
	"algolearn/pkg/logger"
	"context"
	"database/sql"
	"encoding/json"
	"fmt"
)

type ModuleService interface {
	GetModuleWithProgress(ctx context.Context, userID, unitID, moduleID int64) (*models.Module, bool, error)
	GetModulesWithProgress(ctx context.Context, userID, unitID int64, page, pageSize int) ([]models.Module, error)
	GetModuleTotalCount(ctx context.Context, unitID int64) (int64, error)
	CreateModule(ctx context.Context, unitID int64, name, description string) (*models.Module, error)
	UpdateModule(ctx context.Context, moduleID int64, name, description string) (*models.Module, error)
	DeleteModule(ctx context.Context, moduleID int64) error
	SaveModuleProgress(ctx context.Context, userID, moduleID int64, sections []models.SectionProgress, questions []models.QuestionProgress) error
}

type moduleService struct {
	queries *gen.Queries
}

func NewModuleService(db *sql.DB) ModuleService {
	return &moduleService{queries: gen.New(db)}
}

func (s *moduleService) GetModuleWithProgress(ctx context.Context, userID, unitID, moduleID int64) (*models.Module, bool, error) {
	log := logger.Get().WithBaseFields(logger.Service, "GetModuleWithProgress")

	result, err := s.queries.GetModuleWithProgress(ctx, gen.GetModuleWithProgressParams{
		UserID:   int32(userID),
		UnitID:   int32(unitID),
		ModuleID: int32(moduleID),
	})
	if err != nil {
		log.WithError(err).Error("failed to get module with progress")
		return nil, false, fmt.Errorf("failed to get module with progress: %w", err)
	}

	var module models.Module
	if err := json.Unmarshal(result.Module, &module); err != nil {
		log.WithError(err).Error("failed to unmarshal module")
		return nil, false, fmt.Errorf("failed to unmarshal module: %w", err)
	}

	return &module, result.HasNextModule, nil
}

func (s *moduleService) GetModulesWithProgress(ctx context.Context, userID, unitID int64, page, pageSize int) ([]models.Module, error) {
	log := logger.Get().WithBaseFields(logger.Service, "GetModulesWithProgress")

	result, err := s.queries.GetModulesWithProgress(ctx, gen.GetModulesWithProgressParams{
		UserID:     int32(userID),
		UnitID:     int32(unitID),
		PageSize:   int32(pageSize),
		PageOffset: int32((page - 1) * pageSize),
	})
	if err != nil {
		log.WithError(err).Error("failed to get modules with progress")
		return nil, fmt.Errorf("failed to get modules with progress: %w", err)
	}

	var modules []models.Module
	if err := json.Unmarshal(result.([]byte), &modules); err != nil {
		log.WithError(err).Error("failed to unmarshal modules")
		return nil, fmt.Errorf("failed to unmarshal modules: %w", err)
	}

	return modules, nil
}

func (s *moduleService) GetModuleTotalCount(ctx context.Context, unitID int64) (int64, error) {
	count, err := s.queries.GetModuleTotalCount(ctx, int32(unitID))
	if err != nil {
		return 0, fmt.Errorf("failed to get module total count: %w", err)
	}
	return count, nil
}

func (s *moduleService) CreateModule(ctx context.Context, unitID int64, name, description string) (*models.Module, error) {
	module, err := s.queries.CreateModule(ctx, gen.CreateModuleParams{
		UnitID:      int32(unitID),
		Name:        name,
		Description: description,
	})
	if err != nil {
		return nil, fmt.Errorf("failed to create module: %w", err)
	}

	return &models.Module{
		BaseModel: models.BaseModel{
			ID:        int64(module.ID),
			CreatedAt: module.CreatedAt,
			UpdatedAt: module.UpdatedAt,
		},
		ModuleNumber: int16(module.ModuleNumber),
		ModuleUnitID: int64(module.UnitID),
		Name:         module.Name,
		Description:  module.Description,
		Sections:     make([]models.SectionInterface, 0),
	}, nil
}

func (s *moduleService) UpdateModule(ctx context.Context, moduleID int64, name, description string) (*models.Module, error) {
	module, err := s.queries.UpdateModule(ctx, gen.UpdateModuleParams{
		ModuleID:    int32(moduleID),
		Name:        name,
		Description: description,
	})
	if err != nil {
		return nil, fmt.Errorf("failed to update module: %w", err)
	}

	return &models.Module{
		BaseModel: models.BaseModel{
			ID:        int64(module.ID),
			CreatedAt: module.CreatedAt,
			UpdatedAt: module.UpdatedAt,
		},
		ModuleNumber: int16(module.ModuleNumber),
		ModuleUnitID: int64(module.UnitID),
		Name:         module.Name,
		Description:  module.Description,
		Sections:     make([]models.SectionInterface, 0),
	}, nil
}

func (s *moduleService) DeleteModule(ctx context.Context, moduleID int64) error {
	err := s.queries.DeleteModule(ctx, int32(moduleID))
	if err != nil {
		return fmt.Errorf("failed to delete module: %w", err)
	}
	return nil
}

func (s *moduleService) SaveModuleProgress(ctx context.Context, userID, moduleID int64, sections []models.SectionProgress, questions []models.QuestionProgress) error {
	sectionsJSON, err := json.Marshal(sections)
	if err != nil {
		return fmt.Errorf("failed to marshal sections: %w", err)
	}

	questionsJSON, err := json.Marshal(questions)
	if err != nil {
		return fmt.Errorf("failed to marshal questions: %w", err)
	}

	err = s.queries.SaveModuleProgress(ctx, gen.SaveModuleProgressParams{
		UserID:    int32(userID),
		ModuleID:  int32(moduleID),
		Sections:  sectionsJSON,
		Questions: questionsJSON,
	})
	if err != nil {
		return fmt.Errorf("failed to save module progress: %w", err)
	}

	return nil
}
