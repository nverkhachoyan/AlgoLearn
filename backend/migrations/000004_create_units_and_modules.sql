-- +goose Up
-- +goose StatementBegin
CREATE TABLE units (
    id SERIAL PRIMARY KEY,
    folder_object_key UUID UNIQUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    img_key UUID UNIQUE,
    media_ext VARCHAR(10),
    draft BOOLEAN NOT NULL DEFAULT TRUE,
    unit_number INTEGER NOT NULL,
    course_id INTEGER NOT NULL,
    name VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    FOREIGN KEY (course_id) REFERENCES courses (id) ON DELETE CASCADE,
    CONSTRAINT unique_unit_number_per_course UNIQUE (course_id, unit_number),
    CONSTRAINT positive_unit_number CHECK (unit_number > 0)
);

CREATE TABLE modules (
    id SERIAL PRIMARY KEY,
    folder_object_key UUID UNIQUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    img_key UUID UNIQUE,
    media_ext VARCHAR(10),
    draft BOOLEAN NOT NULL DEFAULT TRUE,
    module_number INTEGER NOT NULL,
    unit_id INTEGER NOT NULL,
    name VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    FOREIGN KEY (unit_id) REFERENCES units (id) ON DELETE CASCADE,
    CONSTRAINT unique_module_number_per_unit UNIQUE (unit_id, module_number),
    CONSTRAINT positive_module_number CHECK (module_number > 0)
);

CREATE INDEX idx_modules_unit_id ON modules (unit_id);

CREATE INDEX idx_units_course_number ON units (course_id, unit_number);

CREATE INDEX idx_modules_unit_number ON modules (unit_id, module_number);
-- +goose StatementEnd

-- +goose Down
-- +goose StatementBegin
DROP TABLE IF EXISTS modules;

DROP TABLE IF EXISTS units;
-- +goose StatementEnd