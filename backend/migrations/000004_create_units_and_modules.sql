-- +goose Up
-- +goose StatementBegin
CREATE TABLE units (
    id SERIAL PRIMARY KEY,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    unit_number INTEGER NOT NULL,
    course_id INTEGER NOT NULL,
    name VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    FOREIGN KEY (course_id) REFERENCES courses (id) ON DELETE CASCADE
);

CREATE TABLE modules (
    id SERIAL PRIMARY KEY,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    module_number INTEGER NOT NULL,
    unit_id INTEGER NOT NULL,
    name VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    FOREIGN KEY (unit_id) REFERENCES units (id) ON DELETE CASCADE
);

CREATE INDEX idx_modules_unit_id ON modules (unit_id);

CREATE INDEX idx_units_course_number ON units (course_id, unit_number);

CREATE INDEX idx_modules_unit_number ON modules (unit_id, module_number);

ALTER TABLE units
ADD CONSTRAINT unique_unit_number_per_course UNIQUE (course_id, unit_number),
ADD CONSTRAINT positive_unit_number CHECK (unit_number > 0);

ALTER TABLE modules
ADD CONSTRAINT unique_module_number_per_unit UNIQUE (unit_id, module_number),
ADD CONSTRAINT positive_module_number CHECK (module_number > 0);
-- +goose StatementEnd

-- +goose Down
-- +goose StatementBegin
DROP TABLE IF EXISTS modules;

DROP TABLE IF EXISTS units;
-- +goose StatementEnd