-- Active: 1730670681335@@127.0.0.1@5432@algolearn
-- modules.sql

-- name: GetModuleProgressFull

SELECT jsonb_agg(
        jsonb_build_object(
        'id', m.id,
        'created_at', m.created_at,
        'updated_at', m.updated_at,
        'module_number', m.module_number,
        'unit_id', m.unit_id,
        'name', m.name,
        'description', m.description,
        'progress', ump.progress,
        'status', ump.status,
        'sections', COALESCE((
                SELECT jsonb_agg(
                                jsonb_build_object(
                                'id', s.id,
                                'created_at', s.created_at,
                                'updated_at', s.updated_at,
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
                                                                        'is_correct', qo.is_correct
                                                                ))
                                                                FROM question_options qo
                                                                WHERE qo.question_id = q.id
                                                        ), '[]'::jsonb
                                                        ),
                                                        'user_question_answer', COALESCE(jsonb_build_object(
                                                                'answer_id', uqn.answer_id,
                                                                'answered_at', uqn.answered_at,
                                                                'is_correct', uqn.is_correct
                                                        ), NULL)
                                                )
                                                FROM question_sections qs
                                                LEFT JOIN questions q ON q.id = qs.question_id
                                                LEFT JOIN user_question_answers uqn ON uqn.question_id = qs.question_id
                                                WHERE qs.section_id = s.id
                                        )
                                        END,
                                        'section_progress', jsonb_build_object(
                                                'started_at', usp.started_at,
                                                'completed_at', usp.completed_at,
                                                'status', usp.status
                                        )
                                )
                                
                        )
                FROM sections s
                LEFT JOIN user_section_progress usp ON usp.section_id = s.id
                WHERE s.module_id = m.id
                        ), '[]'::jsonb)
                )
        )
FROM modules AS m
LEFT JOIN user_module_progress ump ON ump.module_id = m.id
WHERE m.unit_id = 3 AND m.id = 8;