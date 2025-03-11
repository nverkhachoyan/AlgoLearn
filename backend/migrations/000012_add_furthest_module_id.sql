-- +goose Up
-- Add furthest_module_id to track the furthest module a user has reached in a course
ALTER TABLE user_courses ADD COLUMN furthest_module_id INTEGER REFERENCES modules(id);

-- +goose Down
-- Drop the column
ALTER TABLE user_courses DROP COLUMN IF EXISTS furthest_module_id;
