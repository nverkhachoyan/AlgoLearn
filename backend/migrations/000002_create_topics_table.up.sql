CREATE TABLE topics (
    topic_id SERIAL PRIMARY KEY,
    name VARCHAR(100) UNIQUE NOT NULL,
    description TEXT NOT NULL
);

CREATE TABLE subtopics (
    subtopic_id SERIAL PRIMARY KEY,
    topic_id INT REFERENCES topics(topic_id) ON DELETE CASCADE,
    name VARCHAR(100) UNIQUE NOT NULL,
    description TEXT NOT NULL
);
