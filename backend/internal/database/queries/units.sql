-- name: CreateUnit :one
INSERT INTO units (
    course_id,
    unit_number,
    name,
    description
)
VALUES (
    @course_id::int,
    @unit_number::int,
    @name::text,
    @description::text
)
RETURNING id;

-- name: GetUnitsCount :one
SELECT COUNT(*) FROM units;

-- name: GetUnitByID :one
SELECT * FROM units
WHERE id = @unit_id::int;

-- name: GetUnitsByCourseID :many
SELECT * FROM units
WHERE course_id = @course_id::int;

-- name: UpdateUnit :exec
UPDATE units
SET name = @name::text,
    description = @description::text
WHERE id = @unit_id::int;

-- name: UpdateUnitNumber :exec
UPDATE units
SET unit_number = @unit_number::int
WHERE id = @unit_id::int;

-- name: DeleteUnit :exec
DELETE FROM units
WHERE id = @unit_id::int;