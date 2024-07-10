-- Users table
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    username VARCHAR(50) UNIQUE NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    oauth_id VARCHAR(100),
    role VARCHAR(20) DEFAULT 'user',
    first_name VARCHAR(100),
    last_name VARCHAR(100),
    profile_picture_url TEXT,
    last_login_at TIMESTAMP,
    is_active BOOLEAN DEFAULT TRUE,
    is_email_verified BOOLEAN DEFAULT FALSE,
    bio TEXT,
    location VARCHAR(100),
    preferences JSONB DEFAULT '{}',
    cpus INT DEFAULT 0,  -- CPUs (points)
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE streaks (
    id SERIAL PRIMARY KEY,
    user_id INT REFERENCES users(id) ON DELETE CASCADE,
    start_date TIMESTAMP NOT NULL,
    end_date TIMESTAMP,
    current_streak INT NOT NULL,  -- Length of the current streak in days
    longest_streak INT NOT NULL,  -- Length of the longest streak in days
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Courses table
CREATE TABLE courses (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) UNIQUE NOT NULL,
    description TEXT NOT NULL,
    background_color VARCHAR(7) DEFAULT '#FFFFFF',  -- Default white color
    icon_url TEXT,
    duration VARCHAR(50),
    difficulty_level VARCHAR(20),  -- Example: "Beginner", "Intermediate", "Advanced"
    author VARCHAR(100),
    tags TEXT[],  -- Array of tags
    rating DECIMAL(2, 1) CHECK (rating >= 0 AND rating <= 5),  -- Rating from 0 to 5
    learners_count INT DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    last_updated TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Units table
CREATE TABLE units (
    id SERIAL PRIMARY KEY,
    course_id INT REFERENCES courses(id) ON DELETE CASCADE,
    name VARCHAR(100) UNIQUE NOT NULL,
    description TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Modules table
CREATE TABLE modules (
    id SERIAL PRIMARY KEY,
    unit_id INT REFERENCES units(id) ON DELETE CASCADE,
    name VARCHAR(100) UNIQUE NOT NULL,
    description TEXT NOT NULL,
    content JSONB NOT NULL,  -- Storing content in JSONB format
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Module questions table
CREATE TABLE module_questions (
    id SERIAL PRIMARY KEY,
    module_id INT REFERENCES modules(id) ON DELETE CASCADE,
    content TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Module questions answers table
CREATE TABLE module_question_answers (
    id SERIAL PRIMARY KEY,
    question_id INT REFERENCES module_questions(id) ON DELETE CASCADE,
    content TEXT NOT NULL,
    is_correct BOOLEAN NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- User module sessions table
CREATE TABLE user_module_sessions (
    id SERIAL PRIMARY KEY,
    user_id INT REFERENCES users(id) ON DELETE CASCADE,
    module_id INT REFERENCES modules(id) ON DELETE CASCADE,
    started_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    completed_at TIMESTAMP,
    progress DECIMAL(5, 2) DEFAULT 0.00,  -- A percentage value indicating the progress
    current_position INT DEFAULT 0,  -- Current position in the module content
    last_accessed TIMESTAMP DEFAULT CURRENT_TIMESTAMP  -- Last accessed time
);

-- User answers table
CREATE TABLE user_answers (
    id SERIAL PRIMARY KEY,
    user_module_session_id INT REFERENCES user_module_sessions(id) ON DELETE CASCADE,
    question_id INT REFERENCES module_questions(id) ON DELETE CASCADE,
    answer_id INT REFERENCES module_question_answers(id) ON DELETE CASCADE,
    answered_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    is_correct BOOLEAN NOT NULL
);

-- Achievements table
CREATE TABLE achievements (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    description TEXT NOT NULL,
    points INT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- User achievements table
CREATE TABLE user_achievements (
    id SERIAL PRIMARY KEY,
    user_id INT REFERENCES users(id) ON DELETE CASCADE,
    achievement_id INT REFERENCES achievements(id) ON DELETE CASCADE,
    achieved_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(user_id, achievement_id)
);

-- Notifications table
CREATE TABLE notifications (
    id SERIAL PRIMARY KEY,
    user_id INT REFERENCES users(id) ON DELETE CASCADE,
    content TEXT NOT NULL,
    read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
