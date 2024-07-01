package repository

import (
	"algolearn-backend/internal/config"
	"algolearn-backend/internal/models"
)

func GetAllNotifications() ([]models.Notification, error) {
	db := config.GetDB()
	rows, err := db.Query("SELECT id, user_id, content, read, created_at FROM notifications")
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

func GetNotificationByID(id int) (*models.Notification, error) {
	db := config.GetDB()
	row := db.QueryRow("SELECT id, user_id, content, read, created_at FROM notifications WHERE id = $1", id)

	var notification models.Notification
	err := row.Scan(&notification.ID, &notification.UserID, &notification.Content, &notification.Read, &notification.CreatedAt)
	if err != nil {
		return nil, err
	}

	return &notification, nil
}

func CreateNotification(notification *models.Notification) error {
	db := config.GetDB()
	err := db.QueryRow(
		"INSERT INTO notifications (user_id, content, read) VALUES ($1, $2, $3) RETURNING id, created_at",
		notification.UserID, notification.Content, notification.Read,
	).Scan(&notification.ID, &notification.CreatedAt)
	return err
}

func UpdateNotification(notification *models.Notification) error {
	db := config.GetDB()
	_, err := db.Exec(
		"UPDATE notifications SET user_id = $1, content = $2, read = $3, updated_at = CURRENT_TIMESTAMP WHERE id = $4",
		notification.UserID, notification.Content, notification.Read, notification.ID,
	)
	return err
}

func DeleteNotification(id int) error {
	db := config.GetDB()
	_, err := db.Exec("DELETE FROM notifications WHERE id = $1", id)
	return err
}
