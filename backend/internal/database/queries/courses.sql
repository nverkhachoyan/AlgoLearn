-- name: GetCourseByID :one
SELECT
    id,
    created_at,
    updated_at,
    name,
    description,
    requirements,
    what_you_learn,
    background_color,
    icon_url,
    duration,
    difficulty_level,
    rating
FROM courses
WHERE
    id = @course_id::int;

-- name: GetCourseAuthors :many
SELECT a.id, a.name
FROM authors a
    JOIN course_authors ca ON ca.author_id = a.id
WHERE
    ca.course_id = @course_id::int;

-- name: GetCourseTags :many
SELECT t.id, t.name
FROM tags t
    JOIN course_tags ct ON ct.tag_id = t.id
WHERE
    ct.course_id = @course_id::int;

-- name: GetCourseUnits :many
SELECT
    id,
    created_at,
    updated_at,
    unit_number,
    course_id,
    name,
    description
FROM units
WHERE
    course_id = @course_id::int
ORDER BY unit_number;

-- name: GetUnitModules :many
SELECT
    id,
    created_at,
    updated_at,
    module_number,
    unit_id,
    name,
    description
FROM modules
WHERE
    unit_id = @unit_id::int
ORDER BY module_number;

-- name: GetModuleSections :many
SELECT
    id,
    created_at,
    updated_at,
    type,
    position,
    module_id
FROM sections
WHERE
    module_id = @module_id::int
ORDER BY position;

-- name: GetTextSection :one
SELECT text_content FROM text_sections WHERE section_id = @section_id::int;

-- name: GetVideoSection :one
SELECT url FROM video_sections WHERE section_id = @section_id::int;

-- name: GetQuestionSection :one
SELECT q.id, q.question, q.type
FROM
    question_sections qs
    JOIN questions q ON q.id = qs.question_id
WHERE
    qs.section_id = @section_id::int;

-- name: GetQuestionOptions :many
SELECT id, content, is_correct
FROM question_options
WHERE
    question_id = @question_id::int;

-- name: GetUserCourseProgress :one
SELECT
    current_unit_id,
    current_module_id
FROM user_courses
WHERE
    user_id = @user_id::int
    AND course_id = @course_id::int;

-- name: GetModuleProgress :one
SELECT progress, status
FROM user_module_progress
WHERE
    user_id = @user_id::int
    AND module_id = @module_id::int;

-- name: DeleteCourse :exec
DELETE FROM courses WHERE id = @course_id::int;

-- name: GetCourseProgressSummaryBase :one
SELECT
    c.id,
    c.created_at,
    c.updated_at,
    c.name,
    c.description,
    c.requirements,
    c.what_you_learn,
    c.background_color,
    c.icon_url,
    c.duration,
    c.difficulty_level,
    c.rating,
    u.id as current_unit_id,
    u.created_at as unit_created_at,
    u.updated_at as unit_updated_at,
    u.unit_number,
    u.name as unit_name,
    u.description as unit_description,
    m.id as current_module_id,
    m.created_at as module_created_at,
    m.updated_at as module_updated_at,
    m.module_number,
    m.unit_id as module_unit_id,
    m.name as module_name,
    m.description as module_description,
    ump.progress as module_progress,
    ump.status as module_status
FROM
    courses c
    JOIN user_courses uc ON uc.course_id = c.id
    AND uc.user_id = @user_id::int
    LEFT JOIN units u ON u.id = uc.current_unit_id
    LEFT JOIN modules m ON m.id = uc.current_module_id
    LEFT JOIN user_module_progress ump ON ump.module_id = m.id
    AND ump.user_id = @user_id::int
WHERE
    c.id = @course_id::int;

-- name: GetModuleProgressByUnit :many
SELECT m.id, m.created_at, m.updated_at, m.module_number, m.unit_id, m.name, m.description, ump.progress, ump.status
FROM
    modules m
    LEFT JOIN user_module_progress ump ON ump.module_id = m.id
    AND ump.user_id = @user_id::int
WHERE
    m.unit_id = @unit_id::int
ORDER BY m.module_number;

-- name: GetCoursesProgressSummary :many
SELECT
    c.id,
    c.created_at,
    c.updated_at,
    c.name,
    c.description,
    c.requirements,
    c.what_you_learn,
    c.background_color,
    c.icon_url,
    c.duration,
    c.difficulty_level,
    c.rating,
    u.id as current_unit_id,
    u.created_at as unit_created_at,
    u.updated_at as unit_updated_at,
    u.unit_number,
    u.name as unit_name,
    u.description as unit_description,
    m.id as current_module_id,
    m.created_at as module_created_at,
    m.updated_at as module_updated_at,
    m.module_number,
    m.unit_id as module_unit_id,
    m.name as module_name,
    m.description as module_description,
    ump.progress as module_progress,
    ump.status as module_status,
    COUNT(*) OVER() as total_count
FROM
    courses c
    LEFT JOIN user_courses uc ON uc.course_id = c.id AND uc.user_id = @user_id::int
    LEFT JOIN units u ON u.id = uc.current_unit_id
    LEFT JOIN modules m ON m.id = uc.current_module_id
    LEFT JOIN user_module_progress ump ON ump.module_id = m.id AND ump.user_id = @user_id::int
WHERE
    CASE
        WHEN @filter_type::text = 'learning' THEN 
            (uc.current_unit_id IS NOT NULL OR uc.current_module_id IS NOT NULL)
            AND uc.user_id = @user_id::int
        WHEN @filter_type::text = 'explore' THEN 
            (uc.current_unit_id IS NULL AND uc.current_module_id IS NULL)
            OR uc.user_id != @user_id::int
            OR uc.user_id IS NULL
        ELSE true
    END
GROUP BY
    c.id, c.created_at, c.updated_at, c.name, c.description,
    c.requirements, c.what_you_learn, c.background_color, c.icon_url,
    c.duration, c.difficulty_level, c.rating,
    u.id, u.created_at, u.updated_at, u.unit_number, u.name, u.description,
    m.id, m.created_at, m.updated_at, m.module_number, m.unit_id, m.name, m.description,
    ump.progress, ump.status, uc.updated_at
ORDER BY c.id, uc.updated_at DESC NULLS LAST
LIMIT @page_limit::int
OFFSET @page_offset::int;

-- name: GetModuleSectionsWithProgress :many
SELECT s.id, s.created_at, s.updated_at, s.type, s.position, s.module_id, usp.seen_at, usp.started_at, usp.completed_at, usp.has_seen
FROM
    sections s
    LEFT JOIN user_section_progress usp ON usp.section_id = s.id
    AND usp.user_id = @user_id::int
WHERE
    s.module_id = @module_id::int
ORDER BY s.position;

-- name: GetUserQuestionAnswer :one
SELECT uqa.option_id, uqa.answered_at, uqa.is_correct
FROM
    user_question_answers uqa
    JOIN user_module_progress ump ON ump.id = uqa.user_module_progress_id
WHERE
    ump.user_id = @user_id::int
    AND uqa.question_id = @question_id::int;

-- name: GetCourseProgressFullBase :one
SELECT
    c.id,
    c.created_at,
    c.updated_at,
    c.name,
    c.description,
    c.requirements,
    c.what_you_learn,
    c.background_color,
    c.icon_url,
    c.duration,
    c.difficulty_level,
    c.rating,
    u.id as current_unit_id,
    u.created_at as unit_created_at,
    u.updated_at as unit_updated_at,
    u.unit_number,
    u.name as unit_name,
    u.description as unit_description,
    m.id as current_module_id,
    m.created_at as module_created_at,
    m.updated_at as module_updated_at,
    m.module_number,
    m.unit_id as module_unit_id,
    m.name as module_name,
    m.description as module_description,
    ump.progress as module_progress,
    ump.status as module_status
FROM courses c
    JOIN user_courses uc ON uc.course_id = c.id AND uc.user_id = @user_id::int
    LEFT JOIN units u ON u.id = uc.current_unit_id
    LEFT JOIN modules m ON m.id = uc.current_module_id
    LEFT JOIN user_module_progress ump ON ump.module_id = m.id AND ump.user_id = @user_id::int
WHERE c.id = @course_id::int;

-- name: GetModuleProgressWithSections :many
SELECT 
    m.id, m.created_at, m.updated_at, m.module_number, m.unit_id, m.name, m.description,
    ump.progress, ump.status,
    s.id as section_id, s.created_at as section_created_at, s.updated_at as section_updated_at,
    s.type as section_type, s.position as section_position,
    usp.seen_at, usp.started_at, usp.completed_at, usp.has_seen
FROM modules m
    LEFT JOIN user_module_progress ump ON ump.module_id = m.id AND ump.user_id = @user_id::int
    LEFT JOIN sections s ON s.module_id = m.id
    LEFT JOIN user_section_progress usp ON usp.section_id = s.id AND usp.user_id = @user_id::int
WHERE m.unit_id = @unit_id::int
ORDER BY m.module_number, s.position;

-- name: GetSectionContent :one
SELECT 
    CASE s.type
        WHEN 'text' THEN (
            SELECT jsonb_build_object('text', text_content)
            FROM text_sections
            WHERE section_id = s.id
        )
        WHEN 'video' THEN (
            SELECT jsonb_build_object('url', url)
            FROM video_sections
            WHERE section_id = s.id
        )
        WHEN 'question' THEN (
            SELECT jsonb_build_object(
                'id', q.id,
                'question', q.question,
                'type', q.type,
                'options', (
                    SELECT jsonb_agg(jsonb_build_object(
                        'id', qo.id,
                        'content', qo.content,
                        'isCorrect', qo.is_correct
                    ))
                    FROM question_options qo
                    WHERE qo.question_id = q.id
                )
            )
            FROM question_sections qs
            JOIN questions q ON q.id = qs.question_id
            WHERE qs.section_id = s.id
        )
    END as content
FROM sections s
WHERE s.id = @section_id::int;