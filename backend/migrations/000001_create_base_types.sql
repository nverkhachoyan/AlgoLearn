-- +goose Up
-- +goose StatementBegin
CREATE TYPE user_role AS ENUM( 'admin', 'instructor', 'student' );

CREATE TYPE difficulty_level AS ENUM(
    'beginner',
    'intermediate',
    'advanced',
    'expert'
);

CREATE TYPE module_progress_status AS ENUM(
    'uninitiated',
    'in_progress',
    'completed',
    'abandoned'
);
-- +goose StatementEnd

-- +goose Down
-- +goose StatementBegin
DROP TYPE IF EXISTS module_progress_status;

DROP TYPE IF EXISTS difficulty_level;

DROP TYPE IF EXISTS user_role;
-- +goose StatementEnd