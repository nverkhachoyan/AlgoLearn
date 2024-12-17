-- name: GetAllAchievements :many
SELECT * FROM achievements;

-- name: GetAchievementByID :one
SELECT * FROM achievements WHERE id = $1 LIMIT 1;

-- name: CreateAchievement :one
INSERT INTO
    achievements (name, description, points)
VALUES ($1, $2, $3) RETURNING *;

-- name: UpdateAchievement :one
UPDATE achievements
SET
    name = $1,
    description = $2,
    points = $3,
    updated_at = CURRENT_TIMESTAMP
WHERE
    id = $4 RETURNING *;

-- name: DeleteAchievement :exec
DELETE FROM achievements WHERE id = $1;