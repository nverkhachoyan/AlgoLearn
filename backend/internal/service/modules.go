package service

import (
	gen "algolearn/internal/database/generated"
	httperr "algolearn/internal/errors"
	"algolearn/internal/models"
	"algolearn/pkg/logger"
	"context"
	"database/sql"
	"encoding/json"
	"errors"
	"fmt"
	"time"
)

type ModuleService interface {
	GetModuleWithProgress(ctx context.Context, userID, unitID, moduleID int64) (*models.Module, bool, int32, error)
	GetModulesWithProgress(ctx context.Context, userID, unitID int64, page, pageSize int) ([]models.Module, error)
	GetModuleTotalCount(ctx context.Context, unitID int64) (int64, error)
	CreateModule(ctx context.Context, unitID int64, name, description string) (*models.Module, error)
	UpdateModule(ctx context.Context, moduleID int64, name, description string) (*models.Module, error)
	DeleteModule(ctx context.Context, moduleID int64) error
	SaveModuleProgress(ctx context.Context, userID, moduleID int64, sections []models.SectionProgress, questions []models.QuestionProgress) error
}

type moduleService struct {
	queries *gen.Queries
	log     *logger.Logger
}

func NewModuleService(db *sql.DB) ModuleService {
	return &moduleService{queries: gen.New(db), log: logger.Get()}
}

func (s *moduleService) GetModuleWithProgress(ctx context.Context, userID, unitID, moduleID int64) (*models.Module, bool, int32, error) {
	log := s.log.WithBaseFields(logger.Service, "GetModuleWithProgress")

	// Get module with progress
	moduleData, err := s.queries.GetModuleWithProgress(ctx, gen.GetModuleWithProgressParams{
		UserID:   int32(userID),
		UnitID:   int32(unitID),
		ModuleID: int32(moduleID),
	})
	if err != nil {
		if errors.Is(err, sql.ErrNoRows) {
			return nil, false, 0, httperr.ErrNotFound
		}
		log.WithError(err).Error("failed to get module with progress")
		return nil, false, 0, fmt.Errorf("failed to get module with progress: %w", err)
	}

	var module models.Module
	if err := json.Unmarshal(moduleData, &module); err != nil {
		log.WithError(err).Error("failed to unmarshal module")
		return nil, false, 0, fmt.Errorf("failed to unmarshal module: %w", err)
	}

	// Get sections with content
	sections, err := s.queries.GetSingleModuleSections(ctx, gen.GetSingleModuleSectionsParams{
		ModuleID: int32(moduleID),
	})
	if err != nil {
		log.WithError(err).Error("failed to get module sections")
		return nil, false, 0, fmt.Errorf("failed to get module sections: %w", err)
	}

	// Get section progress
	progress, err := s.queries.GetSectionProgress(ctx, gen.GetSectionProgressParams{
		UserID:   int32(userID),
		ModuleID: int32(moduleID),
	})
	if err != nil && !errors.Is(err, sql.ErrNoRows) {
		log.WithError(err).Error("failed to get section progress")
		return nil, false, 0, fmt.Errorf("failed to get section progress: %w", err)
	}

	// Build progress map
	progressMap := make(map[int32]json.RawMessage)
	for _, p := range progress {
		progressMap[p.SectionID] = p.Progress
	}

	// Combine sections with their progress
	module.Sections = make([]models.SectionInterface, len(sections))
	for i, s := range sections {
		var section models.Section
		if err := json.Unmarshal([]byte(s.Content), &section.Content); err != nil {
			log.WithError(err).Error("failed to unmarshal section content")
			return nil, false, 0, fmt.Errorf("failed to unmarshal section content: %w", err)
		}

		section.ID = int64(s.ID)
		section.CreatedAt = s.CreatedAt
		section.UpdatedAt = s.UpdatedAt
		section.Type = s.Type

		section.Position = int16(s.Position)

		if progress, ok := progressMap[s.ID]; ok {
			if err := json.Unmarshal(progress, &section.Progress); err != nil {
				log.WithError(err).Error("failed to unmarshal section progress")
				return nil, false, 0, fmt.Errorf("failed to unmarshal section progress: %w", err)
			}
		}

		module.Sections[i] = &section
	}

	// Get next module info
	nextModuleID, err := s.queries.GetNextModuleId(ctx, gen.GetNextModuleIdParams{
		UnitID:       int32(unitID),
		ModuleNumber: int32(module.ModuleNumber),
	})
	if err != nil && !errors.Is(err, sql.ErrNoRows) {
		log.WithError(err).Error("failed to get next module id")
		return nil, false, 0, fmt.Errorf("failed to get next module id: %w", err)
	}

	hasNextModule := nextModuleID != 0

	return &module, hasNextModule, nextModuleID, nil
}

func (s *moduleService) GetModulesWithProgress(ctx context.Context, userID, unitID int64, page, pageSize int) ([]models.Module, error) {
	log := s.log.WithBaseFields(logger.Service, "GetModulesWithProgress")

	modules, err := s.queries.GetModulesList(ctx, gen.GetModulesListParams{
		UserID:     int32(userID),
		UnitID:     int32(unitID),
		PageSize:   int32(pageSize),
		PageOffset: int32((page - 1) * pageSize),
	})
	if err != nil {
		log.WithError(err).Error("failed to get modules list")
		return nil, fmt.Errorf("failed to get modules list: %w", err)
	}

	result := make([]models.Module, len(modules))
	for i, m := range modules {
		var progress struct {
			Progress         float32   `json:"progress"`
			Status           string    `json:"status"`
			StartedAt        time.Time `json:"startedAt"`
			CompletedAt      time.Time `json:"completedAt,omitempty"`
			LastAccessed     time.Time `json:"lastAccessed"`
			CurrentSectionID int32     `json:"currentSectionId,omitempty"`
		}
		if err := json.Unmarshal(m.ModuleProgress, &progress); err != nil {
			log.WithError(err).Error("failed to unmarshal module progress")
			return nil, fmt.Errorf("failed to unmarshal module progress: %w", err)
		}

		result[i] = models.Module{
			BaseModel: models.BaseModel{
				ID:        int64(m.ID),
				CreatedAt: m.CreatedAt,
				UpdatedAt: m.UpdatedAt,
			},
			ModuleNumber:     int16(m.ModuleNumber),
			ModuleUnitID:     int64(m.UnitID),
			Name:             m.Name,
			Description:      m.Description,
			Progress:         progress.Progress,
			Status:           progress.Status,
			StartedAt:        progress.StartedAt,
			CompletedAt:      progress.CompletedAt,
			LastAccessed:     progress.LastAccessed,
			CurrentSectionID: progress.CurrentSectionID,
			Sections:         make([]models.SectionInterface, 0),
		}
	}

	return result, nil
}

func (s *moduleService) GetModuleTotalCount(ctx context.Context, unitID int64) (int64, error) {
	log := s.log.WithBaseFields(logger.Service, "GetModuleTotalCount")

	count, err := s.queries.GetModuleTotalCount(ctx, int32(unitID))
	if err != nil {
		log.WithError(err).Error("failed to get module total count")
		return 0, fmt.Errorf("failed to get module total count: %w", err)
	}
	return count, nil
}

func (s *moduleService) CreateModule(ctx context.Context, unitID int64, name, description string) (*models.Module, error) {
	log := s.log.WithBaseFields(logger.Service, "CreateModule")

	module, err := s.queries.CreateModule(ctx, gen.CreateModuleParams{
		UnitID:      int32(unitID),
		Name:        name,
		Description: description,
	})
	if err != nil {
		log.WithError(err).Error("failed to create module")
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
	log := s.log.WithBaseFields(logger.Service, "UpdateModule")

	module, err := s.queries.UpdateModule(ctx, gen.UpdateModuleParams{
		ModuleID:    int32(moduleID),
		Name:        name,
		Description: description,
	})
	if err != nil {
		log.WithError(err).Error("failed to update module")
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
	log := s.log.WithBaseFields(logger.Service, "DeleteModule")

	err := s.queries.DeleteModule(ctx, int32(moduleID))
	if err != nil {
		log.WithError(err).Error("failed to delete module")
		return fmt.Errorf("failed to delete module: %w", err)
	}
	return nil
}

func (s *moduleService) SaveModuleProgress(ctx context.Context, userID, moduleID int64, sections []models.SectionProgress, questions []models.QuestionProgress) error {
	log := s.log.WithBaseFields(logger.Service, "SaveModuleProgress")

	sectionsJSON, err := json.Marshal(sections)
	if err != nil {
		log.WithError(err).Error("failed to marshal sections")
		return fmt.Errorf("failed to marshal sections: %w", err)
	}

	questionsJSON, err := json.Marshal(questions)
	if err != nil {
		log.WithError(err).Error("failed to marshal questions")
		return fmt.Errorf("failed to marshal questions: %w", err)
	}

	err = s.queries.SaveModuleProgress(ctx, gen.SaveModuleProgressParams{
		UserID:    int32(userID),
		ModuleID:  int32(moduleID),
		Sections:  sectionsJSON,
		Questions: questionsJSON,
	})
	if err != nil {
		log.WithError(err).Error("failed to save module progress")
		return fmt.Errorf("failed to save module progress: %w", err)
	}

	return nil
}
