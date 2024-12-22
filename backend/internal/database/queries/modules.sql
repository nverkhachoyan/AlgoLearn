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
    'lastAccessed', ump.last_accessed,
    'currentSectionId', ump.current_section_id
) as module
FROM modules m
LEFT JOIN user_module_progress ump ON ump.module_id = m.id AND ump.user_id = @user_id::int
WHERE m.unit_id = @unit_id::int AND m.id = @module_id::int;

-- name: GetSingleModuleSections :many
WITH section_content AS (
    SELECT 
        s.id as section_id,
        s.type,
        CASE s.type
            WHEN 'text' THEN (
                SELECT jsonb_build_object('text', text_content)
                FROM text_sections ts
                WHERE ts.section_id = s.id
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
                            AND uqa.question_id = qs2.question_id
                        WHERE qs2.section_id = s.id
                    )
                )
                FROM question_sections qs
                JOIN questions q ON q.id = qs.question_id
                WHERE qs.section_id = s.id
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

-- name: GetModuleTotalCount :one
SELECT COUNT(*) FROM modules WHERE unit_id = @unit_id::int;

-- name: GetNextModuleId :one
SELECT id
FROM modules 
WHERE unit_id = @unit_id::int 
  AND module_number > @module_number::int 
ORDER BY module_number ASC 
LIMIT 1;

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

-- name: SaveModuleProgress :exec
SELECT save_module_progress(@user_id::int, @module_id::int, @sections::jsonb, @questions::jsonb);

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