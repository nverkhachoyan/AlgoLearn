-- +goose Up
-- +goose StatementBegin
CREATE TABLE courses (
    id SERIAL PRIMARY KEY,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    name VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    requirements TEXT,
    what_you_learn TEXT,
    background_color VARCHAR(7),
    icon_url TEXT,
    duration INTEGER,
    difficulty_level difficulty_level,
    rating FLOAT
);

CREATE TABLE authors (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL
);

CREATE TABLE course_authors (
    course_id INTEGER NOT NULL,
    author_id INTEGER NOT NULL,
    PRIMARY KEY (course_id, author_id),
    FOREIGN KEY (course_id) REFERENCES courses (id) ON DELETE CASCADE,
    FOREIGN KEY (author_id) REFERENCES authors (id) ON DELETE CASCADE
);

CREATE TABLE tags (
    id SERIAL PRIMARY KEY,
    name VARCHAR(50) NOT NULL UNIQUE
);

CREATE TABLE course_tags (
    course_id INTEGER NOT NULL,
    tag_id INTEGER NOT NULL,
    PRIMARY KEY (course_id, tag_id),
    FOREIGN KEY (course_id) REFERENCES courses (id) ON DELETE CASCADE,
    FOREIGN KEY (tag_id) REFERENCES tags (id) ON DELETE CASCADE
);

CREATE INDEX idx_courses_name ON courses (name);

CREATE INDEX idx_course_authors_course_id ON course_authors (course_id);

CREATE INDEX idx_course_authors_author_id ON course_authors (author_id);

CREATE INDEX idx_course_tags_course_id ON course_tags (course_id);

CREATE INDEX idx_course_tags_tag_id ON course_tags (tag_id);
-- +goose StatementEnd

-- +goose Down
-- +goose StatementBegin
DROP TABLE IF EXISTS course_tags;

DROP TABLE IF EXISTS course_authors;

DROP TABLE IF EXISTS tags;

DROP TABLE IF EXISTS authors;

DROP TABLE IF EXISTS courses;
-- +goose StatementEnd