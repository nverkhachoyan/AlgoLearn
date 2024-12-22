-- +goose Up
-- +goose StatementBegin
CREATE TABLE questions (
    id SERIAL PRIMARY KEY,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    type VARCHAR(50) NOT NULL,
    question TEXT NOT NULL,
    difficulty_level difficulty_level
);

CREATE TABLE question_tags (
    question_id INTEGER NOT NULL,
    tag_id INTEGER NOT NULL,
    PRIMARY KEY (question_id, tag_id),
    FOREIGN KEY (question_id) REFERENCES questions (id) ON DELETE CASCADE,
    FOREIGN KEY (tag_id) REFERENCES tags (id) ON DELETE CASCADE
);

CREATE TABLE question_options (
    id SERIAL PRIMARY KEY,
    question_id INTEGER NOT NULL,
    content TEXT NOT NULL,
    is_correct BOOLEAN NOT NULL,
    FOREIGN KEY (question_id) REFERENCES questions (id) ON DELETE CASCADE
);

CREATE TABLE sections (
    id SERIAL PRIMARY KEY,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    module_id INTEGER NOT NULL,
    type VARCHAR(50) NOT NULL,
    position INTEGER NOT NULL DEFAULT 0,
    FOREIGN KEY (module_id) REFERENCES modules (id) ON DELETE CASCADE
);

CREATE TABLE text_sections (
    section_id INTEGER PRIMARY KEY,
    text_content TEXT NOT NULL,
    FOREIGN KEY (section_id) REFERENCES sections (id) ON DELETE CASCADE
);

CREATE TABLE video_sections (
    section_id INTEGER PRIMARY KEY,
    url TEXT NOT NULL,
    FOREIGN KEY (section_id) REFERENCES sections (id) ON DELETE CASCADE
);

CREATE TABLE question_sections (
    section_id INTEGER PRIMARY KEY,
    question_id INTEGER NOT NULL,
    FOREIGN KEY (section_id) REFERENCES sections (id) ON DELETE CASCADE,
    FOREIGN KEY (question_id) REFERENCES questions (id) ON DELETE CASCADE
);

CREATE TABLE module_questions (
    id SERIAL PRIMARY KEY,
    module_id INTEGER NOT NULL,
    question_id INTEGER NOT NULL,
    position INTEGER NOT NULL,
    FOREIGN KEY (module_id) REFERENCES modules (id) ON DELETE CASCADE,
    FOREIGN KEY (question_id) REFERENCES questions (id) ON DELETE CASCADE
);

CREATE INDEX idx_question_tags_question_id ON question_tags (question_id);

CREATE INDEX idx_question_tags_tag_id ON question_tags (tag_id);

CREATE INDEX idx_sections_module_id ON sections (module_id);

ALTER TABLE sections
ADD CONSTRAINT unique_section_position_per_module UNIQUE (module_id, position);

ALTER TABLE question_sections
ADD CONSTRAINT unique_question_section UNIQUE (question_id);
-- +goose StatementEnd

-- +goose Down
-- +goose StatementBegin
DROP TABLE IF EXISTS module_questions;

DROP TABLE IF EXISTS question_sections;

DROP TABLE IF EXISTS video_sections;

DROP TABLE IF EXISTS text_sections;

DROP TABLE IF EXISTS sections;

DROP TABLE IF EXISTS question_options;

DROP TABLE IF EXISTS question_tags;

DROP TABLE IF EXISTS questions;
-- +goose StatementEnd