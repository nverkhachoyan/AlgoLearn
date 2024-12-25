-- name: CreateCourse :one
INSERT INTO courses (
    name,
    description,
    requirements,
    what_you_learn,
    background_color,
    icon_url,
    duration,
    difficulty_level,
    rating
)
VALUES (
    @name::text,
    @description::text,
    @requirements::text,
    @what_you_learn::text,
    @background_color::text,
    @icon_url::text,
    @duration::int,
    @difficulty_level::difficulty_level,
    @rating::float
)
RETURNING id;

-- name: UpdateCourse :exec
UPDATE courses
SET
    name = COALESCE(@name::text, name),
    description = COALESCE(@description::text, description),
    requirements = COALESCE(@requirements::text, requirements),
    what_you_learn = COALESCE(@what_you_learn::text, what_you_learn),
    background_color = COALESCE(@background_color::text, background_color),
    icon_url = COALESCE(@icon_url::text, icon_url),
    duration = COALESCE(@duration::int, duration),
    difficulty_level = @difficulty_level::difficulty_level,
    rating = @rating::float
WHERE id = @course_id::int;

-- name: PublishCourse :exec
UPDATE courses
SET draft = FALSE
WHERE id = @course_id::int;

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

-- name: GetTextSection :one
SELECT text_content
FROM text_sections
WHERE section_id = @section_id::int;

-- name: GetVideoSection :one
SELECT 
    url as url
FROM video_sections
WHERE section_id = @section_id::int;

-- name: GetMarkdownSection :one
SELECT markdown
FROM markdown_sections
WHERE section_id = @section_id::int;

-- name: GetQuestionSection :one
SELECT 
    q.id,
    q.question,
    q.type,
    COALESCE(
        json_agg(
            json_build_object(
                'id', qo.id,
                'content', qo.content,
                'is_correct', qo.is_correct
            ) ORDER BY qo.id
        ),
        '[]'::json
    ) as question_options
FROM question_sections qs
JOIN questions q ON q.id = qs.question_id
LEFT JOIN question_options qo ON qo.question_id = q.id
WHERE qs.section_id = @section_id::int
GROUP BY q.id, q.question, q.type;

-- name: DeleteCourse :exec
DELETE FROM courses WHERE id = @course_id::int;

-- name: GetCourseProgressSummaryBase :one
WITH current_unit_id AS (
    SELECT COALESCE(u.id, 0) as id
    FROM units u
    WHERE u.course_id = @course_id::int
    ORDER BY u.updated_at DESC    
    LIMIT 1
),
current_module_id AS (
    SELECT COALESCE(m.id, 0) as id
    FROM modules m
    WHERE m.unit_id = (SELECT id FROM current_unit_id)
    ORDER BY m.updated_at DESC
    LIMIT 1
)
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
    c.difficulty_level,
    c.duration,
    c.rating,
    (SELECT id FROM current_unit_id),
    u.created_at as unit_created_at,
    u.updated_at as unit_updated_at,
    u.unit_number,
    u.name as unit_name,
    u.description as unit_description,
    (SELECT id FROM current_module_id),
    m.created_at as module_created_at,
    m.updated_at as module_updated_at,
    m.module_number,
    m.name as module_name,
    m.description as module_description,
    ump.progress as module_progress,
    ump.status as module_status
FROM
    courses c
    LEFT JOIN user_courses uc ON uc.course_id = c.id
    AND uc.user_id = @user_id::int
    LEFT JOIN units u ON u.id = (SELECT id FROM current_unit_id)
    LEFT JOIN modules m ON m.id = (SELECT id FROM current_module_id)
    LEFT JOIN user_module_progress ump ON ump.module_id = (SELECT id FROM current_module_id)
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

-- name: GetAllCoursesWithOptionalProgress :many
WITH user_progress AS (
    SELECT
        uc.course_id,
        u.id as unit_id,
        u.created_at as unit_created_at,
        u.updated_at as unit_updated_at,
        u.unit_number,
        u.name as unit_name,
        u.description as unit_description,
        m.id as module_id,
        ump.created_at as module_created_at,
        ump.updated_at as module_updated_at,
        m.module_number,
        m.name as module_name,
        m.description as module_description,
        ump.progress as module_progress,
        ump.status as module_status
    FROM user_courses uc
             JOIN units u ON u.course_id = uc.course_id
             JOIN modules m ON m.unit_id = u.id
             LEFT JOIN user_module_progress ump ON ump.module_id = m.id
        AND ump.user_id = @user_id::int
    WHERE uc.user_id = @user_id::int
    ORDER BY ump.updated_at DESC NULLS LAST
)
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
    up.unit_id as current_unit_id,
    up.unit_created_at,
    up.unit_updated_at,
    up.unit_number,
    up.unit_name,
    up.unit_description,
    up.module_id as current_module_id,
    up.module_created_at,
    up.module_updated_at,
    up.module_number,
    up.module_id as module_unit_id,
    up.module_name,
    up.module_description,
    COALESCE(up.module_progress, 0) as module_progress,
    COALESCE(up.module_status, 'uninitiated') as module_status,
   (SELECT COUNT(*) FROM courses) as total_count
FROM (
    SELECT id
    FROM courses
    ORDER BY id
    LIMIT @page_limit::int
    OFFSET @page_offset::int
) paginated_courses
JOIN courses c ON c.id = paginated_courses.id
         LEFT JOIN user_progress up ON up.course_id = c.id
ORDER BY
    CASE WHEN up.course_id IS NOT NULL THEN 0 ELSE 1 END,
    up.module_updated_at DESC NULLS LAST;

-- name: GetEnrolledCoursesWithProgress :many
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
    COALESCE(m.unit_id, 0) as current_unit_id,
    COALESCE(u.created_at, NOW()) as unit_created_at,
    COALESCE(u.updated_at, NOW()) as unit_updated_at,
    COALESCE(u.unit_number, 0) as unit_number,
    COALESCE(u.name, '') as unit_name,
    COALESCE(u.description, '') as unit_description,
    COALESCE(ump.module_id, 0) as current_module_id,
    COALESCE(m.created_at, NOW()) as module_created_at,
    COALESCE(m.updated_at, NOW()) as module_updated_at,
    COALESCE(m.module_number, 0) as module_number,
    COALESCE(u.id, 0) as module_unit_id,
    COALESCE(m.name, '') as module_name,
    COALESCE(m.description, '') as module_description,
    COALESCE(ump.progress, 0) as module_progress,
    COALESCE(ump.status, 'uninitiated') as module_status,
    uc.progress as course_progress,
    (SELECT COUNT(*) FROM courses) as total_count
FROM modules m
    LEFT JOIN user_module_progress ump ON ump.module_id = m.id
    LEFT JOIN units u ON u.id = m.unit_id
    LEFT JOIN courses c ON c.id = u.course_id
    JOIN user_courses uc ON uc.course_id = c.id AND uc.user_id = @user_id::int
ORDER BY ump.updated_at DESC NULLS LAST
LIMIT @page_limit::int
OFFSET @page_offset::int;

-- name: GetModuleSectionsWithProgress :many
SELECT 
    s.id, 
    s.created_at, 
    s.updated_at, 
    s.type, 
    s.position, 
    s.module_id, 
    usp.seen_at, 
    usp.started_at, 
    usp.completed_at, 
    usp.has_seen
FROM
    sections s
    LEFT JOIN user_section_progress usp ON usp.section_id = s.id
    AND usp.user_id = @user_id::int
WHERE
    s.module_id = @module_id::int
ORDER BY s.position;

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

-- name: StartCourseUserCourses :exec
INSERT INTO user_courses 
    (user_id, course_id)
VALUES 
    (@user_id::int, @course_id::int)
ON CONFLICT (user_id, course_id) DO NOTHING;

-- name: GetFirstUnitAndModuleInCourse :one
SELECT 
    u.id as unit_id,
    m.id as module_id
FROM units u
JOIN modules m ON m.unit_id = u.id
WHERE u.course_id = @course_id::int
ORDER BY u.unit_number ASC, m.module_number ASC
LIMIT 1;

-- name: InitializeModuleProgress :exec
INSERT INTO user_module_progress
    (user_id, module_id, progress, status)
VALUES 
    (@user_id::int, @module_id::int, 0, 'uninitiated'::module_progress_status)
ON CONFLICT (user_id, module_id) DO NOTHING;

-- name: SearchCourses :many
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
    COUNT(*) OVER() as total_count
FROM courses c
WHERE 
    (LOWER(c.name) LIKE LOWER(@search_query::text) OR
     LOWER(c.description) LIKE LOWER(@search_query::text) OR
     EXISTS (
        SELECT 1 FROM course_tags ct
        JOIN tags t ON t.id = ct.tag_id
        WHERE ct.course_id = c.id AND LOWER(t.name) LIKE LOWER(@search_query::text)
    ))
ORDER BY 
    CASE 
        WHEN LOWER(c.name) LIKE LOWER(@search_query::text) THEN 1
        WHEN LOWER(c.description) LIKE LOWER(@search_query::text) THEN 2
        ELSE 3
    END,
    c.created_at DESC
LIMIT @page_limit::int
OFFSET @page_offset::int;

-- name: SearchCoursesFullText :many
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
    COUNT(*) OVER() as total_count,
    ts_rank(
        setweight(to_tsvector('english', c.name), 'A') ||
        setweight(to_tsvector('english', COALESCE(c.description, '')), 'B') ||
        setweight(to_tsvector('english', COALESCE(c.requirements, '')), 'C') ||
        setweight(to_tsvector('english', COALESCE(c.what_you_learn, '')), 'C'),
        plainto_tsquery('english', @search_query::text)
    ) as rank
FROM courses c
WHERE 
    to_tsvector('english', c.name) ||
    to_tsvector('english', COALESCE(c.description, '')) ||
    to_tsvector('english', COALESCE(c.requirements, '')) ||
    to_tsvector('english', COALESCE(c.what_you_learn, '')) @@
    plainto_tsquery('english', @search_query::text)
ORDER BY rank DESC, c.created_at DESC
LIMIT @page_limit::int
OFFSET @page_offset::int;

-- name: DeleteSectionProgress :exec
WITH
    course_modules AS (
        SELECT m.id as module_id
        FROM modules m
            JOIN units u ON u.id = m.unit_id
        WHERE
            u.course_id = @course_id::int
    )
DELETE FROM user_section_progress
WHERE
    section_id IN (
        SELECT s.id
        FROM sections s
        WHERE
            s.module_id IN (
                SELECT module_id
                FROM course_modules
            )
    )
    AND (
        @user_id::int = 0
        OR user_id = @user_id::int
    );

-- name: DeleteModuleProgress :exec
WITH
    course_modules AS (
        SELECT m.id as module_id
        FROM modules m
            JOIN units u ON u.id = m.unit_id
        WHERE
            u.course_id = @course_id::int
    )
DELETE FROM user_module_progress
WHERE
    module_id IN (
        SELECT module_id
        FROM course_modules
    )
    AND (
        @user_id::int = 0
        OR user_id = @user_id::int
    );

-- name: DeleteUserCourse :exec
DELETE FROM user_courses
WHERE user_id = @user_id::int
AND course_id = @course_id::int;

-- name: GetCurrentUnitAndModule :one
WITH latest_module_progress AS (
    SELECT 
        ump.module_id,
        ump.updated_at
    FROM user_module_progress ump
    JOIN modules m ON m.id = ump.module_id
    JOIN units u ON u.id = m.unit_id
    WHERE ump.user_id = $1 
    AND u.course_id = $2
    ORDER BY ump.updated_at DESC NULLS LAST
    LIMIT 1
)
SELECT
    u.id as unit_id,
    u.created_at as unit_created_at,
    u.updated_at as unit_updated_at,
    u.name as unit_name,
    u.description as unit_description,
    u.unit_number as unit_number,
    m.id as module_id,
    m.created_at as module_created_at,
    m.updated_at as module_updated_at,
    m.name as module_name,
    m.description as module_description,
    m.module_number as module_number,
    COALESCE(ump.progress, 0) as module_progress,
    COALESCE(ump.status, 'uninitiated'::module_progress_status) as module_status
FROM latest_module_progress lmp
JOIN modules m ON m.id = lmp.module_id
JOIN units u ON u.id = m.unit_id
LEFT JOIN user_module_progress ump ON ump.module_id = m.id AND ump.user_id = $1;