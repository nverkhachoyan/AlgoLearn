-- name: GetModuleWithProgress :one
WITH unit_modules AS (
    SELECT id, module_number
    FROM modules
    WHERE unit_id = @unit_id::int
    ORDER BY module_number ASC
),
current_module AS (
    SELECT id, module_number
    FROM unit_modules
    WHERE id = @module_id::int
)
SELECT
    jsonb_build_object(
        'id', m.id,
        'createdAt', m.created_at,
        'updatedAt', m.updated_at,
        'moduleNumber', m.module_number,
        'unitId', m.unit_id,
        'name', m.name,
        'description', m.description,
        'progress', ump.progress,
        'status', ump.status,
        'sections', COALESCE((
            SELECT DISTINCT jsonb_agg(
                jsonb_build_object(
                    'id', s.id,
                    'createdAt', s.created_at,
                    'updatedAt', s.updated_at,
                    'type', s.type,
                    'position', s.position,
                    'content', CASE s.type
                        WHEN 'text' THEN (
                            SELECT jsonb_build_object('text', ts.text_content)
                            FROM text_sections ts
                            WHERE ts.section_id = s.id
                        )
                        WHEN 'video' THEN (
                            SELECT jsonb_build_object('url', vs.url)
                            FROM video_sections vs
                            WHERE vs.section_id = s.id
                        )
                        WHEN 'question' THEN (
                            SELECT jsonb_build_object(
                                'id', qs.question_id,
                                'question', q.question,
                                'type', q.type,
                                'options', COALESCE((
                                    SELECT jsonb_agg(jsonb_build_object(
                                        'id', qo.id,
                                        'content', qo.content,
                                        'isCorrect', qo.is_correct
                                    ))
                                    FROM question_options qo
                                    WHERE qo.question_id = q.id
                                ), '[]'::jsonb),
                                'userQuestionAnswer', COALESCE(jsonb_build_object(
                                    'optionId', uqn.option_id,
                                    'answeredAt', uqn.answered_at,
                                    'isCorrect', uqn.is_correct
                                ), NULL)
                            )
                            FROM question_sections qs
                            JOIN questions q ON q.id = qs.question_id
                            LEFT JOIN user_question_answers uqn ON uqn.question_id = qs.question_id
                            WHERE qs.section_id = s.id
                        )
                    END,
                    'sectionProgress', jsonb_build_object(
                        'startedAt', usp.started_at,
                        'completedAt', usp.completed_at,
                        'hasSeen', usp.has_seen,
                        'seenAt', usp.seen_at
                    )
                )
            )
            FROM sections s
            LEFT JOIN user_section_progress usp ON usp.section_id = s.id
            WHERE s.module_id = m.id
        ), '[]'::jsonb)
    ) as module,
    (
        SELECT id
        FROM unit_modules
        WHERE module_number > (SELECT module_number FROM current_module)
        ORDER BY module_number ASC LIMIT 1
    ) as next_module_id,
    EXISTS (
        SELECT 1
        FROM unit_modules
        WHERE module_number > (SELECT module_number FROM current_module)
        LIMIT 1
    ) as has_next_module
FROM modules m
LEFT JOIN user_module_progress ump ON ump.module_id = m.id
WHERE m.unit_id = @unit_id::int AND m.id = @module_id::int;

-- name: GetModulesWithProgress :one
WITH unit_modules AS (
    SELECT *
    FROM modules
    WHERE unit_id = @unit_id::int
    ORDER BY module_number
    LIMIT @page_size::int
    OFFSET @page_offset::int
)
SELECT COALESCE(
    jsonb_agg(
        jsonb_build_object(
            'id', m.id,
            'createdAt', m.created_at,
            'updatedAt', m.updated_at,
            'moduleNumber', m.module_number,
            'unitId', m.unit_id,
            'name', m.name,
            'description', m.description,
            'progress', ump.progress,
            'status', ump.status,
            'sections', COALESCE((
                SELECT DISTINCT jsonb_agg(
                    jsonb_build_object(
                        'id', s.id,
                        'type', s.type,
                        'position', s.position,
                        'content', CASE s.type
                            WHEN 'text' THEN (
                                SELECT jsonb_build_object('text', ts.text_content)
                                FROM text_sections ts
                                WHERE ts.section_id = s.id
                            )
                            WHEN 'video' THEN (
                                SELECT jsonb_build_object('url', vs.url)
                                FROM video_sections vs
                                WHERE vs.section_id = s.id
                            )
                            WHEN 'question' THEN (
                                SELECT jsonb_build_object(
                                    'id', qs.question_id,
                                    'question', q.question,
                                    'type', q.type,
                                    'options', COALESCE((
                                        SELECT jsonb_agg(jsonb_build_object(
                                            'id', qo.id,
                                            'content', qo.content,
                                            'isCorrect', qo.is_correct
                                        ))
                                        FROM question_options qo
                                        WHERE qo.question_id = q.id
                                    ), '[]'::jsonb)
                                )
                                FROM question_sections qs
                                JOIN questions q ON q.id = qs.question_id
                                WHERE qs.section_id = s.id
                            )
                        END,
                        'sectionProgress', jsonb_build_object(
                            'startedAt', usp.started_at,
                            'completedAt', usp.completed_at,
                            'hasSeen', usp.has_seen,
                            'seenAt', usp.seen_at
                        )
                    )
                )
                FROM sections s
                LEFT JOIN user_section_progress usp ON usp.section_id = s.id AND usp.user_id = @user_id::int
                WHERE s.module_id = m.id
            ), '[]'::jsonb)
        )
    ), '[]'::jsonb
) as modules
FROM unit_modules m
LEFT JOIN user_module_progress ump ON ump.module_id = m.id AND ump.user_id = @user_id::int;

-- name: GetModuleTotalCount :one
SELECT COUNT(*) FROM modules m WHERE m.unit_id = @unit_id::int;

-- name: CreateModule :one
INSERT INTO modules (
    module_number,
    unit_id,
    name,
    description
) VALUES (
    (
        SELECT COALESCE(MAX(module_number), 0) + 1
        FROM modules
        WHERE unit_id = @unit_id::int
    ),
    @unit_id::int,
    @name::text,
    @description::text
) RETURNING *;

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