package service

import (
	"algolearn/internal/database"
	gen "algolearn/internal/database/generated"
	"algolearn/internal/models"
	"context"
	"database/sql"
	"fmt"
)

type AchievementsService interface {
	GetAllAchievements() ([]models.Achievement, error)
	GetAchievementByID(id int32) (*models.Achievement, error)
	CreateAchievement(achievement *models.Achievement) error
	UpdateAchievement(achievement *models.Achievement) error
	DeleteAchievement(id int32) error
}

type achievementsService struct {
	db *database.Database
}

func NewAchievementsService(db *sql.DB) AchievementsService {
	return &achievementsService{db: database.New(db)}
}

func (h *achievementsService) GetAllAchievements() ([]models.Achievement, error) {
	ctx := context.Background()
	achievements, err := h.db.GetAllAchievements(ctx)
	if err != nil {
		return nil, fmt.Errorf("failed to get achievements: %v", err)
	}

	result := make([]models.Achievement, len(achievements))
	for i, a := range achievements {
		result[i] = models.Achievement{
			ID:          a.ID,
			Name:        a.Name,
			Description: a.Description,
			Points:      a.Points,
			CreatedAt:   a.CreatedAt,
			UpdatedAt:   a.UpdatedAt,
		}
	}

	return result, nil
}

func (h *achievementsService) GetAchievementByID(id int32) (*models.Achievement, error) {
	ctx := context.Background()
	achievement, err := h.db.GetAchievementByID(ctx, id)
	if err != nil {
		return nil, fmt.Errorf("failed to get achievement: %v", err)
	}

	return &models.Achievement{
		ID:          achievement.ID,
		Name:        achievement.Name,
		Description: achievement.Description,
		Points:      achievement.Points,
		CreatedAt:   achievement.CreatedAt,
		UpdatedAt:   achievement.UpdatedAt,
	}, nil
}

func (h *achievementsService) CreateAchievement(achievement *models.Achievement) error {
	ctx := context.Background()
	result, err := h.db.CreateAchievement(ctx, gen.CreateAchievementParams{
		Name:        achievement.Name,
		Description: achievement.Description,
		Points:      achievement.Points,
	})
	if err != nil {
		return fmt.Errorf("failed to create achievement: %v", err)
	}

	achievement.ID = result.ID
	achievement.CreatedAt = result.CreatedAt
	achievement.UpdatedAt = result.UpdatedAt
	return nil
}

func (h *achievementsService) UpdateAchievement(achievement *models.Achievement) error {
	ctx := context.Background()
	_, err := h.db.UpdateAchievement(ctx, gen.UpdateAchievementParams{
		Name:        achievement.Name,
		Description: achievement.Description,
		Points:      achievement.Points,
		ID:          achievement.ID,
	})
	if err != nil {
		return fmt.Errorf("failed to update achievement: %v", err)
	}
	return nil
}

func (h *achievementsService) DeleteAchievement(id int32) error {
	ctx := context.Background()
	err := h.db.DeleteAchievement(ctx, id)
	if err != nil {
		return fmt.Errorf("failed to delete achievement: %v", err)
	}
	return nil
}
