-- Active: 1730670681335@@127.0.0.1@5432@algolearn
-- progress.sql

-- name: GetCoursesProgressSummary
SELECT DISTINCT ON (c.id)
            COUNT(*) OVER() AS total_count,
            c.id,
            c.created_at,
            c.updated_at,
            c.name,
            c.description,
            NULLIF(c.requirements, ''),
            NULLIF(c.what_you_learn, ''),
            COALESCE(c.background_color, ''),
            COALESCE(c.icon_url, ''),
            c.duration,
            c.difficulty_level,
            COALESCE((SELECT json_agg(jsonb_build_object(
                    'id', ca.author_id,
                    'name', a.name
                                      ))
                      FROM course_authors ca
                               LEFT JOIN authors a ON a.id = ca.author_id
                      WHERE ca.course_id = c.id
                     ), '[]'::json) AS authors,
            COALESCE((SELECT json_agg(jsonb_build_object(
                    'id', t.id,
                    'name', t.name
                                      ))
                      FROM course_tags ct
                               LEFT JOIN tags t ON t.id = ct.tag_id
                      WHERE ct.course_id = c.id
                     ), '[]'::json) AS tags,
            c.rating,
            NULLIF(u.id, 0) AS unit_id,
            u.created_at AS unit_created_at,
            u.updated_at AS unit_updated_at,
            u.unit_number AS unit_number,
            NULLIF(u.name, '') AS unit_name,
            NULLIF(u.description, '') AS unit_description,
            NULLIF(m.id, 0) AS module_id,
            m.created_at AS module_created_at,
            m.updated_at AS module_updated_at,
            m.module_number AS module_number,
            NULLIF(m.unit_id, 0) AS module_unit_id,
            NULLIF(m.name, '') AS module_name,
            NULLIF(m.description, '') AS module_description
FROM courses c
         LEFT JOIN user_courses uc ON uc.course_id = c.id AND uc.user_id = 4
         LEFT JOIN units u ON u.id = uc.current_unit_id
         LEFT JOIN modules m ON m.id = uc.current_module_id
-- learning
WHERE (uc.current_unit_id IS NOT NULL OR uc.current_module_id IS NOT NULL) AND uc.user_id = 4
-- explore
-- WHERE (uc.current_unit_id IS NULL AND uc.current_module_id IS NULL OR uc.user_id != 4 OR uc.user_id IS NULL)
ORDER BY c.id, uc.updated_at DESC
LIMIT 5 OFFSET 0;


-- name: GetCourseProgressSummary
SELECT DISTINCT ON (c.id)
    c.id,
    c.created_at,
    c.updated_at,
    c.name,
    c.description,
    NULLIF(c.requirements, ''),
    NULLIF(c.what_you_learn, ''),
    NULLIF(c.background_color, '') AS background_color,
    NULLIF(c.icon_url, '') AS icon_url,
    c.duration,
    c.difficulty_level,
    COALESCE((SELECT json_agg(jsonb_build_object(
            'id', ca.author_id,
            'name', a.name))
              FROM course_authors ca
              LEFT JOIN authors a ON a.id = ca.author_id
              WHERE ca.course_id = c.id
             ), '[]'::json) AS authors,
    COALESCE((SELECT json_agg(jsonb_build_object(
            'id', t.id,
            'name', t.name))
              FROM course_tags ct
              LEFT JOIN tags t ON t.id = ct.tag_id
              WHERE ct.course_id = c.id
             ), '[]'::json) AS tags,
    c.rating,
    jsonb_build_object(
            'id', u.id,
            'created_at', u.created_at,
            'updated_at', u.updated_at,
            'unit_number', u.unit_number,
            'name', u.name,
            'description', u.description
    ) AS current_unit,
    jsonb_build_object(
            'id', m.id,
            'created_at', m.created_at,
            'updated_at', m.updated_at,
            'module_number', m.module_number,
            'unit_id', m.unit_id,
            'name', m.name,
            'description', m.description,
            'progress', ump.progress,
            'status', ump.status
    ) AS current_module,
    COALESCE((SELECT jsonb_agg(
    jsonb_build_object(
    'id', sub_u.id,
    'created_at', sub_u.created_at,
    'updated_at', sub_u.updated_at,
    'unit_number', sub_u.unit_number,
    'course_id', sub_u.course_id,
    'name', sub_u.name,
    'description', sub_u.description,
    'modules', COALESCE((SELECT
                jsonb_agg(
                    jsonb_build_object(
                        'id', sub_m.id,
                        'created_at', sub_m.created_at,
                        'updated_at', sub_m.updated_at,
                        'module_number', sub_m.module_number,
                        'unit_id', sub_m.unit_id,
                        'name', sub_m.name,
                        'description', sub_m.description,
                        'progress', sub_ump.progress,
                        'status', sub_ump.status
                    )
                )
                FROM modules AS sub_m
                LEFT JOIN user_module_progress sub_ump ON sub_ump.module_id = sub_m.id
                WHERE sub_u.id = sub_m.unit_id
                ),
                '[]'::jsonb)
    ))
    FROM units AS sub_u
    WHERE sub_u.course_id = c.id
    ),
    '[]'::jsonb) AS units
FROM courses c
JOIN user_courses uc ON uc.course_id = c.id AND uc.user_id = 4
LEFT JOIN units u ON u.id = uc.current_unit_id
LEFT JOIN modules m ON m.id = uc.current_module_id
JOIN user_module_progress ump ON ump.module_id = m.id
WHERE c.id = 2
ORDER BY c.id, uc.updated_at DESC;


-- name: GetCourseProgressFull
SELECT DISTINCT ON (c.id)
    c.id,
    c.created_at,
    c.updated_at,
    c.name,
    c.description,
    NULLIF(c.requirements, ''),
    NULLIF(c.what_you_learn, ''),
    NULLIF(c.background_color, '') AS background_color,
    NULLIF(c.icon_url, '') AS icon_url,
    c.duration,
    c.difficulty_level,
    COALESCE((SELECT json_agg(jsonb_build_object(
            'id', ca.author_id,
            'name', a.name))
              FROM course_authors ca
              LEFT JOIN authors a ON a.id = ca.author_id
              WHERE ca.course_id = c.id
             ), '[]'::json) AS authors,
    COALESCE((SELECT json_agg(jsonb_build_object(
            'id', t.id,
            'name', t.name))
              FROM course_tags ct
              LEFT JOIN tags t ON t.id = ct.tag_id
              WHERE ct.course_id = c.id
             ), '[]'::json) AS tags,
    c.rating,
    jsonb_build_object(
            'id', u.id,
            'created_at', u.created_at,
            'updated_at', u.updated_at,
            'unit_number', u.unit_number,
            'name', u.name,
            'description', u.description
    ) AS current_unit,
    jsonb_build_object(
            'id', m.id,
            'created_at', m.created_at,
            'updated_at', m.updated_at,
            'module_number', m.module_number,
            'unit_id', m.unit_id,
            'name', m.name,
            'description', m.description,
            'progress', ump.progress,
            'status', ump.status
    ) AS current_module,
    COALESCE((SELECT jsonb_agg(
    jsonb_build_object(
    'id', sub_u.id,
    'created_at', sub_u.created_at,
    'updated_at', sub_u.updated_at,
    'unit_number', sub_u.unit_number,
    'course_id', sub_u.course_id,
    'name', sub_u.name,
    'description', sub_u.description,
    'modules', COALESCE((SELECT
                jsonb_agg(
                    jsonb_build_object(
                        'id', sub_m.id,
                        'created_at', sub_m.created_at,
                        'updated_at', sub_m.updated_at,
                        'module_number', sub_m.module_number,
                        'unit_id', sub_m.unit_id,
                        'name', sub_m.name,
                        'description', sub_m.description,
                        'progress', sub_ump.progress,
                        'status', sub_ump.status,
                        'sections', COALESCE((
                                SELECT jsonb_agg(
                                        jsonb_build_object(
                                        'id', sub_s.id,
                                        'created_at', sub_s.created_at,
                                        'updated_at', sub_s.updated_at,
                                        'type', sub_s.type,
                                        'position', sub_s.position,
                                        'content', CASE sub_s.type
                                                WHEN 'text' THEN (
                                                        SELECT jsonb_build_object('text', ts.content)
                                                        FROM text_sections ts
                                                        WHERE ts.section_id = sub_s.id
                                                )
                                                WHEN 'video' THEN (
                                                        SELECT jsonb_build_object('url', vs.url)
                                                        FROM video_sections vs
                                                        WHERE vs.section_id = sub_s.id
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
                                                        WHERE qs.section_id = sub_s.id
                                                )
                                                END,
                                                'section_progress', jsonb_build_object(
                                                        'started_at', usp.started_at,
                                                        'completed_at', usp.completed_at,
                                                        'status', usp.status
                                                )
                                        )
                                        
                                )
                                FROM sections sub_s
                                LEFT JOIN user_section_progress usp ON usp.section_id = sub_s.id
                                WHERE sub_s.module_id = sub_m.id
                        ), '[]'::jsonb)
                    )
                )
                FROM modules AS sub_m
                LEFT JOIN user_module_progress sub_ump ON sub_ump.module_id = sub_m.id
                WHERE sub_u.id = sub_m.unit_id
                ),
                '[]'::jsonb)
    ))
    FROM units AS sub_u
    WHERE sub_u.course_id = c.id
    ),
    '[]'::jsonb) AS units
FROM courses c
JOIN user_courses uc ON uc.course_id = c.id AND uc.user_id = 4
LEFT JOIN units u ON u.id = uc.current_unit_id
LEFT JOIN modules m ON m.id = uc.current_module_id
JOIN user_module_progress ump ON ump.module_id = m.id
WHERE c.id = 2
ORDER BY c.id, uc.updated_at DESC;

-- name: GetCourseSummary
SELECT DISTINCT ON (c.id)
    c.id,
    c.created_at,
    c.updated_at,
    c.name,
    c.description,
    NULLIF(c.requirements, '') AS requirements,
    NULLIF(c.what_you_learn, '') AS what_you_learn,
    NULLIF(c.background_color, '') AS backgroundColor,
    NULLIF(c.icon_url, '') AS icon_url,
    c.duration,
    c.difficulty_level,
    COALESCE((SELECT json_agg(jsonb_build_object(
            'id', ca.author_id,
            'name', a.name))
              FROM course_authors ca
              LEFT JOIN authors a ON a.id = ca.author_id
              WHERE ca.course_id = c.id
             ), '[]'::json) AS authors,
    COALESCE((SELECT json_agg(jsonb_build_object(
            'id', t.id,
            'name', t.name))
              FROM course_tags ct
              LEFT JOIN tags t ON t.id = ct.tag_id
              WHERE ct.course_id = c.id
             ), '[]'::json) AS tags,
    c.rating,
    COALESCE((SELECT jsonb_agg(
    jsonb_build_object(
    'id', sub_u.id,
    'createdAt', sub_u.created_at,
    'updatedAt', sub_u.updated_at,
    'unitNumber', sub_u.unit_number,
    'courseId', sub_u.course_id,
    'name', sub_u.name,
    'description', sub_u.description,
    'modules', COALESCE((SELECT
                jsonb_agg(
                    jsonb_build_object(
                        'id', sub_m.id,
                        'createdAt', sub_m.created_at,
                        'updatedAt', sub_m.updated_at,
                        'moduleNumber', sub_m.module_number,
                        'unitId', sub_m.unit_id,
                        'name', sub_m.name,
                        'description', sub_m.description
                    )
                )
                FROM modules AS sub_m
                WHERE sub_u.id = sub_m.unit_id
                ),
                '[]'::jsonb)
    ))
    FROM units AS sub_u
    WHERE sub_u.course_id = c.id
    ),
    '[]'::jsonb) AS units
FROM courses c
LEFT JOIN units u ON u.course_id = c.id
LEFT JOIN modules m ON m.unit_id = u.id
WHERE c.id = 3
ORDER BY c.id;

-- name: GetCourseFull
SELECT DISTINCT ON (c.id)
	c.id,
	c.created_at,
	c.updated_at,
	c.name,
	c.description,
	NULLIF(c.requirements, '') AS requirements,
	NULLIF(c.what_you_learn, '') AS what_you_learn,
	NULLIF(c.background_color, '') AS background_color,
	NULLIF(c.icon_url, '') AS icon_url,
	c.duration,
	c.difficulty_level,
	COALESCE((SELECT json_agg(jsonb_build_object(
                'id', ca.author_id,
                'name', a.name))
	        FROM course_authors ca
	        LEFT JOIN authors a ON a.id = ca.author_id
	        WHERE ca.course_id = c.id
	), '[]'::json) AS authors,
	COALESCE((SELECT json_agg(jsonb_build_object(
                'id', t.id,
                'name', t.name))
	        FROM course_tags ct
	        LEFT JOIN tags t ON t.id = ct.tag_id
	        WHERE ct.course_id = c.id
	), '[]'::json) AS tags,
	c.rating,
	COALESCE((SELECT jsonb_agg(jsonb_build_object(
                'id', sub_u.id,
                'createdAt', sub_u.created_at,
                'updatedAt', sub_u.updated_at,
                'unitNumber', sub_u.unit_number,
                'courseId', sub_u.course_id,
                'name', sub_u.name,
	            'description', sub_u.description,
	            'modules', COALESCE((
	            SELECT jsonb_agg(jsonb_build_object(
                        'id', sub_m.id,
                        'createdAt', sub_m.created_at,
                        'updatedAt', sub_m.updated_at,
                        'moduleNumber', sub_m.module_number,
                        'unitId', sub_m.unit_id,
                        'name', sub_m.name,
                        'description', sub_m.description,
                        'sections', COALESCE((
                        SELECT jsonb_agg(jsonb_build_object(
                                'id', sub_s.id,
                                'createdAt', sub_s.created_at,
                                'updatedAt', sub_s.updated_at,
                                'type', sub_s.type,
                                'position', sub_s.position,
                                'content', CASE sub_s.type
                                        WHEN 'text' THEN (
                                            SELECT jsonb_build_object('text', ts.content)
                                            FROM text_sections ts
                                            WHERE ts.section_id = sub_s.id)
                                        WHEN 'video' THEN (
                                            SELECT jsonb_build_object('url', vs.url)
                                            FROM video_sections vs
                                            WHERE vs.section_id = sub_s.id)
                                        WHEN 'question' THEN (
                                            SELECT jsonb_build_object(
                                            'id', qs.question_id,
                                            'question', q.question,
                                            'type', q.type,
                                            'options', COALESCE((SELECT jsonb_agg( jsonb_build_object(
                                                    'id', qo.id,
                                                    'content', qo.content,
                                                    'isCorrect', qo.is_correct
                                                    ))
                                                            FROM question_options qo
                                                            WHERE qo.question_id = q.id
                                            ), '[]'::jsonb))
                                                FROM question_sections qs
                                                LEFT JOIN questions q ON q.id = qs.question_id
                                                WHERE qs.section_id = sub_s.id)
                                        END
                                    )) -- sections SELECT END
                                        FROM sections sub_s
                                        WHERE sub_s.module_id = sub_m.id), '[]'::jsonb)
                            )
                        )
                FROM modules AS sub_m
                WHERE sub_u.id = sub_m.unit_id),
                '[]'::jsonb) -- modules SELECT END
	)) -- units SELECT END
    FROM units AS sub_u
    WHERE sub_u.course_id = c.id),
    '[]'::jsonb) AS units
FROM courses c
LEFT JOIN units u ON u.course_id = c.id
LEFT JOIN modules m ON m.unit_id = u.id
WHERE c.id = 1;