package service

import (
	"algolearn/internal/database"
	"algolearn/internal/models"
	"context"
	"database/sql"
	"fmt"
)

type NotificationsService interface {
	GetAllNotifications() ([]models.Notification, error)
}

type notificationsService struct {
	db *database.Database
}

func NewNotificationsService(db *sql.DB) NotificationsService {
	return &notificationsService{db: database.New(db)}
}

func (r *notificationsService) GetAllNotifications() ([]models.Notification, error) {
	ctx := context.Background()
	notifications, err := r.db.GetAllNotifications(ctx)
	if err != nil {
		return nil, fmt.Errorf("failed to get notifications: %v", err)
	}

	result := make([]models.Notification, len(notifications))
	for i, n := range notifications {
		result[i] = models.Notification{
			ID:        n.ID,
			UserID:    int64(n.UserID),
			Content:   n.Content,
			Read:      n.Read,
			CreatedAt: n.CreatedAt,
		}
	}

	return result, nil
}
