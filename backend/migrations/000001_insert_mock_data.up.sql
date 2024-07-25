-- Users
INSERT INTO users (username, email, password_hash, oauth_id, role, first_name, last_name, profile_picture_url, last_login_at, is_active, is_email_verified, bio, location, preferences, cpus, created_at, updated_at)
VALUES 
('john_doe', 'john@example.com', 'hashedpassword1', 'oauthid1', 'user', 'John', 'Doe', 'http://example.com/john.jpg', NOW(), TRUE, FALSE, 'Bio of John Doe', 'New York', '{}', 100, NOW(), NOW()),
('jane_smith', 'jane@example.com', 'hashedpassword2', 'oauthid2', 'admin', 'Jane', 'Smith', 'http://example.com/jane.jpg', NOW(), TRUE, TRUE, 'Bio of Jane Smith', 'Los Angeles', '{"theme":"dark"}', 200, NOW(), NOW());

-- Streaks
INSERT INTO streaks (user_id, start_date, end_date, current_streak, longest_streak, created_at, updated_at)
VALUES 
(1, '2024-01-01', '2024-01-10', 10, 10, NOW(), NOW()),
(2, '2024-01-05', '2024-01-15', 10, 10, NOW(), NOW());

-- Courses
INSERT INTO courses (name, description, background_color, icon_url, duration, difficulty_level, author, tags, rating, learners_count, created_at, updated_at, last_updated)
VALUES 
('Intro to Algorithms', 'Learn the basics of algorithms', '#FF5733', 'http://example.com/algorithms.png', '4 weeks', 'Beginner', 'John Doe', ARRAY['algorithms', 'basics'], 4.5, 150, NOW(), NOW(), NOW()),
('Advanced Data Structures', 'Deep dive into data structures', '#33FF57', 'http://example.com/datastructures.png', '6 weeks', 'Advanced', 'Jane Smith', ARRAY['data structures', 'advanced'], 4.8, 100, NOW(), NOW(), NOW());

-- Units
INSERT INTO units (course_id, name, description, created_at, updated_at)
VALUES 
(1, 'Basic Algorithms', 'Introduction to basic algorithms', NOW(), NOW()),
(2, 'Trees and Graphs', 'Advanced concepts of trees and graphs', NOW(), NOW());

-- Modules
INSERT INTO modules (unit_id, name, description, content, created_at, updated_at)
VALUES 
(1, 'Sorting Algorithms', 'Learn about sorting algorithms', '{"content": "Sorting algorithms content"}', NOW(), NOW()),
(2, 'Graph Traversal', 'Learn about graph traversal techniques', '{"content": "Graph traversal content"}', NOW(), NOW());

-- Module Questions
INSERT INTO module_questions (module_id, content, created_at, updated_at)
VALUES 
(1, 'What is the time complexity of quicksort?', NOW(), NOW()),
(2, 'Explain the difference between DFS and BFS.', NOW(), NOW());

-- Module Question Answers
INSERT INTO module_question_answers (question_id, content, is_correct, created_at, updated_at)
VALUES 
(1, 'O(n log n)', TRUE, NOW(), NOW()),
(1, 'O(n^2)', FALSE, NOW(), NOW()),
(2, 'DFS uses a stack, BFS uses a queue', TRUE, NOW(), NOW()),
(2, 'DFS is faster than BFS', FALSE, NOW(), NOW());

-- User Module Sessions
INSERT INTO user_module_sessions (user_id, module_id, started_at, completed_at, progress, current_position, last_accessed)
VALUES 
(1, 1, NOW(), NULL, 50.00, 2, NOW()),
(2, 2, NOW(), '2024-02-01', 100.00, 5, NOW());

-- User Answers
INSERT INTO user_answers (user_module_session_id, question_id, answer_id, answered_at, is_correct)
VALUES 
(1, 1, 1, NOW(), TRUE),
(2, 2, 3, NOW(), TRUE);

-- Achievements
INSERT INTO achievements (name, description, points, created_at, updated_at)
VALUES 
('First Module Completed', 'Complete your first module', 10, NOW(), NOW()),
('Perfect Score', 'Get a perfect score in a module', 20, NOW(), NOW());

-- User Achievements
INSERT INTO user_achievements (user_id, achievement_id, achieved_at, name, description, points)
VALUES 
(1, 1, NOW(), 'First Module Completed', 'Complete your first module', 10),
(2, 2, NOW(), 'Perfect Score', 'Get a perfect score in a module', 20);

-- Notifications
INSERT INTO notifications (user_id, content, read, created_at)
VALUES 
(1, 'You have a new achievement!', FALSE, NOW()),
(2, 'Your module is complete!', TRUE, NOW());
