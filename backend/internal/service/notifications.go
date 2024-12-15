package service

import (
	"algolearn/internal/models"
	"database/sql"
)

type NotificationsService interface {
	GetAllNotifications() ([]models.Notification, error)
	GetNotificationByID(id int) (*models.Notification, error)
	CreateNotification(notification *models.Notification) error
	UpdateNotification(notification *models.Notification) error
	DeleteNotification(id int) error
}

type notificationsService struct {
	db *sql.DB
}

func NewNotificationsService(db *sql.DB) NotificationsService {
	return &notificationsService{db: db}
}

func (r *notificationsService) GetAllNotifications() ([]models.Notification, error) {
	rows, err := r.db.Query("SELECT id, user_id, content, read, created_at FROM notifications")
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var notifications []models.Notification
	for rows.Next() {
		var notification models.Notification
		err := rows.Scan(&notification.ID, &notification.UserID, &notification.Content, &notification.Read, &notification.CreatedAt)
		if err != nil {
			return nil, err
		}
		notifications = append(notifications, notification)
	}

	if err := rows.Err(); err != nil {
		return nil, err
	}

	return notifications, nil
}

func (r *notificationsService) GetNotificationByID(id int) (*models.Notification, error) {
	row := r.db.QueryRow("SELECT id, user_id, content, read, created_at FROM notifications WHERE id = $1", id)

	var notification models.Notification
	err := row.Scan(&notification.ID, &notification.UserID, &notification.Content, &notification.Read, &notification.CreatedAt)
	if err != nil {
		return nil, err
	}

	return &notification, nil
}

func (r *notificationsService) CreateNotification(notification *models.Notification) error {
	err := r.db.QueryRow(
		"INSERT INTO notifications (user_id, content, read) VALUES ($1, $2, $3) RETURNING id, created_at",
		notification.UserID, notification.Content, notification.Read,
	).Scan(&notification.ID, &notification.CreatedAt)
	return err
}

func (r *notificationsService) UpdateNotification(notification *models.Notification) error {
	_, err := r.db.Exec(
		"UPDATE notifications SET user_id = $1, content = $2, read = $3, updated_at = CURRENT_TIMESTAMP WHERE id = $4",
		notification.UserID, notification.Content, notification.Read, notification.ID,
	)
	return err
}

func (r *notificationsService) DeleteNotification(id int) error {
	_, err := r.db.Exec("DELETE FROM notifications WHERE id = $1", id)
	return err
}
