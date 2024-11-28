-- Active: 1730670681335@@127.0.0.1@5432@algolearn
-- modules.sql

-- name: GetModuleProgressFull
SELECT jsonb_build_object(
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
                                                SELECT jsonb_build_object('text', ts.content)
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
                                                                SELECT jsonb_agg( jsonb_build_object(
                                                                        'id', qo.id,
                                                                        'content', qo.content,
                                                                        'isCorrect', qo.is_correct
                                                                ))
                                                                FROM question_options qo
                                                                WHERE qo.question_id = q.id
                                                        ), '[]'::jsonb
                                                        ),
                                                        'userQuestionAnswer', COALESCE(jsonb_build_object(
                                                                'answerId', uqn.answer_id,
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
                JOIN (
                    SELECT DISTINCT ON (section_id) *
                    FROM user_section_progress
                ) usp ON usp.section_id = s.id
                WHERE s.module_id = m.id
                        ), '[]'::jsonb)
                )
FROM modules AS m
JOIN user_module_progress ump ON ump.module_id = m.id
WHERE m.unit_id = 1 AND m.id = 1;

-- name: GetModules
WITH unit_modules AS (
    SELECT * FROM modules WHERE unit_id = 1
                          ORDER BY module_number
    LIMIT 1 OFFSET 3
)
SELECT jsonb_agg(
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
                                           WHEN 'text' THEN (SELECT jsonb_build_object('text', ts.text_content)
                                                             FROM text_sections ts
                                                             WHERE ts.section_id = s.id)
                                           WHEN 'video' THEN (SELECT jsonb_build_object('url', vs.url)
                                                              FROM video_sections vs
                                                              WHERE vs.section_id = s.id)
                                           WHEN 'question' THEN (SELECT jsonb_build_object(
                                                                                'id', qs.question_id,
                                                                                'question', q.question,
                                                                                'type', q.type,
                                                                                'options', COALESCE(
                                                                                        (SELECT jsonb_agg(jsonb_build_object(
                                                                                                'id', qo.id,
                                                                                                'content', qo.content,
                                                                                                'isCorrect',
                                                                                                qo.is_correct
                                                                                                          ))
                                                                                         FROM question_options qo
                                                                                         WHERE qo.question_id = q.id),
                                                                                        '[]'::jsonb)
                                                                        )
                                                                 FROM question_sections qs
                                                                          JOIN questions q ON q.id = qs.question_id
                                                                 WHERE qs.section_id = s.id)
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
                LEFT JOIN user_section_progress usp ON usp.section_id = s.id AND usp.user_id = 4
                WHERE s.module_id = m.id
                    )
                   , '[]'::jsonb)
    )
)
FROM unit_modules m
LEFT JOIN user_module_progress ump ON ump.module_id = m.id AND ump.user_id = 4;

WITH unit_modules AS (
    SELECT * FROM modules WHERE unit_id = $1
    LIMIT 1 OFFSET 3
)
SELECT jsonb_agg(
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
                                                                                               WHEN 'text' THEN (SELECT jsonb_build_object('text', ts.text_content)
                                                                                                                 FROM text_sections ts
                                                                                                                 WHERE ts.section_id = s.id)
                                                                                               WHEN 'video' THEN (SELECT jsonb_build_object('url', vs.url)
                                                                                                                  FROM video_sections vs
                                                                                                                  WHERE vs.section_id = s.id)
                                                                                               WHEN 'question' THEN (SELECT jsonb_build_object(
                                                                                                                                    'id', qs.question_id,
                                                                                                                                    'question', q.question,
                                                                                                                                    'type', q.type,
                                                                                                                                    'options', COALESCE(
                                                                                                                                            (SELECT jsonb_agg(jsonb_build_object(
                                                                                                                                                    'id', qo.id,
                                                                                                                                                    'content', qo.content,
                                                                                                                                                    'isCorrect',
                                                                                                                                                    qo.is_correct
                                                                                                                                                              ))
                                                                                                                                             FROM question_options qo
                                                                                                                                             WHERE qo.question_id = q.id),
                                                                                                                                            '[]'::jsonb)
                                                                                                                            )
                                                                                                                     FROM question_sections qs
                                                                                                                              JOIN questions q ON q.id = qs.question_id
                                                                                                                     WHERE qs.section_id = s.id)
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
                                                LEFT JOIN user_section_progress usp ON usp.section_id = s.id AND usp.user_id = $2
                                                WHERE s.module_id = m.id
                                            )
                           , '[]'::jsonb)
               )
       )
FROM unit_modules m
LEFT JOIN user_module_progress ump ON ump.module_id = m.id AND ump.user_id = $3;

-- name: GetModule
WITH
    unit_modules AS (
        SELECT id, module_number
        FROM modules
        WHERE
            unit_id = 1
        ORDER BY module_number ASC
    ),
    current_module AS (
        SELECT id, module_number
        FROM unit_modules
        WHERE
            id = 1
    )
SELECT id, module_number
FROM unit_modules
WHERE
    module_number > (
        SELECT module_number
        FROM current_module
    )
ORDER BY module_number ASC
LIMIT 1;

SELECT * FROM modules WHERE unit_id = 1 ORDER BY module_number ASC;


DELETE FROM modules WHERE id = 8;


SELECT * FROM user_question_answers;