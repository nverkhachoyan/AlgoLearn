-- Insert mock users
INSERT INTO users (
    username, email, oauth_id, role, password_hash, first_name, last_name, 
    profile_picture_url, bio, location, cpus, preferences, learners_count
) VALUES
('john_doe', 'john@example.com', NULL, 'student', 'hashed_password_1', 'John', 'Doe', 
 'https://example.com/john.jpg', 'A passionate learner.', 'Los Angeles', 2, 
 '{"theme":"dark","notifications":true}', 5),
('jane_smith', 'jane@example.com', NULL, 'teacher', 'hashed_password_2', 'Jane', 'Smith', 
 'https://example.com/jane.jpg', 'A skilled educator.', 'New York', 4, 
 '{"theme":"light","notifications":false}', 10);


-- Insert mock courses
INSERT INTO courses (
    name, description, background_color, icon_url, duration, difficulty_level, 
    authors, tags, rating, learners_count
) VALUES
('Intro to Algorithms', 'A beginner-friendly course on algorithms.', '#FFFFFF', 
 'https://example.com/icon1.png', '10 hours', 'Beginner', 
 ARRAY['Jane Smith'], ARRAY['algorithms', 'sorting', 'search'], 4.5, 100),
('Advanced Databases', 'Deep dive into database management systems.', '#0000FF', 
 'https://example.com/icon2.png', '20 hours', 'Advanced', 
 ARRAY['John Doe', 'Jane Smith'], ARRAY['databases', 'SQL', 'NoSQL'], 4.7, 200);

-- Insert mock units
INSERT INTO units (course_id, name, description) VALUES
(1, 'Sorting Algorithms', 'Learn how different sorting algorithms work.'),
(1, 'Searching Algorithms', 'Explore various searching techniques.'),
(2, 'SQL Basics', 'Introduction to SQL and relational databases.'),
(2, 'NoSQL Databases', 'Explore non-relational databases and their advantages.');


-- Insert mock modules
INSERT INTO modules (unit_id, course_id, name, description) VALUES
(1, 1, 'Bubble Sort', 'Understand how Bubble Sort works.'),
(1, 1, 'Quick Sort', 'Learn Quick Sort and its efficiency.'),
(2, 1, 'Binary Search', 'Learn Binary Search and its applications.'),
(3, 2, 'Writing SQL Queries', 'Learn to write basic SQL queries.'),
(4, 2, 'Understanding NoSQL', 'Learn the fundamentals of NoSQL databases.');


-- Insert mock module questions
INSERT INTO module_questions (module_id, content) VALUES
(1, 'Explain how Bubble Sort works.'),
(2, 'What is the average-case time complexity of Quick Sort?'),
(3, 'How does Binary Search differ from Linear Search?'),
(4, 'Write a SQL query to retrieve all users from the users table.'),
(5, 'What are the key differences between SQL and NoSQL databases?');


-- Insert mock module question options

-- For Bubble Sort Question (ID 1)
INSERT INTO module_question_options (question_id, content, is_correct) VALUES
(1, 'It repeatedly steps through the list, compares adjacent elements and swaps them if they are in the wrong order.', TRUE),
(1, 'It divides the list into smaller sublists, sorts them independently, and then merges them.', FALSE),
(1, 'It selects the smallest element and places it at the beginning of the list.', FALSE);

-- For Quick Sort Question (ID 2)
INSERT INTO module_question_options (question_id, content, is_correct) VALUES
(2, 'O(n log n)', TRUE),
(2, 'O(n^2)', FALSE),
(2, 'O(log n)', FALSE);

-- For Binary Search Question (ID 3)
INSERT INTO module_question_options (question_id, content, is_correct) VALUES
(3, 'Binary Search requires a sorted list and repeatedly divides the search interval in half.', TRUE),
(3, 'Binary Search can work on unsorted lists by checking each element sequentially.', FALSE),
(3, 'Binary Search uses hashing to find elements quickly.', FALSE);

-- For SQL Queries Question (ID 4)
INSERT INTO module_question_options (question_id, content, is_correct) VALUES
(4, 'SELECT * FROM users;', TRUE),
(4, 'GET * FROM users;', FALSE),
(4, 'FETCH ALL FROM users;', FALSE);

-- For NoSQL Databases Question (ID 5)
INSERT INTO module_question_options (question_id, content, is_correct) VALUES
(5, 'NoSQL databases are schema-less and can handle unstructured data.', TRUE),
(5, 'NoSQL databases always require fixed schemas.', FALSE),
(5, 'NoSQL databases cannot scale horizontally.', FALSE);


-- Insert mock achievements
INSERT INTO achievements (name, description, points) VALUES
('First Login', 'Logged in for the first time.', 10),
('Completed First Module', 'Completed the first module of any course.', 20),
('Top Learner', 'Achieved top learner status in a course.', 50);


-- Insert mock user module progress
INSERT INTO user_module_progress (
    user_id, module_id, started_at, progress, current_position, last_accessed, status
) VALUES
(1, 1, '2024-10-01T08:00:00Z', 50.0, 1, '2024-10-02T07:30:00Z', 'in_progress'),
(1, 2, '2024-10-01T09:00:00Z', 100.0, 2, '2024-10-02T07:45:00Z', 'completed'),
(2, 4, '2024-10-01T10:00:00Z', 75.0, 1, '2024-10-02T07:50:00Z', 'in_progress');


-- Insert mock user achievements
INSERT INTO user_achievements (
    user_id, achievement_id, achieved_at, name, description, points
) VALUES
(1, 1, '2024-10-01T08:05:00Z', 'First Login', 'Logged in for the first time.', 10),
(1, 2, '2024-10-02T08:00:00Z', 'Completed First Module', 'Completed the first module of any course.', 20),
(2, 1, '2024-10-01T10:05:00Z', 'First Login', 'Logged in for the first time.', 10);


-- Insert mock user question answers
INSERT INTO user_question_answers (
    user_module_progress_id, question_id, answer_id, answered_at, is_correct
) VALUES
(1, 1, 1, '2024-10-02T07:35:00Z', TRUE),
(2, 2, 1, '2024-10-02T07:50:00Z', TRUE),
(2, 3, 1, '2024-10-02T07:55:00Z', TRUE),
(3, 4, 1, '2024-10-02T07:58:00Z', TRUE),
(3, 5, 13, '2024-10-02T08:00:00Z', TRUE);


-- Insert mock user courses
INSERT INTO user_courses (
    user_id, course_id, latest_module_progress_id
) VALUES
(1, 1, 1),
(1, 2, 2),
(2, 2, 3);


-- Insert mock streaks
INSERT INTO streaks (
    user_id, start_date, end_date, current_streak, longest_streak
) VALUES
(1, '2024-09-25', '2024-10-01', 7, 10),
(2, '2024-09-28', NULL, 5, 5);


-- Insert mock notifications
INSERT INTO notifications (
    user_id, content, read
) VALUES
(1, 'Welcome to AlgoLearn!', FALSE),
(1, 'You have a new achievement!', FALSE),
(2, 'Your module progress has been updated.', TRUE);


-- Insert mock sections

-- Sections for Bubble Sort Module (Module ID 1)
INSERT INTO sections (
    module_id, type, position, content, question_id, question, user_answer_id, 
    correct_answer_ids, url, animation, description
) VALUES
(1, 'text', 0, 'Bubble Sort is a simple comparison-based sorting algorithm.', 
 NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(1, 'image', 1, NULL, NULL, NULL, NULL, NULL, 'https://example.com/bubble_sort.png', NULL, 'Diagram of Bubble Sort algorithm.'),
(1, 'question', 2, NULL, 1, 'Explain how Bubble Sort works.', 1, ARRAY[1], NULL, NULL, NULL);

-- Sections for Quick Sort Module (Module ID 2)
INSERT INTO sections (
    module_id, type, position, content, question_id, question, user_answer_id, 
    correct_answer_ids, url, animation, description
) VALUES
(2, 'text', 0, 'Quick Sort is an efficient sorting algorithm, serving as a systematic method for placing the elements of an array in order.', 
 NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(2, 'code', 1, 'def quick_sort(arr):\n    if len(arr) <= 1:\n        return arr\n    pivot = arr[len(arr) // 2]\n    left = [x for x in arr if x < pivot]\n    middle = [x for x in arr if x == pivot]\n    right = [x for x in arr if x > pivot]\n    return quick_sort(left) + middle + quick_sort(right)', 
 NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(2, 'question', 2, NULL, 2, 'What is the average-case time complexity of Quick Sort?', 2, ARRAY[2], NULL, NULL, NULL);

-- Sections for Binary Search Module (Module ID 3)
INSERT INTO sections (
    module_id, type, position, content, question_id, question, user_answer_id, 
    correct_answer_ids, url, animation, description
) VALUES
(3, 'text', 0, 'Binary Search is a fast search algorithm that works on sorted arrays.', 
 NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(3, 'code', 1, 'def binary_search(arr, target):\n    left, right = 0, len(arr) - 1\n    while left <= right:\n        mid = (left + right) // 2\n        if arr[mid] == target:\n            return mid\n        elif arr[mid] < target:\n            left = mid + 1\n        else:\n            right = mid - 1\n    return -1', 
 NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(3, 'question', 2, NULL, 3, 'How does Binary Search differ from Linear Search?', 3, ARRAY[3], NULL, NULL, NULL);

-- Sections for Writing SQL Queries Module (Module ID 4)
INSERT INTO sections (
    module_id, type, position, content, question_id, question, user_answer_id, 
    correct_answer_ids, url, animation, description
) VALUES
(4, 'text', 0, 'Learn how to write SQL queries to retrieve data.', 
 NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(4, 'code', 1, 'SELECT * FROM users;', 
 NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(4, 'question', 2, NULL, 4, 'Write a SQL query to retrieve all users from the users table.', 4, ARRAY[4], NULL, NULL, NULL);

-- Sections for Understanding NoSQL Module (Module ID 5)
INSERT INTO sections (
    module_id, type, position, content, question_id, question, user_answer_id, 
    correct_answer_ids, url, animation, description
) VALUES
(5, 'text', 0, 'NoSQL databases are designed for distributed data stores and large-scale data needs.', 
     NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(5, 'video', 1, NULL, NULL, NULL, NULL, NULL, 'https://example.com/nosql_intro.mp4', NULL, 'Introduction to NoSQL databases.'),
(5, 'question', 2, NULL, 5, 'What are the key differences between SQL and NoSQL databases?', 5, ARRAY[13], NULL, NULL, NULL);