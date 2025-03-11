package service

import (
	gen "algolearn/internal/database/generated"
	"algolearn/internal/models"
	"algolearn/pkg/logger"
	"context"
	"database/sql"
	"errors"
)

type UnitService interface {
	CreateUnit(ctx context.Context, courseID int64, unitNumber int16, name, description string) (*models.Unit, error)
	GetUnitByID(ctx context.Context, unitID int64) (*models.Unit, error)
	GetUnitsByCourseID(ctx context.Context, courseID int64) ([]*models.Unit, error)
	GetUnitsCount(ctx context.Context) (int64, error)
	UpdateUnit(ctx context.Context, unitID int64, name, description string) (*models.Unit, error)
	UpdateUnitNumber(ctx context.Context, unitID int64, unitNumber int16) (*models.Unit, error)
	DeleteUnit(ctx context.Context, unitID int64) error
}

type unitService struct {
	queries *gen.Queries
	log     *logger.Logger
}

func NewUnitService(db *sql.DB) UnitService {
	return &unitService{
		queries: gen.New(db),
		log:     logger.Get(),
	}
}

func (s *unitService) GetUnitByID(ctx context.Context, unitID int64) (*models.Unit, error) {
	unit, err := s.queries.GetUnitByID(ctx, int32(unitID))
	if err != nil {
		return nil, err
	}

	return &models.Unit{
		BaseModel: models.BaseModel{
			ID:        int64(unit.ID),
			CreatedAt: unit.CreatedAt,
			UpdatedAt: unit.UpdatedAt,
		},
		UnitNumber:  int16(unit.UnitNumber),
		Name:        unit.Name,
		Description: unit.Description,
	}, nil
}

func (s *unitService) CreateUnit(ctx context.Context, courseID int64, unitNumber int16, name, description string) (*models.Unit, error) {
	unitID, err := s.queries.CreateUnit(ctx, gen.CreateUnitParams{
		CourseID:    int32(courseID),
		UnitNumber:  int32(unitNumber),
		Name:        name,
		Description: description,
	})
	if err != nil {
		return nil, err
	}

	return s.GetUnitByID(ctx, int64(unitID))
}

func (s *unitService) GetUnitsByCourseID(ctx context.Context, courseID int64) ([]*models.Unit, error) {
	units, err := s.queries.GetUnitsByCourseID(ctx, int32(courseID))
	if err != nil && !errors.Is(err, sql.ErrNoRows) {
		return nil, err
	}

	var unitsModels []*models.Unit
	for _, unit := range units {
		unitsModels = append(unitsModels, &models.Unit{
			BaseModel: models.BaseModel{
				ID:        int64(unit.ID),
				CreatedAt: unit.CreatedAt,
				UpdatedAt: unit.UpdatedAt,
			},
			UnitNumber:  int16(unit.UnitNumber),
			Name:        unit.Name,
			Description: unit.Description,
		})
	}

	return unitsModels, nil
}

func (s *unitService) GetUnitsCount(ctx context.Context) (int64, error) {
	count, err := s.queries.GetUnitsCount(ctx)
	if err != nil {
		return 0, err
	}
	return count, nil
}

func (s *unitService) UpdateUnit(ctx context.Context, unitID int64, name, description string) (*models.Unit, error) {
	err := s.queries.UpdateUnit(ctx, gen.UpdateUnitParams{
		UnitID:      int32(unitID),
		Name:        name,
		Description: description,
	})
	if err != nil {
		return nil, err
	}
	return s.GetUnitByID(ctx, unitID)
}

func (s *unitService) UpdateUnitNumber(ctx context.Context, unitID int64, unitNumber int16) (*models.Unit, error) {
	err := s.queries.UpdateUnitNumber(ctx, gen.UpdateUnitNumberParams{
		UnitID:     int32(unitID),
		UnitNumber: int32(unitNumber),
	})
	if err != nil {
		return nil, err
	}
	return s.GetUnitByID(ctx, unitID)
}

func (s *unitService) DeleteUnit(ctx context.Context, unitID int64) error {
	return s.queries.DeleteUnit(ctx, int32(unitID))
}
