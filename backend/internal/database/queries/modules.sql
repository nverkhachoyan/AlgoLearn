-- name: GetModulesByUnitId :many
SELECT * FROM modules WHERE unit_id = @unit_id::int;

-- name: GetModulesCount :one
SELECT COUNT(*) FROM modules;

-- name: GetModuleWithProgress :one
SELECT jsonb_build_object(
    'id', m.id,
    'createdAt', m.created_at,
    'updatedAt', m.updated_at,
    'moduleNumber', m.module_number,
    'unitId', m.unit_id,
    'name', m.name,
    'description', m.description,
    'progress', COALESCE(ump.progress, 0.0),
    'status', COALESCE(ump.status, 'uninitiated'::module_progress_status),
    'startedAt', ump.started_at,
    'completedAt', ump.completed_at,
    'lastAccessed', ump.last_accessed
) as module
FROM modules m
LEFT JOIN user_module_progress ump ON ump.module_id = m.id AND ump.user_id = @user_id::int
WHERE m.unit_id = @unit_id::int AND m.id = @module_id::int;

-- name: GetSingleModuleSections :many
WITH section_content AS (
    SELECT
        s.id as section_id,
        s.type::section_type as type,
        CASE s.type
            WHEN 'markdown' THEN (
                SELECT jsonb_build_object('markdown', markdown)
                FROM markdown_sections ms
                WHERE ms.section_id = s.id
            )
            WHEN 'video' THEN (
                SELECT jsonb_build_object('url', url)
                FROM video_sections vs
                WHERE vs.section_id = s.id
            )
            WHEN 'question' THEN (
                SELECT jsonb_build_object(
                    'id', q.id,
                    'question', q.question,
                    'type', q.type,
                    'options', COALESCE(
                        (SELECT jsonb_agg(
                            jsonb_build_object(
                                'id', qo.id,
                                'content', qo.content,
                                'isCorrect', qo.is_correct
                            ) ORDER BY qo.id
                        )
                        FROM question_options qo
                        WHERE qo.question_id = q.id
                        ), '[]'::jsonb),
                    'userQuestionAnswer', (
                        SELECT CASE
                            WHEN uqa.id IS NOT NULL THEN
                                jsonb_build_object(
                                    'optionId', uqa.option_id,
                                    'answeredAt', uqa.answered_at,
                                    'isCorrect', uqa.is_correct,
                                    'progress', uqa.progress
                                )
                            ELSE NULL
                        END
                        FROM question_sections qs2
                        LEFT JOIN user_module_progress ump ON ump.module_id = @module_id::int AND ump.user_id = @user_id::int
                        LEFT JOIN user_question_answers uqa ON uqa.user_module_progress_id = ump.id
                            AND uqa.question_id = q.id
                        WHERE qs2.section_id = s.id
                        LIMIT 1
                    )
                )
                FROM question_sections qs
                JOIN questions q ON q.id = qs.question_id
                WHERE qs.section_id = s.id
            )
            WHEN 'code' THEN (
                SELECT jsonb_build_object('code', code, 'language', language)
                FROM code_sections cs
                WHERE cs.section_id = s.id
            )
        END as content
    FROM sections s
    WHERE s.module_id = @module_id::int
)
SELECT
    s.id,
    s.created_at,
    s.updated_at,
    s.type,
    s.position,
    COALESCE(sc.content, '{}'::jsonb)::json as content
FROM sections s
LEFT JOIN section_content sc ON sc.section_id = s.id
WHERE s.module_id = @module_id::int
ORDER BY s.position;

-- name: GetSectionProgress :many
SELECT
    section_id,
    jsonb_build_object(
        'sectionId', section_id,
        'seenAt', seen_at,
        'hasSeen', has_seen,
        'startedAt', started_at,
        'completedAt', completed_at,
        'progress', progress
    ) as progress
FROM user_section_progress
WHERE user_id = @user_id::int AND module_id = @module_id::int;

-- name: GetModuleTotalCountByUnitId :one
SELECT COUNT(*) FROM modules WHERE unit_id = @unit_id::int;

-- name: GetNextModuleId :one
SELECT id
FROM modules
WHERE unit_id = @unit_id::int
  AND module_number > @module_number::int
ORDER BY module_number ASC
LIMIT 1;

-- name: GetPrevModuleId :one
SELECT id
FROM modules
WHERE unit_id = @unit_id::int
  AND module_number < @module_number::int
ORDER BY module_number DESC
LIMIT 1;

-- name: GetNextUnitId :one
SELECT id
FROM units
WHERE course_id = @course_id::int
  AND unit_number > @unit_number::int
ORDER BY unit_number ASC
LIMIT 1;

-- name: GetPrevUnitId :one
SELECT id
FROM units
WHERE course_id = @course_id::int
  AND unit_number < @unit_number::int
ORDER BY unit_number DESC
LIMIT 1;

-- name: GetUnitNumber :one
SELECT unit_number
FROM units
WHERE id = @unit_id::int;

-- name: GetNextUnitModuleId :one
SELECT id
FROM modules
WHERE unit_id = @unit_id::int
ORDER BY module_number ASC
LIMIT 1;

-- name: GetPrevUnitModuleId :one
SELECT id
FROM modules
WHERE unit_id = @unit_id::int
ORDER BY module_number DESC
LIMIT 1;

-- name: GetNextModuleIdInUnitOrNextUnit :one
SELECT id
FROM modules
WHERE unit_id = @unit_id::int
    OR unit_id = (
        SELECT id
        FROM units
        WHERE course_id = @course_id::int
            AND unit_number > @unit_number::int
        ORDER BY unit_number ASC
        LIMIT 1
    )
ORDER BY module_number ASC
LIMIT 1;

-- name: GetNextModuleNumber :one
SELECT module_number
FROM modules
WHERE unit_id = @unit_id::int
    AND module_number > @module_number::int
ORDER BY module_number ASC
LIMIT 1;

-- name: GetModuleByID :one
SELECT * FROM modules WHERE id = @id::int;

-- name: CreateModule :one
WITH new_module AS (
    SELECT COALESCE(MAX(module_number), 0) + 1 as next_number
    FROM modules
    WHERE unit_id = @unit_id::int
)
INSERT INTO modules (
    module_number,
    unit_id,
    name,
    description
) VALUES (
    (SELECT next_number FROM new_module),
    @unit_id::int,
    @name::text,
    @description::text
)
RETURNING *;

-- name: UpdateModule :one
UPDATE modules
SET
    name = COALESCE(NULLIF(@name::text, ''), name),
    description = COALESCE(NULLIF(@description::text, ''), description),
    updated_at = CURRENT_TIMESTAMP
WHERE id = @module_id::int
RETURNING *;

-- name: DeleteModule :exec
DELETE FROM modules WHERE id = @module_id::int;

-- name: GetModulesList :many
SELECT
    m.*,
    jsonb_build_object(
        'progress', COALESCE(ump.progress, 0.0),
        'status', COALESCE(ump.status, 'uninitiated'::module_progress_status),
        'startedAt', ump.started_at,
        'completedAt', ump.completed_at,
        'lastAccessed', ump.last_accessed,
        'currentSectionId', ump.current_section_id
    )::json as module_progress
FROM modules m
LEFT JOIN user_module_progress ump ON ump.module_id = m.id AND ump.user_id = @user_id::int
WHERE m.unit_id = @unit_id::int
ORDER BY m.module_number
LIMIT @page_size::int
OFFSET @page_offset::int;

-- name: GetLastModuleNumber :one
SELECT COALESCE(MAX(module_number), 0) as last_number
FROM modules
WHERE
    unit_id = @unit_id::int;

-- name: InsertModule :one
INSERT INTO
    modules (
        module_number,
        unit_id,
        name,
        description
    )
VALUES ($1, $2, $3, $4) RETURNING *;

-- name: InsertSection :one
INSERT INTO
    sections (module_id, type, position)
VALUES (sqlc.arg(module_id), sqlc.arg(section_type)::section_type, sqlc.arg(position)) RETURNING *;

-- name: InsertMarkdownSection :exec
INSERT INTO
    markdown_sections (section_id, markdown)
VALUES ($1, $2);

-- name: InsertVideoSection :exec
INSERT INTO video_sections (section_id, url) VALUES ($1, $2);

-- name: InsertQuestion :one
INSERT INTO
    questions (
        type,
        question,
        difficulty_level
    )
VALUES ($1, $2, $3) RETURNING *;

-- name: InsertQuestionSection :exec
INSERT INTO
    question_sections (section_id, question_id)
VALUES ($1, $2);

-- name: InsertQuestionOption :exec
INSERT INTO
    question_options (
        question_id,
        content,
        is_correct
    )
VALUES ($1, $2, $3);

-- name: InsertCodeSection :exec
INSERT INTO
    code_sections (section_id, code, language)
VALUES ($1, $2, $3);

-- name: InsertTag :one
INSERT INTO
    tags (name)
VALUES ($1) ON CONFLICT (name) DO
UPDATE
SET
    name = EXCLUDED.name RETURNING id;

-- name: InsertQuestionTag :exec
INSERT INTO question_tags (question_id, tag_id) VALUES ($1, $2);

-- name: GetCourseAndUnitIDs :one
SELECT u.course_id, m.unit_id
FROM modules m
    JOIN units u ON m.unit_id = u.id
WHERE
    m.id = $1;

-- name: UpsertUserModuleProgress :one
INSERT INTO user_module_progress (
    user_id,
    module_id,
    status,
    progress
)
VALUES (
    $1,
    $2,
    'in_progress',
    COALESCE($3, 0)
)
ON CONFLICT (user_id, module_id)
DO UPDATE SET
    progress = COALESCE($3, user_module_progress.progress),
    status = CASE
        WHEN $3 >= 100 THEN 'completed'::module_progress_status
        ELSE 'in_progress'::module_progress_status
    END,
    completed_at = CASE
        WHEN $3 >= 100 THEN NOW()
        ELSE NULL
    END,
    updated_at = NOW()
RETURNING id;

-- name: UpsertSectionProgress :exec
INSERT INTO
    user_section_progress (
        user_id,
        module_id,
        section_id,
        has_seen,
        seen_at
    )
VALUES ($1, $2, $3, $4, $5) ON CONFLICT (user_id, section_id) DO
UPDATE
SET
    has_seen = EXCLUDED.has_seen,
    seen_at = EXCLUDED.seen_at;

-- name: UpsertQuestionAnswer :exec
INSERT INTO
    user_question_answers (
        user_module_progress_id,
        question_id,
        option_id,
        is_correct,
        answered_at
    )
VALUES (
        $1,
        $2,
        $3,
        $4,
        COALESCE($5, NOW())
    ) ON CONFLICT (
        user_module_progress_id,
        question_id
    ) DO
UPDATE
SET
    option_id = EXCLUDED.option_id,
    is_correct = EXCLUDED.is_correct,
    answered_at = EXCLUDED.answered_at,
    updated_at = NOW();

-- name: CalculateModuleProgress :one
SELECT
    CASE
        WHEN COUNT(*) = 0 THEN 0::float
        ELSE (
            COUNT(CASE
                WHEN s.type = 'question' THEN
                    CASE WHEN uqa.is_correct THEN 1 END
                ELSE
                    CASE WHEN usp.has_seen THEN 1 END
            END)::FLOAT / COUNT(*)::FLOAT
        ) * 100
    END as progress
FROM sections s
LEFT JOIN user_section_progress usp
    ON usp.section_id = s.id
    AND usp.user_id = $1
LEFT JOIN question_sections qs
    ON s.id = qs.section_id
LEFT JOIN user_question_answers uqa
    ON qs.question_id = uqa.question_id
    AND uqa.user_module_progress_id = $2
WHERE s.module_id = $3;

-- name: CalculateCourseProgress :one
SELECT
    CASE
        WHEN COUNT(*) = 0 THEN 0::float
        ELSE (
            COUNT(CASE WHEN ump.status = 'completed' THEN 1 END)::FLOAT /
            COUNT(*)::FLOAT
        ) * 100
    END as progress
FROM modules m
JOIN units u ON m.unit_id = u.id
LEFT JOIN user_module_progress ump
    ON ump.module_id = m.id
    AND ump.user_id = $1
WHERE u.course_id = $2;

-- name: UpsertUserCourse :exec
INSERT INTO
    user_courses (user_id, course_id, progress)
VALUES ($1, $2, $3) ON CONFLICT (user_id, course_id) DO
UPDATE
SET
    progress = EXCLUDED.progress,
    updated_at = NOW();

-- name: GetFurthestModuleID :one
SELECT furthest_module_id
FROM user_courses
WHERE user_id = @user_id::int
  AND course_id = @course_id::int;

-- name: IsModuleFurtherThan :one
SELECT EXISTS (
  SELECT 1
  FROM modules m1
  JOIN units u1 ON m1.unit_id = u1.id
  JOIN modules m2 ON m2.id = @furthest_module_id::int
  JOIN units u2 ON m2.unit_id = u2.id
  WHERE m1.id = @module_id::int
    AND (
      u1.unit_number > u2.unit_number
      OR (u1.unit_number = u2.unit_number AND m1.module_number > m2.module_number)
    )
) as is_further;

-- name: GetFirstModuleIdInUnit :one
SELECT id
FROM modules
WHERE unit_id = @unit_id::int
ORDER BY module_number ASC
LIMIT 1;
