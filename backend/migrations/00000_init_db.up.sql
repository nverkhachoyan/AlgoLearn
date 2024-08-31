CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    username VARCHAR(255) NOT NULL UNIQUE,
    email VARCHAR(255) NOT NULL UNIQUE,
    oauth_id VARCHAR(255),
    role VARCHAR(50) NOT NULL,
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
    preferences JSONB,
    learners_count INTEGER NOT NULL DEFAULT 0
);

CREATE TABLE courses (
    id SERIAL PRIMARY KEY,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    name VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    background_color VARCHAR(7),
    icon_url TEXT,
    duration VARCHAR(50),
    difficulty_level VARCHAR(50),
    author VARCHAR(255),
    tags TEXT[],
    rating FLOAT,
    learners_count INTEGER NOT NULL DEFAULT 0,
    last_updated TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE units (
    id SERIAL PRIMARY KEY,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    course_id INTEGER NOT NULL,
    name VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    FOREIGN KEY (course_id) REFERENCES courses(id) ON DELETE CASCADE
);

CREATE TABLE modules (
    id SERIAL PRIMARY KEY,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    unit_id INTEGER NOT NULL,
    course_id INTEGER NOT NULL,
    name VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    content JSONB NOT NULL,
    FOREIGN KEY (unit_id) REFERENCES units(id) ON DELETE CASCADE,
    FOREIGN KEY (course_id) REFERENCES courses(id) ON DELETE CASCADE
);

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

CREATE TABLE achievements (
    id SERIAL PRIMARY KEY,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    name VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    points INTEGER NOT NULL DEFAULT 0
);

CREATE TABLE user_achievements (
    id SERIAL PRIMARY KEY,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    user_id INTEGER NOT NULL,
    achievement_id INTEGER NOT NULL,
    achieved_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    name VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    points INTEGER NOT NULL DEFAULT 0,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (achievement_id) REFERENCES achievements(id) ON DELETE CASCADE
);

CREATE TABLE module_questions (
    id SERIAL PRIMARY KEY,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    module_id INTEGER NOT NULL,
    content TEXT NOT NULL,
    FOREIGN KEY (module_id) REFERENCES modules(id) ON DELETE CASCADE
);

CREATE TABLE module_question_options (
    id SERIAL PRIMARY KEY,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    question_id INTEGER NOT NULL,
    content TEXT NOT NULL,
    is_correct BOOLEAN NOT NULL DEFAULT FALSE,
    FOREIGN KEY (question_id) REFERENCES module_questions(id) ON DELETE CASCADE
);

CREATE TABLE notifications (
    id SERIAL PRIMARY KEY,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    user_id INTEGER NOT NULL,
    content TEXT NOT NULL,
    read BOOLEAN NOT NULL DEFAULT FALSE,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- ModuleProgressStatus ENUM
CREATE TYPE module_progress_status AS ENUM ('in_progress', 'completed', 'abandoned');

CREATE TABLE user_module_progress (
    id SERIAL PRIMARY KEY,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    user_id INTEGER NOT NULL,
    module_id INTEGER NOT NULL,
    started_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    completed_at TIMESTAMPTZ,
    progress FLOAT NOT NULL DEFAULT 0.0,
    current_position INTEGER NOT NULL DEFAULT 0,
    last_accessed TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    status module_progress_status NOT NULL DEFAULT 'in_progress',
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (module_id) REFERENCES modules(id) ON DELETE CASCADE
);

CREATE TABLE user_question_answers (
    id SERIAL PRIMARY KEY,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    user_module_progress_id INTEGER NOT NULL,
    question_id INTEGER NOT NULL,
    answer_id INTEGER NOT NULL,
    answered_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    is_correct BOOLEAN NOT NULL DEFAULT FALSE,
    FOREIGN KEY (user_module_progress_id) REFERENCES user_module_progress(id) ON DELETE CASCADE,
    FOREIGN KEY (question_id) REFERENCES module_questions(id) ON DELETE CASCADE,
    FOREIGN KEY (answer_id) REFERENCES module_question_options(id) ON DELETE CASCADE
);

CREATE TABLE user_courses (
    id SERIAL PRIMARY KEY,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    user_id INTEGER NOT NULL,
    course_id INTEGER NOT NULL,
    latest_module_progress_id INTEGER,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (course_id) REFERENCES courses(id) ON DELETE CASCADE,
    FOREIGN KEY (latest_module_progress_id) REFERENCES user_module_progress(id) ON DELETE SET NULL
);

-- Sections (Single Table Inheritance)
CREATE TABLE sections (
    id SERIAL PRIMARY KEY,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    module_id INTEGER NOT NULL,
    type VARCHAR(50) NOT NULL,
    position INTEGER NOT NULL DEFAULT 0,
    content TEXT, -- TextSection, CodeSection
    question_id INTEGER, -- QuestionSection
    question TEXT, -- QuestionSection
    user_answer_id INTEGER, -- QuestionSection
    correct_answer_ids INTEGER[], -- QuestionSection
    url TEXT, -- VideoSection, ImageSection
    animation TEXT, -- LottieSection
    description TEXT, -- ImageSection
    FOREIGN KEY (module_id) REFERENCES modules(id) ON DELETE CASCADE,
    FOREIGN KEY (question_id) REFERENCES module_questions(id) ON DELETE SET NULL,
    FOREIGN KEY (user_answer_id) REFERENCES user_question_answers(id) ON DELETE SET NULL
);

-- Indexes
CREATE UNIQUE INDEX idx_users_email ON users(email);
CREATE UNIQUE INDEX idx_users_username ON users(username);
CREATE INDEX idx_courses_name ON courses(name);
CREATE INDEX idx_modules_unit_id ON modules(unit_id);
CREATE INDEX idx_user_module_progress_user_id ON user_module_progress(user_id);
CREATE INDEX idx_sections_module_id ON sections(module_id);
