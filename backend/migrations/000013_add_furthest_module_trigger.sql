-- +goose Up
-- +goose StatementBegin
CREATE FUNCTION update_furthest_module_id() RETURNS TRIGGER 
AS $$
BEGIN
    IF TG_OP = 'INSERT' OR (TG_OP = 'UPDATE' AND NEW.progress > 0) THEN
        WITH module_course AS (
            SELECT u.course_id 
            FROM modules m
            JOIN units u ON m.unit_id = u.id
            WHERE m.id = NEW.module_id
        )
        UPDATE user_courses uc
        SET furthest_module_id = CASE
            WHEN uc.furthest_module_id IS NULL 
              OR EXISTS (
                SELECT 1 
                FROM modules m1
                JOIN units u1 ON m1.unit_id = u1.id
                JOIN modules m2 ON m2.id = NEW.module_id
                JOIN units u2 ON m2.unit_id = u2.id
                WHERE m1.id = uc.furthest_module_id
                  AND (u2.unit_number > u1.unit_number 
                       OR (u2.unit_number = u1.unit_number AND m2.module_number > m1.module_number))
              )
            THEN NEW.module_id
            ELSE uc.furthest_module_id
        END
        FROM module_course mc
        WHERE uc.user_id = NEW.user_id
          AND uc.course_id = mc.course_id;
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_furthest_module
AFTER INSERT OR UPDATE OF progress ON user_module_progress
FOR EACH ROW
EXECUTE FUNCTION update_furthest_module_id();
-- +goose StatementEnd

-- +goose Down
DROP TRIGGER IF EXISTS update_furthest_module ON user_module_progress;
DROP FUNCTION IF EXISTS update_furthest_module_id(); 