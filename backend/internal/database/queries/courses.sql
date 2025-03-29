-- name: CreateCourse :one
INSERT INTO courses (
    name,
    description,
    requirements,
    what_you_learn,
    background_color,
    duration,
    difficulty_level,
    rating,
    folder_object_key,
    img_key,
    media_ext
)
VALUES (
    COALESCE(@name::text, ''),
    COALESCE(@description::text, ''),
    COALESCE(@requirements::text, ''),
    COALESCE(@what_you_learn::text, ''),
    COALESCE(@background_color::text, ''),
    COALESCE(@duration::int, 0),
    COALESCE(@difficulty_level::difficulty_level, 'beginner'),
    COALESCE(@rating::float, 0.0),
    COALESCE(@folder_object_key::UUID, NULL),
    COALESCE(@img_key::UUID, NULL),
    COALESCE(@media_ext::text, '')
)
RETURNING id;

-- name: InsertCourseAuthor :exec
INSERT INTO course_authors (course_id, user_id)
VALUES (@course_id::int, @user_id::int);

-- name: GetCoursesCount :one
SELECT COUNT(*) FROM courses;

-- name: UpdateCourse :exec
UPDATE courses
SET
    name = CASE 
        WHEN @name::text = '' THEN name 
        ELSE @name::text 
    END,
    description = CASE 
        WHEN @description::text = '' THEN description 
        ELSE @description::text 
    END,
    folder_object_key = CASE 
        WHEN @folder_object_key::UUID IS NULL THEN folder_object_key 
        ELSE @folder_object_key::UUID 
    END,
    media_ext = CASE 
        WHEN @media_ext::text = '' THEN media_ext 
        ELSE @media_ext::text 
    END,
    requirements = CASE 
        WHEN @requirements::text = '' THEN requirements 
        ELSE @requirements::text 
    END,
    what_you_learn = CASE 
        WHEN @what_you_learn::text = '' THEN what_you_learn 
        ELSE @what_you_learn::text 
    END,
    background_color = CASE 
        WHEN @background_color::text = '' THEN background_color 
        ELSE @background_color::text 
    END,
    img_key = CASE 
        WHEN @img_key::UUID IS NULL THEN img_key 
        ELSE @img_key::UUID 
    END,
    duration = CASE 
        WHEN @duration::int = 0 THEN duration 
        ELSE @duration::int 
    END,
    difficulty_level = CASE 
        WHEN @difficulty_level::text = '' THEN difficulty_level 
        ELSE @difficulty_level::difficulty_level 
    END,
    rating = CASE 
        WHEN @rating::float < 0 THEN rating 
        ELSE @rating::float 
    END
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
    folder_object_key,
    img_key,
    media_ext,
    name,
    description,
    requirements,
    what_you_learn,
    background_color,
    duration,
    difficulty_level,
    rating
FROM courses
WHERE
    id = @course_id::int;

-- name: GetCourseAuthors :many
SELECT u.id, u.first_name, u.last_name
FROM users u
    JOIN course_authors ca ON ca.user_id = u.id
WHERE
    ca.course_id = @course_id::int;

-- name: GetCourseTags :many
SELECT t.id, t.name
FROM tags t
    JOIN course_tags ct ON ct.tag_id = t.id
WHERE
    ct.course_id = @course_id::int;

-- name: SearchCourseTags :many
SELECT t.id, t.name, COUNT(*) OVER() as total_count
FROM tags t
    JOIN course_tags ct ON ct.tag_id = t.id
WHERE
    t.name ILIKE '%' || @search_query::text || '%'
ORDER BY t.name ASC
LIMIT @page_limit::int
OFFSET @page_offset::int;

-- name: CreateCourseTag :one
INSERT INTO tags (name)
VALUES (@name::text)
ON CONFLICT (name) DO UPDATE SET name = EXCLUDED.name
RETURNING id;

-- name: InsertCourseTag :exec
INSERT INTO course_tags (course_id, tag_id)
VALUES (@course_id::int, @tag_id::int);

-- name: RemoveCourseTag :exec
DELETE FROM course_tags
WHERE course_id = @course_id::int
AND tag_id = @tag_id::int;

-- name: GetCourseUnits :many
SELECT
    id,
    folder_object_key,
    img_key,
    media_ext,
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
    folder_object_key,
    img_key,
    media_ext,
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

-- name: GetVideoSection :one
SELECT 
    url as url,
    object_key as object_key,
    media_ext as media_ext
FROM video_sections
WHERE section_id = @section_id::int;

-- name: GetMarkdownSection :one
SELECT 
    markdown as markdown,
    object_key as object_key,
    media_ext as media_ext
FROM markdown_sections
WHERE section_id = @section_id::int;

-- name: GetImageSection :one
SELECT 
    url,
    headline,
    caption,
    alt_text,
    width,
    height,
    object_key,
    media_ext
FROM image_sections
WHERE section_id = @section_id::int;

--  object_key UUID,
--     width INTEGER DEFAULT 200,
--     height INTEGER DEFAULT 200,
--     media_ext VARCHAR(10),
--     url TEXT,
--     headline TEXT NOT NULL,
--     caption TEXT NOT NULL,

-- name: GetQuestionSection :one
SELECT 
    q.id,
    q.question,
    q.type,
    object_key as object_key,
    media_ext as media_ext,
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

-- name: GetCodeSection :one
SELECT 
    code,
    language,
    object_key as object_key,
    media_ext as media_ext
FROM code_sections
WHERE section_id = @section_id::int;

-- name: DeleteCourse :exec
DELETE FROM courses WHERE id = @course_id::int;

-- name: GetCourseProgressSummaryBase :one
WITH current_unit_id AS (
    SELECT u.id
    FROM units u
    WHERE u.course_id = @course_id::int
    ORDER BY u.updated_at DESC
    LIMIT 1
),
current_module_id AS (
    SELECT m.id
    FROM modules m
    WHERE m.unit_id = (SELECT id FROM current_unit_id)
    ORDER BY m.updated_at DESC
    LIMIT 1
)
SELECT
    c.id,
    c.folder_object_key,
    c.created_at,
    c.updated_at,
    c.name,
    c.description,
    c.requirements,
    c.what_you_learn,
    c.background_color,
    c.img_key,
    c.media_ext,
    c.difficulty_level,
    c.duration,
    c.rating,
    u.id as unit_id,
    u.folder_object_key as unit_folder_object_key,
    u.img_key as unit_img_key,
    u.media_ext as unit_media_ext,
    u.created_at as unit_created_at,
    u.updated_at as unit_updated_at,
    u.unit_number,
    u.name as unit_name,
    u.description as unit_description,
    m.id as module_id,
    m.folder_object_key as module_folder_object_key,
    m.img_key as module_img_key,
    m.media_ext as module_media_ext,
    m.created_at as module_created_at,
    m.updated_at as module_updated_at,
    m.module_number,
    m.name as module_name,
    m.description as module_description,
    ump.progress as module_progress,
    ump.status as module_status
FROM courses c
         LEFT JOIN current_unit_id cui ON 1=1
         LEFT JOIN current_module_id cmi ON 1=1
         LEFT JOIN units u ON u.id = cui.id
         LEFT JOIN modules m ON m.id = cmi.id
         LEFT JOIN user_courses uc ON uc.course_id = c.id AND uc.user_id = @user_id::int
         LEFT JOIN user_module_progress ump ON ump.module_id = cmi.id AND ump.user_id = @user_id::int
WHERE c.id = @course_id::int;

-- name: GetModuleProgressByUnit :many
SELECT m.id, m.created_at, m.updated_at, m.module_number, m.unit_id, m.name, m.description, m.folder_object_key, m.img_key, m.media_ext, ump.progress, ump.status
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
        u.folder_object_key as unit_folder_object_key,
        u.img_key as unit_img_key,
        u.media_ext as unit_media_ext,
        m.id as module_id,
        ump.created_at as module_created_at,
        ump.updated_at as module_updated_at,
        m.module_number,
        m.name as module_name,
        m.description as module_description,
        m.folder_object_key as module_folder_object_key,
        m.img_key as module_img_key,
        m.media_ext as module_media_ext,
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
    c.folder_object_key,
    c.img_key,
    c.media_ext,
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
    CASE WHEN sqlc.narg(sort_column)::text = 'id' AND LOWER(sqlc.narg(sort_direction)::text) = 'desc' THEN c.id END DESC,
    CASE WHEN sqlc.narg(sort_column)::text = 'id' AND LOWER(sqlc.narg(sort_direction)::text) = 'asc' THEN c.id END ASC,
    CASE WHEN sqlc.narg(sort_column)::text = 'created_at' AND LOWER(sqlc.narg(sort_direction)::text) = 'desc' THEN c.created_at END DESC,
    CASE WHEN sqlc.narg(sort_column)::text = 'created_at' AND LOWER(sqlc.narg(sort_direction)::text) = 'asc' THEN c.created_at END ASC,
    CASE WHEN sqlc.narg(sort_column)::text = 'updated_at' AND LOWER(sqlc.narg(sort_direction)::text) = 'desc' THEN c.updated_at END DESC,
    CASE WHEN sqlc.narg(sort_column)::text = 'updated_at' AND LOWER(sqlc.narg(sort_direction)::text) = 'asc' THEN c.updated_at END ASC,
    CASE WHEN sqlc.narg(sort_column)::text = 'name' AND LOWER(sqlc.narg(sort_direction)::text) = 'desc' THEN c.name END DESC,
    CASE WHEN sqlc.narg(sort_column)::text = 'name' AND LOWER(sqlc.narg(sort_direction)::text) = 'asc' THEN c.name END ASC,
    CASE WHEN sqlc.narg(sort_column)::text = 'description' AND LOWER(sqlc.narg(sort_direction)::text) = 'desc' THEN c.description END DESC,
    CASE WHEN sqlc.narg(sort_column)::text = 'description' AND LOWER(sqlc.narg(sort_direction)::text) = 'asc' THEN c.description END ASC,
    CASE WHEN sqlc.narg(sort_column)::text = 'rating' AND LOWER(sqlc.narg(sort_direction)::text) = 'desc' THEN c.rating END DESC,
    CASE WHEN sqlc.narg(sort_column)::text = 'rating' AND LOWER(sqlc.narg(sort_direction)::text) = 'asc' THEN c.rating END ASC,
    CASE WHEN sqlc.narg(sort_column)::text = 'duration' AND LOWER(sqlc.narg(sort_direction)::text) = 'desc' THEN c.duration END DESC,
    CASE WHEN sqlc.narg(sort_column)::text = 'duration' AND LOWER(sqlc.narg(sort_direction)::text) = 'asc' THEN c.duration END ASC,
    CASE WHEN sqlc.narg(sort_column)::text = 'difficulty_level' AND LOWER(sqlc.narg(sort_direction)::text) = 'desc' THEN c.difficulty_level END DESC,
    CASE WHEN sqlc.narg(sort_column)::text = 'difficulty_level' AND LOWER(sqlc.narg(sort_direction)::text) = 'asc' THEN c.difficulty_level END ASC,
    CASE WHEN sqlc.narg(sort_column)::text = 'draft' AND LOWER(sqlc.narg(sort_direction)::text) = 'desc' THEN c.draft END DESC,
    CASE WHEN sqlc.narg(sort_column)::text = 'draft' AND LOWER(sqlc.narg(sort_direction)::text) = 'asc' THEN c.draft END ASC,
    CASE WHEN sqlc.narg(sort_column)::text = 'user_progress' AND LOWER(sqlc.narg(sort_direction)::text) = 'desc' THEN up.course_id END DESC,
    CASE WHEN sqlc.narg(sort_column)::text = 'user_progress' AND LOWER(sqlc.narg(sort_direction)::text) = 'asc' THEN up.course_id END ASC,
    CASE WHEN up.module_updated_at IS NOT NULL THEN up.module_updated_at ELSE c.created_at END DESC NULLS LAST;

-- name: GetEnrolledCoursesWithProgress :many
WITH enrolled_count AS (
    SELECT COUNT(*) as total
    FROM courses c
    JOIN user_courses uc ON uc.course_id = c.id AND uc.user_id = @user_id::int
),
latest_progress AS (
    SELECT
        u.course_id,
        u.id as unit_id,
        u.created_at as unit_created_at,
        u.updated_at as unit_updated_at,
        u.unit_number,
        u.name as unit_name,
        u.description as unit_description,
        u.folder_object_key as unit_folder_object_key,
        u.img_key as unit_img_key,
        u.media_ext as unit_media_ext,
        m.id as module_id,
        m.created_at as module_created_at,
        m.updated_at as module_updated_at,
        m.module_number,
        m.name as module_name,
        m.description as module_description,
        m.folder_object_key as module_folder_object_key,
        m.img_key as module_img_key,
        m.media_ext as module_media_ext,
        ump.progress as module_progress,
        ump.status as module_status
    FROM units u
    JOIN modules m ON m.unit_id = u.id
    JOIN user_module_progress ump ON ump.module_id = m.id
        AND ump.user_id = @user_id::int
        AND (ump.status = 'uninitiated' OR ump.status = 'in_progress')
    ORDER BY ump.updated_at DESC NULLS LAST
),
enrolled_courses AS (
    SELECT 
        c.*,
        uc.progress as course_progress,
        (SELECT total FROM enrolled_count) as total_count,
        lp.unit_id,
        lp.unit_created_at,
        lp.unit_updated_at,
        lp.unit_number,
        lp.unit_name,
        lp.unit_description,
        lp.unit_folder_object_key,
        lp.unit_img_key,
        lp.unit_media_ext,
        lp.module_id,
        lp.module_created_at,
        lp.module_updated_at,
        lp.module_number,
        lp.module_name,
        lp.module_description,
        lp.module_folder_object_key,
        lp.module_img_key,
        lp.module_media_ext,
        lp.module_progress,
        lp.module_status
    FROM courses c
    JOIN user_courses uc ON uc.course_id = c.id 
        AND uc.user_id = @user_id::int
    LEFT JOIN latest_progress lp ON lp.course_id = c.id
    ORDER BY c.created_at DESC
    LIMIT @page_limit::int
    OFFSET @page_offset::int
)
SELECT
    c.id,
    c.folder_object_key,
    c.created_at,
    c.updated_at,
    c.name,
    c.description,
    c.requirements,
    c.what_you_learn,
    c.background_color,
    c.img_key,
    c.media_ext,
    c.duration,
    c.difficulty_level,
    c.rating,
    COALESCE(c.unit_id, 0) as current_unit_id,
    COALESCE(c.unit_created_at, NOW()) as unit_created_at,
    COALESCE(c.unit_updated_at, NOW()) as unit_updated_at,
    COALESCE(c.unit_number, 0) as unit_number,
    COALESCE(c.unit_name, '') as unit_name,
    COALESCE(c.unit_description, '') as unit_description,
    COALESCE(c.unit_folder_object_key, '00000000-0000-0000-0000-000000000000') as unit_folder_object_key,
    COALESCE(c.unit_img_key, '00000000-0000-0000-0000-000000000000') as unit_img_key,
    COALESCE(c.unit_media_ext, '') as unit_media_ext,
    COALESCE(c.module_id, 0) as current_module_id,
    COALESCE(c.module_created_at, NOW()) as module_created_at,
    COALESCE(c.module_updated_at, NOW()) as module_updated_at,
    COALESCE(c.module_number, 0) as module_number,
    COALESCE(c.unit_id, 0) as module_unit_id,
    COALESCE(c.module_name, '') as module_name,
    COALESCE(c.module_description, '') as module_description,
    COALESCE(c.module_progress, 0) as module_progress,
    COALESCE(c.module_status, 'uninitiated') as module_status,
    COALESCE(c.module_folder_object_key, '00000000-0000-0000-0000-000000000000') as module_folder_object_key,
    COALESCE(c.module_img_key, '00000000-0000-0000-0000-000000000000') as module_img_key,
    COALESCE(c.module_media_ext, '') as module_media_ext,
    c.course_progress,
    c.total_count
FROM enrolled_courses c;

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
        WHEN 'markdown' THEN (
            SELECT jsonb_build_object(
                'markdown', markdown, 
                'objectKey', object_key, 
                'mediaExt', media_ext
            )
            FROM markdown_sections
            WHERE section_id = s.id
        )
        WHEN 'video' THEN (
            SELECT jsonb_build_object(
                'url', url, 'objectKey', 
                object_key, 'mediaExt', 
                media_ext
            )
            FROM video_sections
            WHERE section_id = s.id
        )
        WHEN 'question' THEN (
            SELECT jsonb_build_object(
                'id', q.id,
                'objectKey', object_key,
                'mediaExt', media_ext,
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
        WHEN 'lottie' THEN (
            SELECT jsonb_build_object(
                'caption', caption,
                'description', description,
                'objectKey', object_key,
                'mediaExt', media_ext,
                'width', width,
                'height', height,
                'altText', alt_text,
                'fallbackUrl', fallback_url,
                'autoplay', autoplay,
                'loop', loop,
                'speed', speed
            )
            FROM lottie_sections
            WHERE section_id = s.id
        )
        WHEN 'code' THEN (
            SELECT jsonb_build_object(
                'code', code, 
                'language', language,
                'objectKey', object_key,
                'mediaExt', media_ext
            )
            FROM code_sections
            WHERE section_id = s.id
        )
        WHEN 'image' THEN (
            SELECT jsonb_build_object(
                'url', url, 
                'width', width,
                'height', height,
                'objectKey', object_key,
                'mediaExt', media_ext,
                'headline', headline,
                'caption', caption
            )
            FROM code_sections
            WHERE section_id = s.id
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
    c.folder_object_key,
    c.created_at,
    c.updated_at,
    c.name,
    c.description,
    c.requirements,
    c.what_you_learn,
    c.background_color,
    c.img_key,
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
    c.folder_object_key,
    c.created_at,
    c.updated_at,
    c.name,
    c.description,
    c.requirements,
    c.what_you_learn,
    c.background_color,
    c.img_key,
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
    u.folder_object_key as unit_folder_object_key,
    u.img_key as unit_img_key,
    u.media_ext as unit_media_ext,
    u.created_at as unit_created_at,
    u.updated_at as unit_updated_at,
    u.name as unit_name,
    u.description as unit_description,
    u.unit_number as unit_number,
    m.id as module_id,
    m.folder_object_key as module_folder_object_key,
    m.img_key as module_img_key,
    m.media_ext as module_media_ext,
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
