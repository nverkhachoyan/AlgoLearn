-- +goose Up
-- +goose StatementBegin
CREATE TYPE section_type AS ENUM ('markdown', 'code', 'question', 'video', 'lottie', 'image');

CREATE TABLE questions (
    id SERIAL PRIMARY KEY,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW (),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW (),
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
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW (),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW (),
    module_id INTEGER NOT NULL,
    type section_type NOT NULL,
    position INTEGER NOT NULL DEFAULT 0,
    FOREIGN KEY (module_id) REFERENCES modules (id) ON DELETE CASCADE
);

CREATE TABLE video_sections (
    section_id INTEGER PRIMARY KEY,
    object_key UUID,
    media_ext VARCHAR(10), 
    url TEXT NOT NULL,
    FOREIGN KEY (section_id) REFERENCES sections (id) ON DELETE CASCADE
);

CREATE TABLE question_sections (
    section_id INTEGER PRIMARY KEY,
    question_id INTEGER NOT NULL,
    object_key UUID,
    media_ext VARCHAR(10),
    FOREIGN KEY (section_id) REFERENCES sections (id) ON DELETE CASCADE,
    FOREIGN KEY (question_id) REFERENCES questions (id) ON DELETE CASCADE
);

CREATE TABLE markdown_sections (
    section_id INTEGER PRIMARY KEY,
    object_key UUID,
    media_ext VARCHAR(10),
    markdown TEXT NOT NULL,
    FOREIGN KEY (section_id) REFERENCES sections (id) ON DELETE CASCADE
);

CREATE TABLE code_sections (
    section_id INTEGER PRIMARY KEY,
    object_key UUID,
    media_ext VARCHAR(10),
    code TEXT NOT NULL,
    language VARCHAR(50),
    FOREIGN KEY (section_id) REFERENCES sections (id) ON DELETE CASCADE
);

CREATE TABLE lottie_sections (
    section_id INTEGER PRIMARY KEY,
    object_key UUID,
    media_ext VARCHAR(10),
    caption TEXT,
    description TEXT,
    width INTEGER,
    height INTEGER,
    alt_text TEXT,
    fallback_url TEXT,
    autoplay BOOLEAN NOT NULL DEFAULT false,
    loop BOOLEAN NOT NULL DEFAULT true,
    speed FLOAT NOT NULL DEFAULT 1.0,
    FOREIGN KEY (section_id) REFERENCES sections (id) ON DELETE CASCADE
);

CREATE TABLE image_sections (
    section_id INTEGER PRIMARY KEY,
    object_key UUID,
    width INTEGER DEFAULT 200,
    height INTEGER DEFAULT 200,
    media_ext VARCHAR(10),
    url TEXT,
    headline TEXT,
    caption TEXT,
    alt_text TEXT,
    FOREIGN KEY (section_id) REFERENCES sections (id) ON DELETE CASCADE
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

ALTER TABLE sections ADD CONSTRAINT unique_section_position_per_module UNIQUE (module_id, position);

ALTER TABLE question_sections ADD CONSTRAINT unique_question_section UNIQUE (question_id);

-- +goose StatementEnd
-- +goose Down
-- +goose StatementBegin
DROP TABLE IF EXISTS module_questions;

DROP TABLE IF EXISTS question_sections;

DROP TABLE IF EXISTS video_sections;

DROP TABLE IF EXISTS code_sections;

DROP TABLE IF EXISTS sections;

DROP TABLE IF EXISTS question_options;

DROP TABLE IF EXISTS question_tags;

DROP TABLE IF EXISTS questions;

DROP TYPE IF EXISTS section_type;

DROP TYPE IF EXISTS lottie_sections;

-- +goose StatementEnd
