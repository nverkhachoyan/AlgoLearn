-- CREATE OR REPLACE FUNCTION save_module_progress(
--     p_user_id INTEGER,
--     p_module_id INTEGER,
--     p_sections JSONB,
--     p_questions JSONB
-- ) RETURNS void AS $$
-- DECLARE
--     v_progress_id INTEGER;
--     v_section JSONB;
--     v_question JSONB;
--     v_current_progress FLOAT;
-- BEGIN
--     -- Validate inputs
--     IF p_sections IS NULL OR jsonb_array_length(p_sections) = 0 THEN
--         RAISE EXCEPTION 'Sections array cannot be empty';
--     END IF;

--     -- get or create user_module_progress
--     INSERT INTO user_module_progress (user_id, module_id, status)
--     VALUES (p_user_id, p_module_id, 'in_progress')
--     ON CONFLICT (user_id, module_id)
--     DO UPDATE SET last_accessed = NOW()
--     RETURNING id INTO v_progress_id;

--     -- update section progress
--     INSERT INTO user_section_progress (
--         user_id,
--         module_id,
--         section_id,
--         has_seen,
--         seen_at
--     )
--     SELECT 
--         p_user_id,
--         p_module_id,
--         (section->>'sectionId')::INTEGER,
--         (section->>'hasSeen')::BOOLEAN,
--         (section->>'seenAt')::TIMESTAMPTZ
--     FROM jsonb_array_elements(p_sections) AS section
--     ON CONFLICT (user_id, section_id)
--     DO UPDATE SET
--         has_seen = EXCLUDED.has_seen,
--         seen_at = EXCLUDED.seen_at;


--       -- Only process questions if there are any
--     IF p_questions IS NOT NULL AND jsonb_array_length(p_questions) > 0 THEN
--         -- Validate that the questions belong to question sections
--         IF EXISTS (
--             SELECT 1
--             FROM jsonb_array_elements(p_questions) AS q
--             WHERE NOT EXISTS (
--                 SELECT 1
--                 FROM sections s
--                 JOIN question_sections qs ON s.id = qs.section_id
--                 WHERE s.module_id = p_module_id
--                 AND qs.question_id = (q->>'questionId')::INTEGER
--             )
--         ) THEN
--             RAISE EXCEPTION 'Invalid question ID provided';
--         END IF;

--         -- Update question answers
--         INSERT INTO user_question_answers (
--             user_module_progress_id,
--             question_id,
--             option_id,
--             is_correct,
--             answered_at
--         )
--         SELECT
--             v_progress_id,
--             (question->>'questionId')::INTEGER,
--             (question->>'optionId')::INTEGER,
--             (question->>'isCorrect')::BOOLEAN,
--             COALESCE(
--                 (question->>'answeredAt')::TIMESTAMPTZ,
--                 NOW()
--             )

--         FROM jsonb_array_elements(p_questions) AS question
--         -- Only insert answers for valid question sections
--         WHERE EXISTS (
--             SELECT 1
--             FROM sections s
--             JOIN question_sections qs ON s.id = qs.section_id
--             WHERE s.module_id = p_module_id
--             AND qs.question_id = (question->>'questionId')::INTEGER
--         )
--          ON CONFLICT (user_module_progress_id, question_id) 
--         DO UPDATE SET
--             option_id = EXCLUDED.option_id,
--             is_correct = EXCLUDED.is_correct,
--             answered_at = EXCLUDED.answered_at,
--             updated_at = NOW();
--     END IF;

--     -- calculate new progress
--     SELECT 
--         CASE 
--             WHEN COUNT(*) = 0 THEN 0
--             ELSE (
--                 COUNT(CASE 
--                     WHEN s.type = 'question' THEN
--                         CASE WHEN uqa.is_correct THEN 1 END
--                     ELSE
--                         CASE WHEN usp.has_seen THEN 1 END
--                 END)::FLOAT / COUNT(*)::FLOAT
--             ) * 100
--         END
--     INTO v_current_progress
--     FROM sections s
--     LEFT JOIN user_section_progress usp 
--         ON usp.section_id = s.id 
--         AND usp.user_id = p_user_id
--     LEFT JOIN question_sections qs 
--         ON s.id = qs.section_id
--     LEFT JOIN user_question_answers uqa 
--         ON qs.question_id = uqa.question_id 
--         AND uqa.user_module_progress_id = v_progress_id
--     WHERE s.module_id = p_module_id;

--     -- update module progress
--     UPDATE user_module_progress
--     SET 
--         progress = v_current_progress,
--         status = CASE 
--             WHEN v_current_progress >= 100 THEN 'completed'::module_progress_status
--             ELSE 'in_progress'::module_progress_status
--         END,
--         completed_at = CASE 
--             WHEN v_current_progress >= 100 THEN NOW()
--             ELSE NULL
--         END
--     WHERE id = v_progress_id;


-- END
-- $$ LANGUAGE plpgsql;

-- SELECT save_module_progress(
--     4, -- user_id
--     1, -- module_id
--     -- sections array
--     '[
--         {
--             "sectionId": 1,
--             "hasSeen": true,
--             "seenAt": "2024-11-23T10:00:00Z"
--         },
--         {
--             "sectionId": 2,
--             "hasSeen": true,
--             "seenAt": "2024-11-23T10:01:00Z"
--         },
--         {
--             "sectionId": 3,
--             "hasSeen": true,
--             "seenAt": "2024-11-23T10:02:00Z"
--         }
--     ]'::jsonb,
--     -- questions array
--     '[
--         {
--             "questionId": 1,
--             "optionId": 2,
--             "isCorrect": false,
--             "answeredAt": "2024-11-23T10:03:00Z"
--         }
--     ]'::jsonb
-- );



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
BEGIN
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


END
$$ LANGUAGE plpgsql;