-- name: GetAllNotifications :many
SELECT * FROM notifications;

-- name: GetNotificationByID :one
SELECT * FROM notifications WHERE id = $1 LIMIT 1;

-- name: CreateNotification :one
INSERT INTO
    notifications (user_id, content, read)
VALUES ($1, $2, $3) RETURNING *;

-- name: UpdateNotification :one
UPDATE notifications
SET
    user_id = $1,
    content = $2,
    read = $3,
    updated_at = CURRENT_TIMESTAMP
WHERE
    id = $4 RETURNING *;

-- name: DeleteNotification :exec
DELETE FROM notifications WHERE id = $1;