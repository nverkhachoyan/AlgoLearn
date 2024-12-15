-- name: GetUserByID :one
SELECT *
FROM users
    LEFT JOIN user_preferences ON users.id = user_preferences.user_id
WHERE
    id = $1
LIMIT 1;

-- name: GetUserByEmail :one
SELECT *
FROM users
    LEFT JOIN user_preferences ON users.id = user_preferences.user_id
WHERE
    email = $1
LIMIT 1;

-- name: CreateUser :one
INSERT INTO
    users (
        username,
        email,
        role,
        password_hash,
        oauth_id,
        first_name,
        last_name,
        profile_picture_url,
        bio,
        location
    )
VALUES (
        $1,
        $2,
        $3,
        $4,
        $5,
        $6,
        $7,
        $8,
        $9,
        $10
    ) RETURNING *;

-- name: InsertUserPreferences :one
INSERT INTO
    user_preferences (
        user_id,
        theme,
        language,
        timezone
    )
VALUES ($1, $2, $3, $4) RETURNING *;

-- name: UpdateUserPreferences :one
UPDATE user_preferences
SET
    theme = COALESCE(NULLIF(@theme::text, ''), theme),
    lang = COALESCE(NULLIF(@lang::text, ''), lang),
    timezone = COALESCE(NULLIF(@timezone::text, ''), timezone)
WHERE user_id = @user_id
RETURNING *;

-- name: UpdateUser :one
UPDATE users
SET
    username = COALESCE(NULLIF(@username::text, ''), username),
    email = COALESCE(NULLIF(@email::text, ''), email),
    first_name = COALESCE(NULLIF(@first_name::text, ''), first_name),
    last_name = COALESCE(NULLIF(@last_name::text, ''), last_name),
    profile_picture_url = COALESCE(NULLIF(@profile_picture_url::text, ''), profile_picture_url),
    bio = COALESCE(NULLIF(@bio::text, ''), bio),
    location = COALESCE(NULLIF(@location::text, ''), location),
    updated_at = NOW()
WHERE id = @id
RETURNING *;

-- name: DeleteUser :exec
DELETE FROM users WHERE id = @id;