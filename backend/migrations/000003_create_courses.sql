-- +goose Up
-- +goose StatementBegin
CREATE TABLE courses (
    id SERIAL PRIMARY KEY,
    folder_object_key UUID UNIQUE, -- S3 folder object key
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    draft BOOLEAN NOT NULL DEFAULT TRUE,
    name VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    img_key UUID UNIQUE, -- S3 object key
    media_ext VARCHAR(10), -- S3 object extension
    requirements TEXT,
    what_you_learn TEXT,
    background_color VARCHAR(7),
    duration INTEGER,
    difficulty_level difficulty_level,
    rating FLOAT
);

CREATE TABLE course_authors (
    course_id INTEGER NOT NULL,
    user_id INTEGER NOT NULL,
    PRIMARY KEY (course_id, user_id),
    FOREIGN KEY (course_id) REFERENCES courses (id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE
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

CREATE INDEX idx_course_authors_user_id ON course_authors (user_id);

CREATE INDEX idx_course_tags_course_id ON course_tags (course_id);

CREATE INDEX idx_course_tags_tag_id ON course_tags (tag_id);
-- +goose StatementEnd

-- +goose Down
-- +goose StatementBegin
DROP TABLE IF EXISTS course_tags;

DROP TABLE IF EXISTS course_authors;

DROP TABLE IF EXISTS tags;

DROP TABLE IF EXISTS courses;
-- +goose StatementEnd
