-- Insert mock data into users table
INSERT INTO users (username, email, password_hash, first_name, last_name, bio, location, cpus) VALUES
('john_doe', 'john.doe@example.com', 'hashed_password_1', 'John', 'Doe', 'Loves coding and teaching.', 'New York, USA', 100),
('jane_smith', 'jane.smith@example.com', 'hashed_password_2', 'Jane', 'Smith', 'Passionate about AI and ML.', 'San Francisco, USA', 150);

-- Insert mock data into courses table
INSERT INTO courses (name, description, background_color, icon_url, duration, difficulty_level, author, tags, rating, learners_count) VALUES
('Introduction to Programming', 'Learn the basics of programming using Python.', '#FF5733', 'https://example.com/icons/python.png', '10 hours', 'Beginner', 'John Doe', ARRAY['Programming', 'Python', 'Basics'], 4.5, 200),
('Advanced Machine Learning', 'Dive deep into advanced machine learning concepts.', '#33FF57', 'https://example.com/icons/ml.png', '20 hours', 'Advanced', 'Jane Smith', ARRAY['Machine Learning', 'Advanced', 'AI'], 4.8, 120);

-- Insert mock data into units table
INSERT INTO units (course_id, name, description) VALUES
(1, 'Getting Started with Python', 'Introduction to Python programming language.'),
(1, 'Control Structures', 'Learn about if-else, loops, and more in Python.'),
(2, 'Supervised Learning', 'Explore supervised learning algorithms and techniques.'),
(2, 'Unsupervised Learning', 'Learn about unsupervised learning methods.');

-- Insert mock data into modules table
INSERT INTO modules (unit_id, name, description, content) VALUES
(1, 'Python Basics', 'Learn the basics of Python programming.', '{"content": "This module covers variables, data types, and basic syntax."}'),
(2, 'Loops in Python', 'Understand how loops work in Python.', '{"content": "This module covers for loops, while loops, and loop control statements."}'),
(3, 'Regression Analysis', 'Learn about regression analysis in supervised learning.', '{"content": "This module covers linear regression, logistic regression, and more."}'),
(4, 'Clustering Algorithms', 'Explore different clustering algorithms.', '{"content": "This module covers k-means, hierarchical clustering, and more."}');

-- Insert mock data into module_questions table
INSERT INTO module_questions (module_id, content) VALUES
(1, 'What is a variable in Python?'),
(2, 'How do you write a for loop in Python?'),
(3, 'What is linear regression?'),
(4, 'What is the k-means algorithm?');

-- Insert mock data into module_question_answers table
INSERT INTO module_question_answers (question_id, content, is_correct) VALUES
(1, 'A variable is a storage location paired with an associated symbolic name.', TRUE),
(2, 'for i in range(10):', TRUE),
(3, 'Linear regression is a linear approach to modeling the relationship between a dependent variable and one or more independent variables.', TRUE),
(4, 'The k-means algorithm is a method of vector quantization, originally from signal processing, that is popular for cluster analysis in data mining.', TRUE);

-- Insert mock data into streaks table
INSERT INTO streaks (user_id, start_date, current_streak, longest_streak) VALUES
(1, CURRENT_TIMESTAMP - INTERVAL '5 days', 5, 5),
(2, CURRENT_TIMESTAMP - INTERVAL '3 days', 3, 3);

-- Insert mock data into achievements table
INSERT INTO achievements (name, description, points) VALUES
('First Login', 'Logged in for the first time.', 10),
('Complete First Module', 'Completed the first module.', 20);

-- Insert mock data into user_achievements table
INSERT INTO user_achievements (user_id, achievement_id) VALUES
(1, 1),
(1, 2),
(2, 1);

-- Insert mock data into notifications table
INSERT INTO notifications (user_id, content) VALUES
(1, 'Welcome to the platform, John! Start learning now.'),
(2, 'Welcome to the platform, Jane! Start exploring new courses.');
