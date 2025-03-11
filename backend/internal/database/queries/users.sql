-- name: GetUsers :many
SELECT 
    id, 
    username, 
    email, 
    role, 
    first_name, 
    last_name, 
    profile_picture_url, 
    bio, 
    location, 
    created_at, 
    updated_at,
    last_login_at,
    is_active,
    is_email_verified,
    cpus,
    streak,
    last_streak_date
FROM users
WHERE 1=1
    AND (sqlc.narg(role)::text IS NULL OR role = sqlc.narg(role)::user_role)
    AND (sqlc.narg(username)::text IS NULL OR username ILIKE '%' || sqlc.narg(username)::text || '%')
    AND (sqlc.narg(email)::text IS NULL OR email ILIKE '%' || sqlc.narg(email)::text || '%')
    AND (sqlc.narg(first_name)::text IS NULL OR first_name ILIKE '%' || sqlc.narg(first_name)::text || '%')
    AND (sqlc.narg(last_name)::text IS NULL OR last_name ILIKE '%' || sqlc.narg(last_name)::text || '%')
    AND (sqlc.narg(location)::text IS NULL OR location ILIKE '%' || sqlc.narg(location)::text || '%')
    AND (sqlc.narg(bio)::text IS NULL OR bio ILIKE '%' || sqlc.narg(bio)::text || '%')
    AND (sqlc.narg(min_cpus)::int IS NULL OR cpus >= sqlc.narg(min_cpus)::int)
    AND (sqlc.narg(max_cpus)::int IS NULL OR cpus <= sqlc.narg(max_cpus)::int)
    AND (sqlc.narg(min_streak)::int IS NULL OR streak >= sqlc.narg(min_streak)::int)
    AND (sqlc.narg(max_streak)::int IS NULL OR streak <= sqlc.narg(max_streak)::int)
    AND (sqlc.narg(is_active)::boolean IS NULL OR is_active = sqlc.narg(is_active)::boolean)
    AND (sqlc.narg(is_email_verified)::boolean IS NULL OR is_email_verified = sqlc.narg(is_email_verified)::boolean)
    AND (sqlc.narg(created_after)::timestamp IS NULL OR created_at >= sqlc.narg(created_after)::timestamp)
    AND (sqlc.narg(created_before)::timestamp IS NULL OR created_at <= sqlc.narg(created_before)::timestamp)
    AND (sqlc.narg(updated_after)::timestamp IS NULL OR updated_at >= sqlc.narg(updated_after)::timestamp)
    AND (sqlc.narg(updated_before)::timestamp IS NULL OR updated_at <= sqlc.narg(updated_before)::timestamp)
    AND (sqlc.narg(last_login_after)::timestamp IS NULL OR last_login_at >= sqlc.narg(last_login_after)::timestamp)
    AND (sqlc.narg(last_login_before)::timestamp IS NULL OR last_login_at <= sqlc.narg(last_login_before)::timestamp)
    AND (sqlc.narg(last_streak_after)::timestamp IS NULL OR last_streak_date >= sqlc.narg(last_streak_after)::timestamp)
    AND (sqlc.narg(last_streak_before)::timestamp IS NULL OR last_streak_date <= sqlc.narg(last_streak_before)::timestamp)
ORDER BY 
    CASE WHEN sqlc.narg(sort_column)::text = 'id' AND LOWER(sqlc.narg(sort_direction)::text) = 'desc' THEN id END DESC,
    CASE WHEN sqlc.narg(sort_column)::text = 'id' AND LOWER(sqlc.narg(sort_direction)::text) = 'asc' THEN id END ASC,
    CASE WHEN sqlc.narg(sort_column)::text = 'username' AND LOWER(sqlc.narg(sort_direction)::text) = 'desc' THEN username END DESC,
    CASE WHEN sqlc.narg(sort_column)::text = 'username' AND LOWER(sqlc.narg(sort_direction)::text) = 'asc' THEN username END ASC,
    CASE WHEN sqlc.narg(sort_column)::text = 'email' AND LOWER(sqlc.narg(sort_direction)::text) = 'desc' THEN email END DESC,
    CASE WHEN sqlc.narg(sort_column)::text = 'email' AND LOWER(sqlc.narg(sort_direction)::text) = 'asc' THEN email END ASC,
    CASE WHEN sqlc.narg(sort_column)::text = 'role' AND LOWER(sqlc.narg(sort_direction)::text) = 'desc' THEN role::text END DESC NULLS LAST,
    CASE WHEN sqlc.narg(sort_column)::text = 'role' AND LOWER(sqlc.narg(sort_direction)::text) = 'asc' THEN role::text END ASC NULLS LAST,
    CASE WHEN sqlc.narg(sort_column)::text = 'first_name' AND LOWER(sqlc.narg(sort_direction)::text) = 'desc' THEN first_name END DESC NULLS LAST,
    CASE WHEN sqlc.narg(sort_column)::text = 'first_name' AND LOWER(sqlc.narg(sort_direction)::text) = 'asc' THEN first_name END ASC NULLS LAST,
    CASE WHEN sqlc.narg(sort_column)::text = 'last_name' AND LOWER(sqlc.narg(sort_direction)::text) = 'desc' THEN last_name END DESC NULLS LAST,
    CASE WHEN sqlc.narg(sort_column)::text = 'last_name' AND LOWER(sqlc.narg(sort_direction)::text) = 'asc' THEN last_name END ASC NULLS LAST,
    CASE WHEN sqlc.narg(sort_column)::text = 'location' AND LOWER(sqlc.narg(sort_direction)::text) = 'desc' THEN location END DESC NULLS LAST,
    CASE WHEN sqlc.narg(sort_column)::text = 'location' AND LOWER(sqlc.narg(sort_direction)::text) = 'asc' THEN location END ASC NULLS LAST,
    CASE WHEN sqlc.narg(sort_column)::text = 'cpus' AND LOWER(sqlc.narg(sort_direction)::text) = 'desc' THEN cpus END DESC,
    CASE WHEN sqlc.narg(sort_column)::text = 'cpus' AND LOWER(sqlc.narg(sort_direction)::text) = 'asc' THEN cpus END ASC,
    CASE WHEN sqlc.narg(sort_column)::text = 'streak' AND LOWER(sqlc.narg(sort_direction)::text) = 'desc' THEN streak END DESC,
    CASE WHEN sqlc.narg(sort_column)::text = 'streak' AND LOWER(sqlc.narg(sort_direction)::text) = 'asc' THEN streak END ASC,
    CASE WHEN sqlc.narg(sort_column)::text = 'created_at' AND LOWER(sqlc.narg(sort_direction)::text) = 'desc' THEN created_at END DESC,
    CASE WHEN sqlc.narg(sort_column)::text = 'created_at' AND LOWER(sqlc.narg(sort_direction)::text) = 'asc' THEN created_at END ASC,
    CASE WHEN sqlc.narg(sort_column)::text = 'updated_at' AND LOWER(sqlc.narg(sort_direction)::text) = 'desc' THEN updated_at END DESC,
    CASE WHEN sqlc.narg(sort_column)::text = 'updated_at' AND LOWER(sqlc.narg(sort_direction)::text) = 'asc' THEN updated_at END ASC,
    CASE WHEN sqlc.narg(sort_column)::text = 'last_login_at' AND LOWER(sqlc.narg(sort_direction)::text) = 'desc' THEN last_login_at END DESC NULLS LAST,
    CASE WHEN sqlc.narg(sort_column)::text = 'last_login_at' AND LOWER(sqlc.narg(sort_direction)::text) = 'asc' THEN last_login_at END ASC NULLS LAST,
    CASE WHEN sqlc.narg(sort_column)::text = 'last_streak_date' AND LOWER(sqlc.narg(sort_direction)::text) = 'desc' THEN last_streak_date END DESC NULLS LAST,
    CASE WHEN sqlc.narg(sort_column)::text = 'last_streak_date' AND LOWER(sqlc.narg(sort_direction)::text) = 'asc' THEN last_streak_date END ASC NULLS LAST,
    created_at DESC
LIMIT sqlc.arg(page_limit)::int
OFFSET sqlc.arg(page_offset)::int;

-- name: UpdateUserStreak :one
UPDATE users
SET
    streak = @streak::int,
    last_streak_date = @last_streak_date::timestamptz
WHERE id = @id
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
    streak = COALESCE(@streak::int, streak),
    last_streak_date = COALESCE(@last_streak_date::timestamptz, last_streak_date),
    updated_at = NOW()
WHERE id = @id
RETURNING *;

-- name: GetTopUsersByStreak :many
SELECT 
    id, 
    username, 
    profile_picture_url, 
    streak,
    last_streak_date,
    cpus
FROM users
WHERE is_active = true
ORDER BY streak DESC, cpus DESC
LIMIT $1;

-- name: ResetUserStreaks :exec
UPDATE users
SET streak = 0
WHERE last_streak_date < NOW() - INTERVAL '2 days';


-- name: GetUserByEmail :one
SELECT *
FROM users
    LEFT JOIN user_preferences ON users.id = user_preferences.user_id
WHERE
    email = $1
LIMIT 1;

-- name: GetUsersCount :one
SELECT COUNT(*) FROM users;

-- name: GetUserByID :one
SELECT *
FROM users
    LEFT JOIN user_preferences ON users.id = user_preferences.user_id
WHERE
    id = $1
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


-- name: DeleteUser :exec
DELETE FROM users WHERE id = @id;

-- name: GetReceivedAchievementsCount :one
SELECT COUNT(*) FROM user_achievements;

