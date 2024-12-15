-- name: GetModuleWithProgress :one
WITH section_content AS (
    SELECT s.id as section_id, 
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
                        SELECT jsonb_build_object(
                            'optionId', uqa.option_id,
                            'answeredAt', uqa.answered_at,
                            'isCorrect', uqa.is_correct
                        )
                        FROM user_question_answers uqa
                        JOIN user_module_progress ump2 ON ump2.id = uqa.user_module_progress_id
                        WHERE ump2.user_id = @user_id::int
                        AND uqa.question_id = q.id
                    )
                )
                FROM question_sections qs
                JOIN questions q ON q.id = qs.question_id
                WHERE qs.section_id = s.id
            )
        END as content
    FROM sections s
    WHERE s.module_id = @module_id::int
),
section_progress AS (
    SELECT 
        s.id as section_id,
        jsonb_build_object(
            'sectionId', s.id,
            'seenAt', usp.seen_at,
            'hasSeen', usp.has_seen,
            'startedAt', usp.started_at,
            'completedAt', usp.completed_at
        ) as progress
    FROM sections s
    LEFT JOIN user_section_progress usp ON usp.section_id = s.id 
    AND usp.user_id = @user_id::int
    WHERE s.module_id = @module_id::int
),
unit_modules AS (
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
            SELECT jsonb_agg(
                jsonb_build_object(
                    'id', s.id,
                    'createdAt', s.created_at,
                    'updatedAt', s.updated_at,
                    'type', s.type,
                    'position', s.position,
                    'content', sc.content,
                    'sectionProgress', sp.progress
                )
                ORDER BY s.position
            )
            FROM sections s
            LEFT JOIN section_content sc ON sc.section_id = s.id
            LEFT JOIN section_progress sp ON sp.section_id = s.id
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
LEFT JOIN user_module_progress ump ON ump.module_id = m.id AND ump.user_id = @user_id::int
WHERE m.unit_id = @unit_id::int AND m.id = @module_id::int;

-- name: GetModulesWithProgress :one
WITH section_content AS (
    SELECT s.id as section_id, s.module_id,
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
                        SELECT jsonb_build_object(
                            'optionId', uqa.option_id,
                            'answeredAt', uqa.answered_at,
                            'isCorrect', uqa.is_correct
                        )
                        FROM user_question_answers uqa
                        JOIN user_module_progress ump2 ON ump2.id = uqa.user_module_progress_id
                        WHERE ump2.user_id = @user_id::int
                        AND uqa.question_id = q.id
                    )
                )
                FROM question_sections qs
                JOIN questions q ON q.id = qs.question_id
                WHERE qs.section_id = s.id
            )
        END as content
    FROM sections s
    WHERE s.module_id IN (SELECT id FROM modules WHERE unit_id = @unit_id::int)
),
section_progress AS (
    SELECT 
        s.id as section_id,
        s.module_id,
        jsonb_build_object(
            'sectionId', s.id,
            'seenAt', usp.seen_at,
            'hasSeen', usp.has_seen,
            'startedAt', usp.started_at,
            'completedAt', usp.completed_at
        ) as progress
    FROM sections s
    LEFT JOIN user_section_progress usp ON usp.section_id = s.id 
    AND usp.user_id = @user_id::int
    WHERE s.module_id IN (SELECT id FROM modules WHERE unit_id = @unit_id::int)
),
unit_modules AS (
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
                SELECT jsonb_agg(
                    jsonb_build_object(
                        'id', s.id,
                        'createdAt', s.created_at,
                        'updatedAt', s.updated_at,
                        'type', s.type,
                        'position', s.position,
                        'content', sc.content,
                        'sectionProgress', sp.progress
                    )
                    ORDER BY s.position
                )
                FROM sections s
                LEFT JOIN section_content sc ON sc.section_id = s.id
                LEFT JOIN section_progress sp ON sp.section_id = s.id
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