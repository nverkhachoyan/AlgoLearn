-- Data Inserts

-- 1. Insert Data into 'users' Table
INSERT INTO users (username, email, role, password_hash, first_name, last_name, is_active, is_email_verified)
VALUES
('admin_user', 'admin@example.com', 'admin', 'hashedpassword1', 'Alice', 'Admin', TRUE, TRUE),
('instructor_bob', 'bob@example.com', 'instructor', 'hashedpassword2', 'Bob', 'Builder', TRUE, TRUE),
('instructor_carol', 'carol@example.com', 'instructor', 'hashedpassword3', 'Carol', 'Creator', TRUE, TRUE),
('student_dave', 'dave@example.com', 'student', 'hashedpassword4', 'Dave', 'Doe', TRUE, TRUE),
('student_eve', 'eve@example.com', 'student', 'hashedpassword5', 'Eve', 'Evans', TRUE, TRUE);

-- 2. Insert Data into 'authors' Table
INSERT INTO authors (name)
VALUES
('Bob Builder'),
('Carol Creator'),
('Dan Developer'),
('Eve Evans'),
('Frank Farmer');

-- 3. Insert Data into 'tags' Table
INSERT INTO tags (name)
VALUES
('Programming'),
('Algorithms'),
('Data Structures'),
('Mathematics'),
('Computer Science');

-- 4. Insert Data into 'courses' Table
INSERT INTO courses (name, description, requirements, what_you_learn, duration, difficulty_level, rating)
VALUES
('Introduction to Programming', 'Learn the basics of programming.', 'Reading', 'The Alphabet', 120, 'beginner', 4.5),
('Advanced Algorithms', 'Explore advanced algorithm concepts.', 'Reading', 'The Alphabet', 180, 'advanced', 4.7),
('Data Structures', 'Understand fundamental data structures.', 'Reading', 'The Alphabet', 150, 'intermediate', 4.6),
('Discrete Mathematics', 'Mathematical foundations for CS.', 'Reading', 'The Alphabet', 200, 'intermediate', 4.4),
('Machine Learning', 'Introduction to machine learning.', 'Reading', 'The Alphabet', 220, 'expert', 4.8);

-- 5. Insert Data into 'course_authors' Table
INSERT INTO course_authors (course_id, author_id)
VALUES
(1, 1),
(2, 2),
(3, 3),
(4, 2),
(5, 1),
(5, 3);

-- 6. Insert Data into 'course_tags' Table
INSERT INTO course_tags (course_id, tag_id)
VALUES
(1, 1),
(1, 5),
(2, 2),
(2, 5),
(3, 3),
(3, 5),
(4, 4),
(4, 5),
(5, 1),
(5, 2),
(5, 3),
(5, 5);

-- 7. Insert Data into 'units' Table
INSERT INTO units (course_id, unit_number, name, description)
VALUES
(1, 1, 'Basics', 'Introduction to programming basics'),
(1, 2, 'Control Structures', 'Learn about if statements and loops'),
(2, 1, 'Sorting Algorithms', 'Deep dive into sorting algorithms'),
(2, 2, 'Graph Algorithms', 'Explore graph theory and algorithms'),
(3, 1, 'Fundamental Data Structures', 'Arrays, linked lists, and more');

-- 8. Insert Data into 'questions' Table
INSERT INTO questions (type, question, difficulty_level)
VALUES
('multiple_choice', 'What is the time complexity of binary search?', 'beginner'),
('multiple_choice', 'Which data structure uses LIFO?', 'intermediate'),
('true_false', 'A queue follows FIFO principle.', 'beginner'),
('multiple_choice', 'Which algorithm is used for finding the shortest path?', 'advanced'),
('multiple_choice', 'What is a hash table?', 'intermediate'),
('multiple_choice', 'What is the average time complexity of QuickSort?', 'intermediate'),
('multiple_choice', 'Which pivot selection strategy is commonly used in QuickSort implementations?', 'intermediate'),
('true_false', 'QuickSort is an in-place sorting algorithm.', 'beginner'),
('multiple_choice', 'What is the worst case scenario for QuickSort?', 'advanced'),
('multiple_choice', 'Which of these scenarios would make QuickSort perform poorly?', 'advanced');

-- 9. Insert Data into 'question_tags' Table
INSERT INTO question_tags (question_id, tag_id)
VALUES
(1, 2),
(2, 3),
(3, 3),
(4, 2),
(5, 3),
(6, 2),
(6, 5),
(7, 2),
(7, 5),
(8, 2),
(8, 5),
(9, 2),
(9, 5),
(10, 2),
(10, 5);

-- 10. Insert Data into 'question_options' Table
INSERT INTO question_options (question_id, content, is_correct)
VALUES
-- Binary Search Question
(1, 'O(log n)', TRUE),
(1, 'O(n)', FALSE),
(1, 'O(n log n)', FALSE),
(1, 'O(1)', FALSE),

-- LIFO Question
(2, 'Queue', FALSE),
(2, 'Stack', TRUE),
(2, 'Array', FALSE),
(2, 'Tree', FALSE),

-- FIFO Question
(3, 'True', TRUE),
(3, 'False', FALSE),

-- Shortest Path Question
(4, 'Dijkstras Algorithm', TRUE),
(4, 'Bubble Sort', FALSE),
(4, 'Binary Search', FALSE),
(4, 'Quick Sort', FALSE),

-- Hash Table Question
(5, 'A tree data structure', FALSE),
(5, 'A mapping of keys to values', TRUE),
(5, 'A type of sorting algorithm', FALSE),
(5, 'An encryption method', FALSE),

-- QuickSort Time Complexity Question
(6, 'O(n log n)', TRUE),
(6, 'O(n)', FALSE),
(6, 'O(n²)', FALSE),
(6, 'O(log n)', FALSE),

-- QuickSort Pivot Selection Question
(7, 'Middle element', TRUE),
(7, 'First element', FALSE),
(7, 'Last element', FALSE),
(7, 'Random element', FALSE),

-- QuickSort In-Place Question
(8, 'True', TRUE),
(8, 'False', FALSE),

-- QuickSort Worst Case Question
(9, 'Already sorted array', TRUE),
(9, 'Random array', FALSE),
(9, 'Nearly sorted array', FALSE),
(9, 'Array with few duplicates', FALSE),

-- QuickSort Poor Performance Question
(10, 'Array with all identical elements', TRUE),
(10, 'Array with distinct elements', FALSE),
(10, 'Array with few duplicates', FALSE),
(10, 'Array with random elements', FALSE);

-- 11. Insert Data into 'modules' Table
INSERT INTO modules (unit_id, module_number, name, description)
VALUES
(1, 1, 'Introduction to Variables', 'Learn about variables in programming'),
(1, 2, 'Data Types', 'Understand different data types'),
(2, 1, 'If Statements', 'Control flow with if statements'),
(2, 2, 'Loops', 'Understanding loops'),
(3, 1, 'Quick Sort Algorithm', 'Implementing Quick Sort');

-- 12. Insert Data into 'sections' Table
INSERT INTO sections (module_id, type, position)
VALUES
(1, 'text', 1),
(1, 'video', 2),
(1, 'question', 3),
(1, 'text', 4),
(1, 'question', 5);

-- 13. Insert Data into 'text_sections' Table
INSERT INTO text_sections (section_id, content)
VALUES
(1, 'Variables are used to store data in a program.'),
(4, 'Summary: Variables are fundamental in programming.');

-- 14. Insert Data into 'video_sections' Table
INSERT INTO video_sections (section_id, url)
VALUES
(2, 'http://example.com/videos/intro_to_variables.mp4');

-- 15. Insert Data into 'question_sections' Table
INSERT INTO question_sections (section_id, question_id)
VALUES
(3, 1),
(5, 2);

-- 16. Insert Data into 'module_questions' Table
INSERT INTO module_questions (module_id, question_id, position)
VALUES
(1, 1, 1),
(1, 2, 2),
(2, 3, 1),
(3, 4, 1),
(4, 5, 1),
(5, 6, 1),
(5, 7, 2),
(5, 8, 3),
(5, 9, 4),
(5, 10, 5);

-- 17. Insert Data into 'user_module_progress' Table
INSERT INTO user_module_progress (user_id, module_id, started_at, progress, current_section_id, status)
VALUES
(4, 1, NOW() - INTERVAL '2 days', 40.0, 2, 'in_progress'),
(5, 2, NOW() - INTERVAL '1 day', 60.0, 3, 'in_progress'),
(4, 3, NOW() - INTERVAL '3 days', 100.0, NULL, 'completed'),
(5, 4, NOW() - INTERVAL '4 days', 100.0, NULL, 'completed'),
(4, 5, NOW() - INTERVAL '5 days', 20.0, 1, 'in_progress');

-- 18. Insert Data into 'user_courses' Table
INSERT INTO user_courses (user_id, course_id, current_unit_id, current_module_id, latest_module_progress_id)
VALUES
(4, 1, 1, 1, 1),
(5, 1, 1, 2, 2),
(4, 2, 3, 5, 5),
(5, 2, 4, 4, 4),
(4, 3, NULL, NULL, NULL);

-- 19. Insert Data into 'user_section_progress' Table
INSERT INTO user_section_progress (user_id, module_id, section_id, started_at, completed_at, status)
VALUES
(4, 1, 1, NOW() - INTERVAL '2 days', NOW() - INTERVAL '2 days', 'completed'),
(4, 1, 2, NOW() - INTERVAL '1 day', NULL, 'in_progress'),
(5, 2, 3, NOW() - INTERVAL '1 day', NOW() - INTERVAL '1 day', 'completed'),
(5, 2, 4, NOW(), NULL, 'in_progress'),
(4, 3, 5, NOW() - INTERVAL '3 days', NOW() - INTERVAL '3 days', 'completed');

-- 20. Insert Data into 'user_question_answers' Table
INSERT INTO user_question_answers (user_module_progress_id, question_id, answer_id, answered_at, is_correct)
VALUES
(1, 1, 1, NOW() - INTERVAL '2 days', TRUE),
(1, 2, 6, NOW() - INTERVAL '1 day', TRUE),
(2, 3, 9, NOW() - INTERVAL '1 day', TRUE),
(3, 4, 11, NOW() - INTERVAL '3 days', TRUE),
(5, 5, 16, NOW() - INTERVAL '5 days', TRUE);

-- 21. Insert Data into 'achievements' Table
INSERT INTO achievements (name, description, points)
VALUES
('First Module Completed', 'Complete your first module.', 10),
('Quiz Master', 'Answer all quiz questions correctly.', 20),
('Course Completion', 'Complete an entire course.', 50),
('First Login', 'Login to the platform for the first time.', 5),
('Streak Starter', 'Complete modules 5 days in a row.', 15);

-- 22. Insert Data into 'user_achievements' Table
INSERT INTO user_achievements (user_id, achievement_id, achieved_at)
VALUES
(4, 1, NOW() - INTERVAL '2 days'),
(4, 2, NOW() - INTERVAL '1 day'),
(5, 1, NOW() - INTERVAL '1 day'),
(5, 4, NOW() - INTERVAL '4 days'),
(4, 4, NOW() - INTERVAL '5 days');

-- 23. Insert Data into 'notifications' Table
INSERT INTO notifications (user_id, content, read)
VALUES
(4, 'Welcome to the platform!', FALSE),
(4, 'You have completed a module!', FALSE),
(5, 'New course available: Advanced Algorithms', FALSE),
(5, 'Your friend Dave has joined!', FALSE),
(2, 'A new student enrolled in your course.', FALSE);

-- 24. Insert Data into 'streaks' Table
INSERT INTO streaks (user_id, start_date, end_date, current_streak, longest_streak)
VALUES
(4, CURRENT_DATE - INTERVAL '5 days', NULL, 5, 5),
(5, CURRENT_DATE - INTERVAL '3 days', CURRENT_DATE - INTERVAL '1 day', 0, 3),
(2, CURRENT_DATE - INTERVAL '10 days', NULL, 10, 10),
(3, CURRENT_DATE - INTERVAL '7 days', CURRENT_DATE - INTERVAL '2 days', 0, 5),
(1, CURRENT_DATE - INTERVAL '1 day', NULL, 1, 1);

-- 25. Insert Data into 'user_section_progress' Table
INSERT INTO user_section_progress (user_id, module_id, section_id, started_at, completed_at, status)
VALUES
(5, 2, 3, NOW() - INTERVAL '1 day', NOW() - INTERVAL '1 day', 'completed'),
(5, 2, 4, NOW(), NULL, 'in_progress'),
(4, 5, 5, NOW() - INTERVAL '5 days', NULL, 'in_progress'),
(4, 1, 3, NOW() - INTERVAL '2 days', NOW() - INTERVAL '2 days', 'completed'),
(4, 1, 5, NOW() - INTERVAL '1 day', NULL, 'in_progress');