-- Insert a course
INSERT INTO courses (created_at, updated_at, name, description, background_color, icon_url, duration, difficulty_level, author, tags, rating, learners_count, last_updated)
VALUES
(NOW(), NOW(), 'Introduction to JavaScript', 'Learn the basics of JavaScript, the language of the web.', '#F0DB4F', 'https://example.com/icon.png', '3 hours', 'Beginner', 'Jane Doe', ARRAY['JavaScript', 'Programming', 'Web Development'], 4.5, 1000, NOW())
RETURNING id;

-- Insert a unit
INSERT INTO units (created_at, updated_at, course_id, name, description)
VALUES
(NOW(), NOW(), 1, 'JavaScript Basics', 'This unit covers the fundamental concepts of JavaScript, including syntax, variables, and functions.')
RETURNING id;

-- Insert a module
INSERT INTO modules (created_at, updated_at, unit_id, course_id, name, description, content)
VALUES
(NOW(), NOW(), 1, 1, 'Getting Started with JavaScript', 'This module introduces you to JavaScript and helps you set up your environment.', '{"sections": []}')
RETURNING id;

-- Insert Question into module_questions
INSERT INTO module_questions (created_at, updated_at, module_id, content)
VALUES
(NOW(), NOW(), 1, 'Which keyword is used to declare a constant variable in JavaScript?')
RETURNING id;

-- Insert Options into module_question_options
INSERT INTO module_question_options (created_at, updated_at, question_id, content, is_correct)
VALUES
(NOW(), NOW(), 1, 'var', FALSE),
(NOW(), NOW(), 1, 'let', FALSE),
(NOW(), NOW(), 1, 'const', TRUE);  -- This is the correct option


-- Insert Sections into the sections table
INSERT INTO sections (created_at, updated_at, module_id, type, position, content, url, question_id, correct_answer_ids)
VALUES
-- Text Section: Introduction to JavaScript
(NOW(), NOW(), 1, 'text', 1, '## Welcome to JavaScript: The Language of the Web\n\nJavaScript is a versatile and powerful programming language that brings interactivity and dynamism to web pages. Let''s embark on an exciting journey to learn the fundamentals of JavaScript! [Get started](https://static.vecteezy.com/system/resources/thumbnails/027/254/720/small/colorful-ink-splash-on-transparent-background-png.png)', NULL, NULL, NULL),

-- Text Section: JavaScript Logo
(NOW(), NOW(), 1, 'text', 2, '![JavaScript Logo](https://static.vecteezy.com/system/resources/thumbnails/027/254/720/small/colorful-ink-splash-on-transparent-background-png.png)', NULL, NULL, NULL),

-- Text Section: Key Concepts in JavaScript
(NOW(), NOW(), 1, 'text', 4, '### Key Concepts in JavaScript\n\n\n1. **Variables**: Store and manipulate data\n2. **Functions**: Reusable blocks of code\n3. **Control Flow**: Make decisions and repeat actions\n4. **Objects**: Organize and structure your code\n\nLet''s start with variables!', NULL, NULL, NULL),

-- Question Section
(NOW(), NOW(), 1, 'question', 5, NULL, NULL, 1, ARRAY[3]),  -- Correct answer is answer_id 3 ("const")

-- Video Section: Introduction Video
(NOW(), NOW(), 1, 'video', 6, NULL, 'https://www.youtube.com/watch?v=dQw4w9WgXcQ', NULL, NULL),

-- Code Section: JavaScript Example
(NOW(), NOW(), 1, 'code', 7, '\n// Declaring variables\nlet age = 25;\nconst PI = 3.14159;\n// Using variables\nconsole.log(`I am ${age} years old`);\nconsole.log(`The value of PI is ${PI}`);\nfunction hello(){const help = "true"}', NULL, NULL, NULL),

-- Text Section: Pro Tip
(NOW(), NOW(), 1, 'text', 8, '**Pro Tip:** Use `const` for values that won''t change, and `let` for variables that might be reassigned. Avoid using `var` in modern JavaScript.', NULL, NULL, NULL),

-- Text Section: JavaScript in Action
(NOW(), NOW(), 1, 'text', 9, '![JavaScript in action](https://octodex.github.com/images/minion.png)', NULL, NULL, NULL),

-- Text Section: Conclusion
(NOW(), NOW(), 1, 'text', 10, 'Now that you''ve learned about variables, you''re ready to start your JavaScript journey! In the next section, we''ll explore functions and how they can make your code more efficient and organized.', NULL, NULL, NULL);
