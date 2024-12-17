package service

import (
	"algolearn/internal/database"
	gen "algolearn/internal/database/generated"
	"algolearn/internal/models"
	"context"
	"database/sql"
	"fmt"
)

type NotificationsService interface {
	GetAllNotifications() ([]models.Notification, error)
	GetNotificationByID(id int32) (*models.Notification, error)
	CreateNotification(notification *models.Notification) error
	UpdateNotification(notification *models.Notification) error
	DeleteNotification(id int32) error
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

func (r *notificationsService) GetNotificationByID(id int32) (*models.Notification, error) {
	ctx := context.Background()
	notification, err := r.db.GetNotificationByID(ctx, id)
	if err != nil {
		return nil, fmt.Errorf("failed to get notification: %v", err)
	}

	return &models.Notification{
		ID:        notification.ID,
		UserID:    int64(notification.UserID),
		Content:   notification.Content,
		Read:      notification.Read,
		CreatedAt: notification.CreatedAt,
	}, nil
}

func (r *notificationsService) CreateNotification(notification *models.Notification) error {
	ctx := context.Background()
	result, err := r.db.CreateNotification(ctx, gen.CreateNotificationParams{
		UserID:  int32(notification.UserID),
		Content: notification.Content,
		Read:    notification.Read,
	})
	if err != nil {
		return fmt.Errorf("failed to create notification: %v", err)
	}

	notification.ID = result.ID
	notification.CreatedAt = result.CreatedAt
	return nil
}

func (r *notificationsService) UpdateNotification(notification *models.Notification) error {
	ctx := context.Background()
	_, err := r.db.UpdateNotification(ctx, gen.UpdateNotificationParams{
		UserID:  int32(notification.UserID),
		Content: notification.Content,
		Read:    notification.Read,
		ID:      notification.ID,
	})
	if err != nil {
		return fmt.Errorf("failed to update notification: %v", err)
	}
	return nil
}

func (r *notificationsService) DeleteNotification(id int32) error {
	ctx := context.Background()
	err := r.db.DeleteNotification(ctx, id)
	if err != nil {
		return fmt.Errorf("failed to delete notification: %v", err)
	}
	return nil
}
