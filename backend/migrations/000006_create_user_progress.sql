-- +goose Up
-- +goose StatementBegin
CREATE TABLE user_module_progress (
    id SERIAL PRIMARY KEY,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    user_id INTEGER NOT NULL,
    module_id INTEGER NOT NULL,
    started_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    completed_at TIMESTAMPTZ,
    progress FLOAT NOT NULL DEFAULT 0.0,
    current_section_id INTEGER,
    last_accessed TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    status module_progress_status NOT NULL DEFAULT 'in_progress',
    FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE,
    FOREIGN KEY (module_id) REFERENCES modules (id) ON DELETE CASCADE,
    FOREIGN KEY (current_section_id) REFERENCES sections (id) ON DELETE SET NULL,
    CONSTRAINT check_progress_range CHECK (
        progress >= 0.0
        AND progress <= 100.0
    )
);

CREATE TABLE user_courses (
    id SERIAL PRIMARY KEY,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    user_id INTEGER NOT NULL,
    course_id INTEGER NOT NULL,
    current_unit_id INTEGER,
    current_module_id INTEGER,
    latest_module_progress_id INTEGER,
    progress FLOAT NOT NULL DEFAULT 0.0,
    FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE,
    FOREIGN KEY (course_id) REFERENCES courses (id) ON DELETE CASCADE,
    FOREIGN KEY (current_unit_id) REFERENCES units (id) ON DELETE SET NULL,
    FOREIGN KEY (current_module_id) REFERENCES modules (id) ON DELETE SET NULL,
    FOREIGN KEY (latest_module_progress_id) REFERENCES user_module_progress (id) ON DELETE SET NULL
);

CREATE TABLE user_section_progress (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL,
    module_id INTEGER NOT NULL,
    section_id INTEGER NOT NULL,
    started_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    completed_at TIMESTAMPTZ,
    has_seen BOOLEAN NOT NULL DEFAULT FALSE,
    seen_at TIMESTAMPTZ,
    progress FLOAT NOT NULL DEFAULT 0.0,
    FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE,
    FOREIGN KEY (module_id) REFERENCES modules (id) ON DELETE CASCADE,
    FOREIGN KEY (section_id) REFERENCES sections (id) ON DELETE CASCADE
);

CREATE TABLE user_question_answers (
    id SERIAL PRIMARY KEY,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    user_module_progress_id INTEGER NOT NULL,
    question_id INTEGER NOT NULL,
    option_id INTEGER NOT NULL,
    answered_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    is_correct BOOLEAN NOT NULL DEFAULT FALSE,
    progress FLOAT NOT NULL DEFAULT 0.0,
    FOREIGN KEY (user_module_progress_id) REFERENCES user_module_progress (id) ON DELETE CASCADE,
    FOREIGN KEY (question_id) REFERENCES questions (id) ON DELETE CASCADE,
    FOREIGN KEY (option_id) REFERENCES question_options (id) ON DELETE CASCADE
);

CREATE INDEX idx_user_module_progress_user_id ON user_module_progress (user_id);

CREATE INDEX idx_user_courses_user_id ON user_courses (user_id);

CREATE INDEX idx_user_courses_course_id ON user_courses (course_id);

CREATE INDEX idx_user_section_progress_section_id ON user_section_progress (section_id);

CREATE INDEX idx_user_question_answers_user_module_progress_id ON user_question_answers (user_module_progress_id);

CREATE INDEX idx_user_question_answers_question_id ON user_question_answers (question_id);

ALTER TABLE user_module_progress
ADD CONSTRAINT unique_user_module_progress UNIQUE (user_id, module_id);

ALTER TABLE user_courses
ADD CONSTRAINT uniq_user_course UNIQUE (user_id, course_id);

ALTER TABLE user_section_progress
ADD CONSTRAINT unique_user_section_progress UNIQUE (user_id, section_id);

ALTER TABLE user_question_answers
ADD CONSTRAINT unique_user_question_answer UNIQUE (
    user_module_progress_id,
    question_id
);
-- +goose StatementEnd

-- +goose Down
-- +goose StatementBegin
DROP TABLE IF EXISTS user_question_answers;

DROP TABLE IF EXISTS user_section_progress;

DROP TABLE IF EXISTS user_courses;

DROP TABLE IF EXISTS user_module_progress;
-- +goose StatementEnd