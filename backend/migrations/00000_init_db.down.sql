-- Drop indexes
DROP INDEX IF EXISTS idx_sections_module_id;
DROP INDEX IF EXISTS idx_user_module_progress_user_id;
DROP INDEX IF EXISTS idx_modules_unit_id;
DROP INDEX IF EXISTS idx_courses_name;
DROP INDEX IF EXISTS idx_users_username;
DROP INDEX IF EXISTS idx_users_email;

-- Drop tables
DROP TABLE IF EXISTS sections CASCADE;
DROP TABLE IF EXISTS user_courses CASCADE;
DROP TABLE IF EXISTS user_question_answers CASCADE;
DROP TABLE IF EXISTS user_module_progress CASCADE;
DROP TABLE IF EXISTS notifications CASCADE;
DROP TABLE IF EXISTS module_question_answers CASCADE;
DROP TABLE IF EXISTS module_questions CASCADE;
DROP TABLE IF EXISTS user_achievements CASCADE;
DROP TABLE IF EXISTS achievements CASCADE;
DROP TABLE IF EXISTS streaks CASCADE;
DROP TABLE IF EXISTS modules CASCADE;
DROP TABLE IF EXISTS units CASCADE;
DROP TABLE IF EXISTS courses CASCADE;
DROP TABLE IF EXISTS users CASCADE;

-- Drop ENUM type
DROP TYPE IF EXISTS module_progress_status;
