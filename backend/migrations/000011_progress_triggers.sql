-- +goose Up
-- +goose StatementBegin
-- Automatically updates module progress when sections are completed
CREATE OR REPLACE FUNCTION update_module_progress()
RETURNS TRIGGER AS $$
DECLARE
    v_course_id INT;
BEGIN
    -- Get the course_id for this module
    SELECT c.id INTO v_course_id
    FROM modules m
    JOIN units u ON u.id = m.unit_id
    JOIN courses c ON c.id = u.course_id
    WHERE m.id = NEW.module_id;
    -- Recalculate module progress based on completed sections
    WITH module_stats AS (
        SELECT 
            ump.id,
            COUNT(s.id) as total_sections,
            COUNT(CASE WHEN usp.completed_at IS NOT NULL THEN 1 END) as completed_sections
        FROM user_module_progress ump
        JOIN modules m ON m.id = ump.module_id
        JOIN sections s ON s.module_id = m.id
        LEFT JOIN user_section_progress usp ON usp.section_id = s.id 
            AND usp.user_id = ump.user_id
            AND usp.module_id = m.id
        WHERE ump.user_id = NEW.user_id 
          AND ump.module_id = NEW.module_id
        GROUP BY ump.id
    )
    UPDATE user_module_progress
    SET 
        progress = CASE 
            WHEN ms.total_sections > 0 
            THEN (ms.completed_sections::float / ms.total_sections::float) * 100
            ELSE 0
        END,
        status = CASE 
            WHEN ms.completed_sections = ms.total_sections THEN 'completed'::module_progress_status
            WHEN ms.completed_sections > 0 THEN 'in_progress'::module_progress_status
            ELSE 'uninitiated'::module_progress_status
        END,
        completed_at = CASE 
            WHEN ms.completed_sections = ms.total_sections THEN NOW()
            ELSE NULL
        END
    FROM module_stats ms
    WHERE user_module_progress.id = ms.id;
    -- Update course progress
    WITH course_stats AS (
        SELECT 
            COUNT(m.id) as total_modules,
            COUNT(CASE WHEN ump.status = 'completed' THEN 1 END) as completed_modules
        FROM courses c
        JOIN units u ON u.course_id = c.id
        JOIN modules m ON m.unit_id = u.id
        LEFT JOIN user_module_progress ump ON ump.module_id = m.id 
            AND ump.user_id = NEW.user_id
        WHERE c.id = v_course_id
    )
    INSERT INTO user_courses (user_id, course_id, progress)
    VALUES (
        NEW.user_id, 
        v_course_id,
        (SELECT 
            CASE 
                WHEN cs.total_modules > 0 
                THEN (cs.completed_modules::float / cs.total_modules::float) * 100
                ELSE 0
            END
        FROM course_stats cs)
    )
    ON CONFLICT (user_id, course_id) 
    DO UPDATE SET 
        progress = (
            SELECT 
                CASE 
                    WHEN cs.total_modules > 0 
                    THEN (cs.completed_modules::float / cs.total_modules::float) * 100
                    ELSE 0
                END
            FROM course_stats cs
        ),
        updated_at = NOW();
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql
;

CREATE TRIGGER after_section_progress_update
    AFTER INSERT OR UPDATE ON user_section_progress
    FOR EACH ROW
    EXECUTE FUNCTION update_module_progress();
-- +goose StatementEnd

-- +goose Down
-- +goose StatementBegin
DROP TRIGGER IF EXISTS after_section_progress_update ON user_section_progress;

DROP FUNCTION IF EXISTS update_module_progress ();
-- +goose StatementEnd