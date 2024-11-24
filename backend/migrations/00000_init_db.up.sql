
CREATE TYPE user_role AS ENUM ('admin', 'instructor', 'student');

CREATE TYPE difficulty_level AS ENUM ('beginner', 'intermediate', 'advanced', 'expert');

CREATE TYPE module_progress_status AS ENUM ('uninitiated', 'in_progress', 'completed', 'abandoned');

CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    username VARCHAR(255) NOT NULL UNIQUE,
    email VARCHAR(255) NOT NULL UNIQUE,
    oauth_id VARCHAR(255),
    role user_role NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    first_name VARCHAR(100),
    last_name VARCHAR(100),
    profile_picture_url TEXT,
    last_login_at TIMESTAMPTZ,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    is_email_verified BOOLEAN NOT NULL DEFAULT FALSE,
    bio TEXT,
    location VARCHAR(255),
    cpus INTEGER NOT NULL DEFAULT 1,
    preferences JSONB
);

-- Courses Table
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

-- Authors and Course Authors Tables
CREATE TABLE authors (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL
);

CREATE TABLE course_authors (
    course_id INTEGER NOT NULL,
    author_id INTEGER NOT NULL,
    PRIMARY KEY (course_id, author_id),
    FOREIGN KEY (course_id) REFERENCES courses(id) ON DELETE CASCADE,
    FOREIGN KEY (author_id) REFERENCES authors(id) ON DELETE CASCADE
);

-- Tags and Course Tags Tables
CREATE TABLE tags (
    id SERIAL PRIMARY KEY,
    name VARCHAR(50) NOT NULL UNIQUE
);

CREATE TABLE course_tags (
    course_id INTEGER NOT NULL,
    tag_id INTEGER NOT NULL,
    PRIMARY KEY (course_id, tag_id),
    FOREIGN KEY (course_id) REFERENCES courses(id) ON DELETE CASCADE,
    FOREIGN KEY (tag_id) REFERENCES tags(id) ON DELETE CASCADE
);

-- Units Table
CREATE TABLE units (
    id SERIAL PRIMARY KEY,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    unit_number INTEGER NOT NULL,
    course_id INTEGER NOT NULL,
    name VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    FOREIGN KEY (course_id) REFERENCES courses(id) ON DELETE CASCADE
);

-- Questions Table
CREATE TABLE questions (
    id SERIAL PRIMARY KEY,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    type VARCHAR(50) NOT NULL,
    question TEXT NOT NULL,
    difficulty_level difficulty_level
);

-- Question Tags Table
CREATE TABLE question_tags (
    question_id INTEGER NOT NULL,
    tag_id INTEGER NOT NULL,
    PRIMARY KEY (question_id, tag_id),
    FOREIGN KEY (question_id) REFERENCES questions(id) ON DELETE CASCADE,
    FOREIGN KEY (tag_id) REFERENCES tags(id) ON DELETE CASCADE
);

-- Modules Table
CREATE TABLE modules (
    id SERIAL PRIMARY KEY,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    module_number INTEGER NOT NULL,
    unit_id INTEGER NOT NULL,
    name VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    FOREIGN KEY (unit_id) REFERENCES units(id) ON DELETE CASCADE
);

-- Sections Base Table (Using Class Table Inheritance)
CREATE TABLE sections (
    id SERIAL PRIMARY KEY,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    module_id INTEGER NOT NULL,
    type VARCHAR(50) NOT NULL,
    position INTEGER NOT NULL DEFAULT 0,
    FOREIGN KEY (module_id) REFERENCES modules(id) ON DELETE CASCADE
);


-- Text Sections Table
CREATE TABLE text_sections (
    section_id INTEGER PRIMARY KEY,
    content TEXT NOT NULL,
    FOREIGN KEY (section_id) REFERENCES sections(id) ON DELETE CASCADE
);

-- Video Sections Table
CREATE TABLE video_sections (
    section_id INTEGER PRIMARY KEY,
    url TEXT NOT NULL,
    FOREIGN KEY (section_id) REFERENCES sections(id) ON DELETE CASCADE
);

-- Question Sections Table
CREATE TABLE question_sections (
    section_id INTEGER PRIMARY KEY,
    question_id INTEGER NOT NULL,
    FOREIGN KEY (section_id) REFERENCES sections(id) ON DELETE CASCADE,
    FOREIGN KEY (question_id) REFERENCES questions(id) ON DELETE CASCADE
);

-- Question Options Table
CREATE TABLE question_options (
    id SERIAL PRIMARY KEY,
    question_id INTEGER NOT NULL,
    content TEXT NOT NULL,
    is_correct BOOLEAN NOT NULL,
    FOREIGN KEY (question_id) REFERENCES questions(id) ON DELETE CASCADE
);

-- Module Questions Table
CREATE TABLE module_questions (
    id SERIAL PRIMARY KEY,
    module_id INTEGER NOT NULL,
    question_id INTEGER NOT NULL,
    position INTEGER NOT NULL,
    FOREIGN KEY (module_id) REFERENCES modules(id) ON DELETE CASCADE,
    FOREIGN KEY (question_id) REFERENCES questions(id) ON DELETE CASCADE
);

-- User Module Progress Table 
CREATE TABLE user_module_progress (
    id SERIAL PRIMARY KEY,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    user_id INTEGER NOT NULL,
    module_id INTEGER NOT NULL,
    started_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    completed_at TIMESTAMPTZ,
    progress FLOAT NOT NULL DEFAULT 0.0 CHECK (progress >= 0.0 AND progress <= 100.0),
    current_section_id INTEGER,
    last_accessed TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    status module_progress_status NOT NULL DEFAULT 'in_progress',
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (module_id) REFERENCES modules(id) ON DELETE CASCADE,
    FOREIGN KEY (current_section_id) REFERENCES sections(id) ON DELETE SET NULL
);

-- User Courses Table
CREATE TABLE user_courses (
    id SERIAL PRIMARY KEY,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    user_id INTEGER NOT NULL,
    course_id INTEGER NOT NULL,
    current_unit_id INTEGER,
    current_module_id INTEGER,
    latest_module_progress_id INTEGER,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (course_id) REFERENCES courses(id) ON DELETE CASCADE,
    FOREIGN KEY (current_unit_id) REFERENCES units(id) ON DELETE SET NULL,
    FOREIGN KEY (current_module_id) REFERENCES modules(id) ON DELETE SET NULL,
    FOREIGN KEY (latest_module_progress_id) REFERENCES user_module_progress(id) ON DELETE SET NULL
);

-- User Section Progress Table (Tracks progress at the section level)
CREATE TABLE user_section_progress (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL,
    module_id INTEGER NOT NULL,
    section_id INTEGER NOT NULL,
    started_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    completed_at TIMESTAMPTZ,
    has_seen BOOLEAN NOT NULL DEFAULT FALSE,
    seen_at TIMESTAMPTZ,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (module_id) REFERENCES modules(id) ON DELETE CASCADE,
    FOREIGN KEY (section_id) REFERENCES sections(id) ON DELETE CASCADE
);

-- User Question Answers Table (Ensures referential integrity)
CREATE TABLE user_question_answers (
    id SERIAL PRIMARY KEY,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    user_module_progress_id INTEGER NOT NULL,
    question_id INTEGER NOT NULL,
    option_id INTEGER NOT NULL,
    answered_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    is_correct BOOLEAN NOT NULL DEFAULT FALSE,
    FOREIGN KEY (user_module_progress_id) REFERENCES user_module_progress(id) ON DELETE CASCADE,
    FOREIGN KEY (question_id) REFERENCES questions(id) ON DELETE CASCADE,
    FOREIGN KEY (option_id) REFERENCES question_options(id) ON DELETE CASCADE
);

-- Achievements Table
CREATE TABLE achievements (
    id SERIAL PRIMARY KEY,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    name VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    points INTEGER NOT NULL DEFAULT 0
);

-- User Achievements Table 
CREATE TABLE user_achievements (
    id SERIAL PRIMARY KEY,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    user_id INTEGER NOT NULL,
    achievement_id INTEGER NOT NULL,
    achieved_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (achievement_id) REFERENCES achievements(id) ON DELETE CASCADE,
    UNIQUE (user_id, achievement_id)
);

-- Notifications Table
CREATE TABLE notifications (
    id SERIAL PRIMARY KEY,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    user_id INTEGER NOT NULL,
    content TEXT NOT NULL,
    read BOOLEAN NOT NULL DEFAULT FALSE,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Streaks Table
CREATE TABLE streaks (
    id SERIAL PRIMARY KEY,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    user_id INTEGER NOT NULL,
    start_date DATE NOT NULL,
    end_date DATE,
    current_streak INTEGER NOT NULL DEFAULT 0,
    longest_streak INTEGER NOT NULL DEFAULT 0,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Indexes
CREATE UNIQUE INDEX idx_users_email ON users(email);
CREATE UNIQUE INDEX idx_users_username ON users(username);
CREATE INDEX idx_courses_name ON courses(name);
CREATE INDEX idx_modules_unit_id ON modules(unit_id);
CREATE INDEX idx_user_module_progress_user_id ON user_module_progress(user_id);
CREATE INDEX idx_user_section_progress_section_id ON user_section_progress(section_id);
CREATE INDEX idx_sections_module_id ON sections(module_id);

-- Additional Indexes on Foreign Keys
CREATE INDEX idx_course_authors_course_id ON course_authors(course_id);
CREATE INDEX idx_course_authors_author_id ON course_authors(author_id);
CREATE INDEX idx_course_tags_course_id ON course_tags(course_id);
CREATE INDEX idx_course_tags_tag_id ON course_tags(tag_id);
CREATE INDEX idx_question_tags_question_id ON question_tags(question_id);
CREATE INDEX idx_question_tags_tag_id ON question_tags(tag_id);
CREATE INDEX idx_user_courses_user_id ON user_courses(user_id);
CREATE INDEX idx_user_courses_course_id ON user_courses(course_id);
CREATE INDEX idx_user_question_answers_user_module_progress_id ON user_question_answers(user_module_progress_id);
CREATE INDEX idx_user_question_answers_question_id ON user_question_answers(question_id);

-- Unique Constraints
ALTER TABLE user_achievements
ADD CONSTRAINT uniq_user_achievement UNIQUE (user_id, achievement_id);

ALTER TABLE user_courses
ADD CONSTRAINT uniq_user_course UNIQUE (user_id, course_id);

ALTER TABLE user_section_progress 
ADD CONSTRAINT unique_user_section_progress 
UNIQUE (user_id, section_id);

ALTER TABLE user_module_progress 
ADD CONSTRAINT unique_user_module_progress 
UNIQUE (user_id, module_id);

-- Add constraints for answers to ensure one answer per question per user_module_progress
ALTER TABLE user_question_answers
ADD CONSTRAINT unique_user_question_answer 
UNIQUE (user_module_progress_id, question_id);

-- Ensure one question section per question
ALTER TABLE question_sections
ADD CONSTRAINT unique_question_section 
UNIQUE (question_id);

-- Ensure section positions are unique within a module
ALTER TABLE sections
ADD CONSTRAINT unique_section_position_per_module 
UNIQUE (module_id, position);

-- Check Constraints
ALTER TABLE user_module_progress
ADD CHECK (progress >= 0.0 AND progress <= 100.0);

-- Create unique constraints to ensure no duplicate numbers within same parent
ALTER TABLE units
ADD CONSTRAINT unique_unit_number_per_course UNIQUE (course_id, unit_number);

ALTER TABLE modules
ADD CONSTRAINT unique_module_number_per_unit UNIQUE (unit_id, module_number);

-- Create indexes for efficient ordering
CREATE INDEX idx_units_course_number ON units(course_id, unit_number);
CREATE INDEX idx_modules_unit_number ON modules(unit_id, module_number);

-- Add check constraints to ensure positive numbers
ALTER TABLE units
ADD CONSTRAINT positive_unit_number CHECK (unit_number > 0);

ALTER TABLE modules
ADD CONSTRAINT positive_module_number CHECK (module_number > 0);

-- Optional: Full-Text Search Indexes (If needed)
-- CREATE INDEX idx_courses_description ON courses USING GIN (to_tsvector('english', description));

-- Note: Implement triggers or application logic as needed to automatically update timestamps and enforce data integrity.