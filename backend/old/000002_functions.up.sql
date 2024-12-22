-- name: save_module_progress
CREATE OR REPLACE FUNCTION save_module_progress(
    p_user_id INTEGER,
    p_module_id INTEGER,
    p_sections JSONB,
    p_questions JSONB
) RETURNS void AS $$
DECLARE
    v_progress_id INTEGER;
    v_section JSONB;
    v_question JSONB;
    v_current_progress FLOAT;
    v_course_id INTEGER;
    v_unit_id INTEGER;
    v_course_progress FLOAT;
BEGIN
    -- Get course_id and unit_id
    SELECT u.course_id, m.unit_id
    INTO v_course_id, v_unit_id
    FROM modules m
    JOIN units u ON m.unit_id = u.id
    WHERE m.id = p_module_id;

    -- Validate inputs
    IF p_sections IS NULL OR jsonb_array_length(p_sections) = 0 THEN
        RAISE EXCEPTION 'Sections array cannot be empty';
    END IF;

    -- get or create user_module_progress
    INSERT INTO user_module_progress (user_id, module_id, status)
    VALUES (p_user_id, p_module_id, 'in_progress')
    ON CONFLICT (user_id, module_id)
    DO UPDATE SET last_accessed = NOW()
    RETURNING id INTO v_progress_id;

    -- update section progress
    INSERT INTO user_section_progress (
        user_id,
        module_id,
        section_id,
        has_seen,
        seen_at
    )
    SELECT
        p_user_id,
        p_module_id,
        (section->>'sectionId')::INTEGER,
        (section->>'hasSeen')::BOOLEAN,
        (section->>'seenAt')::TIMESTAMPTZ
    FROM jsonb_array_elements(p_sections) AS section
    ON CONFLICT (user_id, section_id)
    DO UPDATE SET
        has_seen = EXCLUDED.has_seen,
        seen_at = EXCLUDED.seen_at;


      -- Only process questions if there are any
    IF p_questions IS NOT NULL AND jsonb_array_length(p_questions) > 0 THEN
        -- Validate that the questions belong to question sections
        IF EXISTS (
            SELECT 1
            FROM jsonb_array_elements(p_questions) AS q
            WHERE NOT EXISTS (
                SELECT 1
                FROM sections s
                JOIN question_sections qs ON s.id = qs.section_id
                WHERE s.module_id = p_module_id
                AND qs.question_id = (q->>'questionId')::INTEGER
            )
        ) THEN
            RAISE EXCEPTION 'Invalid question ID provided';
        END IF;

        -- Update question answers
        INSERT INTO user_question_answers (
            user_module_progress_id,
            question_id,
            option_id,
            is_correct,
            answered_at
        )
        SELECT
            v_progress_id,
            (question->>'questionId')::INTEGER,
            (question->>'optionId')::INTEGER,
            (question->>'isCorrect')::BOOLEAN,
            COALESCE(
                (question->>'answeredAt')::TIMESTAMPTZ,
                NOW()
            )

        FROM jsonb_array_elements(p_questions) AS question
        -- Only insert answers for valid question sections
        WHERE EXISTS (
            SELECT 1
            FROM sections s
            JOIN question_sections qs ON s.id = qs.section_id
            WHERE s.module_id = p_module_id
            AND qs.question_id = (question->>'questionId')::INTEGER
        )
         ON CONFLICT (user_module_progress_id, question_id)
        DO UPDATE SET
            option_id = EXCLUDED.option_id,
            is_correct = EXCLUDED.is_correct,
            answered_at = EXCLUDED.answered_at,
            updated_at = NOW();
    END IF;

    -- calculate new progress
    SELECT
        CASE
            WHEN COUNT(*) = 0 THEN 0
            ELSE (
                COUNT(CASE
                    WHEN s.type = 'question' THEN
                        CASE WHEN uqa.is_correct THEN 1 END
                    ELSE
                        CASE WHEN usp.has_seen THEN 1 END
                END)::FLOAT / COUNT(*)::FLOAT
            ) * 100
        END
    INTO v_current_progress
    FROM sections s
    LEFT JOIN user_section_progress usp
        ON usp.section_id = s.id
        AND usp.user_id = p_user_id
    LEFT JOIN question_sections qs
        ON s.id = qs.section_id
    LEFT JOIN user_question_answers uqa
        ON qs.question_id = uqa.question_id
        AND uqa.user_module_progress_id = v_progress_id
    WHERE s.module_id = p_module_id;

    -- update module progress
    UPDATE user_module_progress
    SET
        progress = v_current_progress,
        status = CASE
            WHEN v_current_progress >= 100 THEN 'completed'::module_progress_status
            ELSE 'in_progress'::module_progress_status
        END,
        completed_at = CASE
            WHEN v_current_progress >= 100 THEN NOW()
            ELSE NULL
        END
    WHERE id = v_progress_id;

    -- If module is completed, update course progress
       IF v_current_progress >= 100 THEN
           -- Calculate overall course progress
           SELECT
               CASE
                   WHEN COUNT(*) = 0 THEN 0
                   ELSE (
                       COUNT(CASE WHEN ump.status = 'completed' THEN 1 END)::FLOAT /
                       COUNT(*)::FLOAT
                   ) * 100
               END
           INTO v_course_progress
           FROM modules m
           JOIN units u ON m.unit_id = u.id
           LEFT JOIN user_module_progress ump
               ON ump.module_id = m.id
               AND ump.user_id = p_user_id
           WHERE u.course_id = v_course_id;

           -- Update user_courses table
           INSERT INTO user_courses (
               user_id,
               course_id,
               current_unit_id,
               current_module_id,
               latest_module_progress_id,
               progress
           )
           VALUES (
               p_user_id,
               v_course_id,
               v_unit_id,
               p_module_id,
               v_progress_id,
               v_course_progress
           )
           ON CONFLICT (user_id, course_id)
           DO UPDATE SET
               current_unit_id = EXCLUDED.current_unit_id,
               current_module_id = EXCLUDED.current_module_id,
               latest_module_progress_id = EXCLUDED.latest_module_progress_id,
               progress = EXCLUDED.progress,
               updated_at = NOW();

           -- -- If course is completed (100%), trigger any necessary achievements or notifications
           -- IF v_course_progress >= 100 THEN
           --     -- Insert course completion achievement
           --     INSERT INTO user_achievements (user_id, achievement_id)
           --     SELECT p_user_id, id
           --     FROM achievements
           --     WHERE name = 'Course Completion'
           --     ON CONFLICT (user_id, achievement_id) DO NOTHING;

           --     -- Add completion notification
           --     INSERT INTO notifications (user_id, content)
           --     VALUES (p_user_id, 'Congratulations! You have completed the course.');
           -- END IF;
       END IF;


END
$$ LANGUAGE plpgsql;

-- name: create_module
CREATE OR REPLACE FUNCTION create_module(
    author_id INTEGER,
    m_unit_id INTEGER,
    m_name TEXT,
    m_description TEXT,
    m_sections JSONB,
    m_questions JSONB
) RETURNS void AS $$
DECLARE
    last_module_id INTEGER;
    new_module_id INTEGER;
    section_id INTEGER;
BEGIN
    -- Validate inputs
    IF m_unit_id IS NULL THEN
        RAISE EXCEPTION 'Unit ID cannot be null';
    END IF;

    IF m_name IS NULL OR m_name = '' THEN
        RAISE EXCEPTION 'Module name cannot be empty';
    END IF;

    IF m_description IS NULL OR m_description = '' THEN
        RAISE EXCEPTION 'Module description cannot be empty';
    END IF;

    -- Create new module
    INSERT INTO modules (
        created_at,
        updated_at,
        module_number,
        unit_id,
        name,
        description
    )
    SELECT
        NOW(),
        NOW(),
        COALESCE((
            SELECT (module_number + 1)
            FROM modules
            WHERE unit_id = m_unit_id
            ORDER BY module_number DESC
            LIMIT 1
        ), 1),
        m_unit_id,
        m_name,
        m_description
    RETURNING id INTO new_module_id;

    -- Process sections if provided
    IF m_sections IS NOT NULL AND jsonb_array_length(m_sections) > 0 THEN
        -- For each section in the array
        FOR i IN 0..jsonb_array_length(m_sections)-1 LOOP
            -- Insert base section
            INSERT INTO sections (
                created_at,
                updated_at,
                module_id,
                type,
                position
            )
            VALUES (
                NOW(),
                NOW(),
                new_module_id,
                m_sections->i->>'type',
                (m_sections->i->>'position')::INTEGER
            )
            RETURNING id INTO section_id;

            -- Handle section type specific data
            CASE m_sections->i->>'type'
                WHEN 'text' THEN
                    INSERT INTO text_sections (section_id, text_content)
                    VALUES (section_id, m_sections->i->>'content');

                WHEN 'video' THEN
                    INSERT INTO video_sections (section_id, url)
                    VALUES (section_id, m_sections->i->>'content');

                WHEN 'question' THEN
                    -- Insert question
                    WITH question_insert AS (
                        INSERT INTO questions (
                            type,
                            question,
                            difficulty_level
                        )
                        VALUES (
                            (m_sections->i->'content'->>'type')::VARCHAR,
                            m_sections->i->'content'->>'question',
                            (m_sections->i->'content'->>'difficulty_level')::difficulty_level
                        )
                        RETURNING id
                    )
                    -- Insert options and link question to section
                    INSERT INTO question_sections (section_id, question_id)
                    SELECT section_id, id FROM question_insert;

                    -- Insert options
                    WITH RECURSIVE question_id AS (
                        SELECT id FROM questions WHERE id = currval('questions_id_seq')
                    )
                    INSERT INTO question_options (question_id, content, is_correct)
                    SELECT
                        (SELECT id FROM question_id),
                        opt->>'content',
                        (opt->>'is_correct')::boolean
                    FROM jsonb_array_elements(m_sections->i->'content'->'options') AS opt;

                    -- Handle tags
                    WITH question_id AS (
                        SELECT id FROM questions WHERE id = currval('questions_id_seq')
                    )
                    INSERT INTO tags (name)
                    SELECT DISTINCT tag_name
                    FROM jsonb_array_elements_text(m_sections->i->'content'->'tags') AS tag_name
                    WHERE NOT EXISTS (
                        SELECT 1 FROM tags t WHERE t.name = tag_name
                    );

                    WITH question_id AS (
                        SELECT id FROM questions WHERE id = currval('questions_id_seq')
                    )
                    INSERT INTO question_tags (question_id, tag_id)
                    SELECT
                        (SELECT id FROM question_id),
                        t.id
                    FROM jsonb_array_elements_text(m_sections->i->'content'->'tags') AS tag_name
                    JOIN tags t ON t.name = tag_name;
            END CASE;
        END LOOP;
    END IF;

    -- Process standalone questions if provided
    IF m_questions IS NOT NULL AND jsonb_array_length(m_questions) > 0 THEN
        FOR i IN 0..jsonb_array_length(m_questions)-1 LOOP
            WITH question_insert AS (
                INSERT INTO questions (
                    type,
                    question,
                    difficulty_level
                )
                VALUES (
                    m_questions->i->>'type',
                    m_questions->i->>'question',
                    (m_questions->i->>'difficulty_level')::difficulty_level
                )
                RETURNING id
            ),
            options_insert AS (
                INSERT INTO question_options (
                    question_id,
                    content,
                    is_correct
                )
                SELECT
                    q.id,
                    opt->>'content',
                    (opt->>'is_correct')::boolean
                FROM question_insert q
                CROSS JOIN jsonb_array_elements(m_questions->i->'options') AS opt
            ),
            module_questions_insert AS (
                INSERT INTO module_questions (
                    module_id,
                    question_id,
                    position
                )
                SELECT
                    new_module_id,
                    q.id,
                    i + 1
                FROM question_insert q
            )
            INSERT INTO question_tags (question_id, tag_id)
            SELECT q.id, t.id
            FROM question_insert q
            CROSS JOIN jsonb_array_elements_text(m_questions->i->'tags') AS tag_name
            JOIN tags t ON t.name = tag_name;
        END LOOP;
    END IF;
END
$$ LANGUAGE plpgsql;

-- SELECT create_module (
--         4, 1, 'DMZ', 'BEACH HELLO WHAT IS UP', '[{"type": "text", "content": "Hello", "position": 1}, {"type": "video", "content": "https://www.youtube.com/watch?v=dQw4w9WgXcQ", "position": 2}]'::JSONB, '[{"type": "question", "question": "What is the capital of France?", "options": [{"content": "Paris", "is_correct": true}, {"content": "London", "is_correct": false}, {"content": "Berlin", "is_correct": false}, {"content": "Madrid", "is_correct": false}], "tags": ["Geography"], "difficulty_level": "beginner"}]'::JSONB
--     );
