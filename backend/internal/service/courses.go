package service

import (
	gen "algolearn/internal/database/generated"
	codes "algolearn/internal/errors"
	"algolearn/internal/models"
	"algolearn/pkg/logger"
	"context"
	"database/sql"
	"encoding/json"
	"fmt"
)

type CourseService interface {
	// Public endpoints
	ListCourses(ctx context.Context, page int, pageSize int) (int64, []models.Course, error)
	GetCourse(ctx context.Context, courseID int64) (*models.Course, error)

	// Protected endpoints
	ListCoursesProgress(ctx context.Context, page int, pageSize int, userID int64) (int64, []models.Course, error)
	GetCourseProgress(ctx context.Context, userID int64, courseID int64) (*models.Course, error)
	StartCourse(ctx context.Context, userID int64, courseID int32) (int32, int32, error)
	DeleteCourse(ctx context.Context, id int64) error
	DeleteCourseProgress(ctx context.Context, userID int64, courseID int64) error
}

type courseService struct {
	queries *gen.Queries
	log     *logger.Logger
}

func NewCourseService(db *sql.DB) CourseService {
	return &courseService{queries: gen.New(db), log: logger.Get()}
}

// Helper functions for type conversions
func nullInt32ToInt64(n sql.NullInt32) int64 {
	if n.Valid {
		return int64(n.Int32)
	}
	return 0
}

func nullInt32ToInt16(n sql.NullInt32) int16 {
	if n.Valid {
		return int16(n.Int32)
	}
	return 0
}

func nullStringToString(n sql.NullString) string {
	if n.Valid {
		return n.String
	}
	return ""
}

func nullFloat64ToFloat32(n sql.NullFloat64) float32 {
	if n.Valid {
		return float32(n.Float64)
	}
	return 0
}

// ListCourses returns a paginated list of all available courses
func (r *courseService) ListCourses(ctx context.Context, page int, pageSize int) (int64, []models.Course, error) {
	log := r.log.WithBaseFields(logger.Service, "ListCourses")

	if page <= 0 {
		return 0, nil, fmt.Errorf("invalid page number: %d", page)
	}
	if pageSize <= 0 {
		return 0, nil, fmt.Errorf("invalid page size: %d", pageSize)
	}

	offset := (page - 1) * pageSize

	results, err := r.queries.ListCourses(ctx, gen.ListCoursesParams{
		PageLimit:  int32(pageSize),
		PageOffset: int32(offset),
	})
	if err != nil {
		log.WithError(err).Error("failed to list courses")
		return 0, nil, fmt.Errorf("failed to list courses: %w", err)
	}

	var courses []models.Course
	var totalCount int64

	for _, result := range results {
		totalCount = result.TotalCount

		course := models.Course{
			BaseModel: models.BaseModel{
				ID:        int64(result.ID),
				CreatedAt: result.CreatedAt,
				UpdatedAt: result.UpdatedAt,
			},
			Name:            result.Name,
			Description:     result.Description,
			Requirements:    nullStringToString(result.Requirements),
			WhatYouLearn:    nullStringToString(result.WhatYouLearn),
			BackgroundColor: nullStringToString(result.BackgroundColor),
			IconURL:         nullStringToString(result.IconUrl),
			Duration:        nullInt32ToInt16(result.Duration),
			DifficultyLevel: models.DifficultyLevel(result.DifficultyLevel.DifficultyLevel),
			Rating:          result.Rating.Float64,
		}

		// Get authors for each course
		authors, err := r.queries.GetCourseAuthors(ctx, result.ID)
		if err != nil {
			log.WithError(err).Error("failed to get course authors")
			return 0, nil, fmt.Errorf("failed to get course authors: %w", err)
		}
		course.Authors = make([]models.Author, len(authors))
		for i, author := range authors {
			course.Authors[i] = models.Author{
				ID:   int64(author.ID),
				Name: author.Name,
			}
		}

		// Get tags for each course
		tags, err := r.queries.GetCourseTags(ctx, result.ID)
		if err != nil {
			log.WithError(err).Error("failed to get course tags")
			return 0, nil, fmt.Errorf("failed to get course tags: %w", err)
		}
		course.Tags = make([]models.Tag, len(tags))
		for i, tag := range tags {
			course.Tags[i] = models.Tag{
				ID:   int64(tag.ID),
				Name: tag.Name,
			}
		}

		courses = append(courses, course)
	}

	return totalCount, courses, nil
}

// GetCourse returns details of a specific course
func (r *courseService) GetCourse(ctx context.Context, courseID int64) (*models.Course, error) {
	log := r.log.WithBaseFields(logger.Service, "GetCourse")

	if courseID <= 0 {
		return nil, fmt.Errorf("invalid course ID: %d", courseID)
	}

	courseData, err := r.queries.GetCourseByID(ctx, int32(courseID))
	if err != nil {
		if err == sql.ErrNoRows {
			return nil, sql.ErrNoRows
		}
		log.WithError(err).Error("failed to get course")
		return nil, fmt.Errorf("failed to get course: %w", err)
	}

	course := &models.Course{
		BaseModel: models.BaseModel{
			ID:        int64(courseData.ID),
			CreatedAt: courseData.CreatedAt,
			UpdatedAt: courseData.UpdatedAt,
		},
		Name:            courseData.Name,
		Description:     courseData.Description,
		Requirements:    nullStringToString(courseData.Requirements),
		WhatYouLearn:    nullStringToString(courseData.WhatYouLearn),
		BackgroundColor: nullStringToString(courseData.BackgroundColor),
		IconURL:         nullStringToString(courseData.IconUrl),
		Duration:        int16(courseData.Duration.Int32),
		DifficultyLevel: models.DifficultyLevel(courseData.DifficultyLevel.DifficultyLevel),
		Rating:          courseData.Rating.Float64,
	}

	// Get authors
	authors, err := r.queries.GetCourseAuthors(ctx, courseData.ID)
	if err != nil {
		log.WithError(err).Error("failed to get course authors")
		return nil, fmt.Errorf("failed to get course authors: %w", err)
	}
	course.Authors = make([]models.Author, len(authors))
	for i, author := range authors {
		course.Authors[i] = models.Author{
			ID:   int64(author.ID),
			Name: author.Name,
		}
	}

	// Get tags
	tags, err := r.queries.GetCourseTags(ctx, courseData.ID)
	if err != nil {
		log.WithError(err).Error("failed to get course tags")
		return nil, fmt.Errorf("failed to get course tags: %w", err)
	}
	course.Tags = make([]models.Tag, len(tags))
	for i, tag := range tags {
		course.Tags[i] = models.Tag{
			ID:   int64(tag.ID),
			Name: tag.Name,
		}
	}

	// Get units with modules
	units, err := r.queries.GetCourseUnits(ctx, courseData.ID)
	if err != nil {
		log.WithError(err).Error("failed to get course units")
		return nil, fmt.Errorf("failed to get course units: %w", err)
	}

	course.Units = make([]*models.Unit, len(units))
	for i, unit := range units {
		course.Units[i] = &models.Unit{
			BaseModel: models.BaseModel{
				ID:        int64(unit.ID),
				CreatedAt: unit.CreatedAt,
				UpdatedAt: unit.UpdatedAt,
			},
			UnitNumber:  int16(unit.UnitNumber),
			Name:        unit.Name,
			Description: unit.Description,
		}

		// Get modules for each unit
		modules, err := r.queries.GetUnitModules(ctx, unit.ID)
		if err != nil {
			log.WithError(err).Error("failed to get unit modules")
			return nil, fmt.Errorf("failed to get unit modules: %w", err)
		}

		course.Units[i].Modules = make([]models.Module, len(modules))
		for j, module := range modules {
			course.Units[i].Modules[j] = models.Module{
				BaseModel: models.BaseModel{
					ID:        int64(module.ID),
					CreatedAt: module.CreatedAt,
					UpdatedAt: module.UpdatedAt,
				},
				ModuleNumber: int16(module.ModuleNumber),
				ModuleUnitID: int64(module.UnitID),
				Name:         module.Name,
				Description:  module.Description,
			}
		}
	}

	return course, nil
}

// ListCoursesProgress returns a paginated list of courses with user's progress
func (r *courseService) ListCoursesProgress(ctx context.Context, page int, pageSize int, userID int64) (int64, []models.Course, error) {
	log := r.log.WithBaseFields(logger.Service, "ListCoursesProgress")

	if page <= 0 {
		return 0, nil, fmt.Errorf("invalid page number: %d", page)
	}
	if pageSize <= 0 {
		return 0, nil, fmt.Errorf("invalid page size: %d", pageSize)
	}
	if userID <= 0 {
		return 0, nil, fmt.Errorf("invalid user ID: %d", userID)
	}

	offset := (page - 1) * pageSize

	results, err := r.queries.GetCoursesProgressSummary(ctx, gen.GetCoursesProgressSummaryParams{
		UserID:     int32(userID),
		PageLimit:  int32(pageSize),
		PageOffset: int32(offset),
	})
	if err != nil {
		log.WithError(err).Error("failed to get courses progress")
		return 0, nil, fmt.Errorf("failed to get courses progress: %w", err)
	}

	var courses []models.Course
	var totalCount int64

	for _, result := range results {
		totalCount = result.TotalCount

		course := models.Course{
			BaseModel: models.BaseModel{
				ID:        int64(result.ID),
				CreatedAt: result.CreatedAt,
				UpdatedAt: result.UpdatedAt,
			},
			Name:            result.Name,
			Description:     result.Description,
			Requirements:    nullStringToString(result.Requirements),
			WhatYouLearn:    nullStringToString(result.WhatYouLearn),
			BackgroundColor: nullStringToString(result.BackgroundColor),
			IconURL:         nullStringToString(result.IconUrl),
			Duration:        nullInt32ToInt16(result.Duration),
			DifficultyLevel: models.DifficultyLevel(result.DifficultyLevel.DifficultyLevel),
			Rating:          result.Rating.Float64,
		}

		// Get authors for each course
		authors, err := r.queries.GetCourseAuthors(ctx, result.ID)
		if err != nil {
			log.WithError(err).Error("failed to get course authors")
			return 0, nil, fmt.Errorf("failed to get course authors: %w", err)
		}
		course.Authors = make([]models.Author, len(authors))
		for i, author := range authors {
			course.Authors[i] = models.Author{
				ID:   int64(author.ID),
				Name: author.Name,
			}
		}

		// Get tags for each course
		tags, err := r.queries.GetCourseTags(ctx, result.ID)
		if err != nil {
			log.WithError(err).Error("failed to get course tags")
			return 0, nil, fmt.Errorf("failed to get course tags: %w", err)
		}
		course.Tags = make([]models.Tag, len(tags))
		for i, tag := range tags {
			course.Tags[i] = models.Tag{
				ID:   int64(tag.ID),
				Name: tag.Name,
			}
		}

		// Handle current unit if exists
		if result.CurrentUnitID.Valid {
			course.CurrentUnit = &models.Unit{
				BaseModel: models.BaseModel{
					ID:        nullInt32ToInt64(result.CurrentUnitID),
					CreatedAt: result.UnitCreatedAt.Time,
					UpdatedAt: result.UnitUpdatedAt.Time,
				},
				UnitNumber:  nullInt32ToInt16(result.UnitNumber),
				Name:        nullStringToString(result.UnitName),
				Description: nullStringToString(result.UnitDescription),
			}
		}

		// Handle current module if exists
		if result.CurrentModuleID.Valid {
			course.CurrentModule = &models.Module{
				BaseModel: models.BaseModel{
					ID:        nullInt32ToInt64(result.CurrentModuleID),
					CreatedAt: result.ModuleCreatedAt.Time,
					UpdatedAt: result.ModuleUpdatedAt.Time,
				},
				ModuleNumber: nullInt32ToInt16(result.ModuleNumber),
				ModuleUnitID: nullInt32ToInt64(result.ModuleUnitID),
				Name:         nullStringToString(result.ModuleName),
				Description:  nullStringToString(result.ModuleDescription),
				Progress:     nullFloat64ToFloat32(result.ModuleProgress),
				Status:       string(result.ModuleStatus.ModuleProgressStatus),
			}
		}

		courses = append(courses, course)
	}

	return totalCount, courses, nil
}

// GetCourseProgress returns details of a specific course with user's progress
func (r *courseService) GetCourseProgress(ctx context.Context, userID int64, courseID int64) (*models.Course, error) {
	log := r.log.WithBaseFields(logger.Service, "GetCourseProgress")

	if userID <= 0 {
		return nil, fmt.Errorf("invalid user ID: %d", userID)
	}
	if courseID <= 0 {
		return nil, fmt.Errorf("invalid course ID: %d", courseID)
	}

	courseData, err := r.queries.GetCourseProgressSummaryBase(ctx, gen.GetCourseProgressSummaryBaseParams{
		UserID:   int32(userID),
		CourseID: int32(courseID),
	})
	if err != nil {
		if err == sql.ErrNoRows {
			return nil, sql.ErrNoRows
		}
		log.WithError(err).Error("failed to get course progress")
		return nil, fmt.Errorf("failed to get course progress: %w", err)
	}

	course := &models.Course{
		BaseModel: models.BaseModel{
			ID:        int64(courseData.ID),
			CreatedAt: courseData.CreatedAt,
			UpdatedAt: courseData.UpdatedAt,
		},
		Name:            courseData.Name,
		Description:     courseData.Description,
		Requirements:    nullStringToString(courseData.Requirements),
		WhatYouLearn:    nullStringToString(courseData.WhatYouLearn),
		BackgroundColor: nullStringToString(courseData.BackgroundColor),
		IconURL:         nullStringToString(courseData.IconUrl),
		Duration:        int16(courseData.Duration.Int32),
		DifficultyLevel: models.DifficultyLevel(courseData.DifficultyLevel.DifficultyLevel),
		Rating:          courseData.Rating.Float64,
	}

	// Get authors
	authors, err := r.queries.GetCourseAuthors(ctx, courseData.ID)
	if err != nil {
		log.WithError(err).Error("failed to get course authors")
		return nil, fmt.Errorf("failed to get course authors: %w", err)
	}
	course.Authors = make([]models.Author, len(authors))
	for i, author := range authors {
		course.Authors[i] = models.Author{
			ID:   int64(author.ID),
			Name: author.Name,
		}
	}

	// Get tags
	tags, err := r.queries.GetCourseTags(ctx, courseData.ID)
	if err != nil {
		log.WithError(err).Error("failed to get course tags")
		return nil, fmt.Errorf("failed to get course tags: %w", err)
	}
	course.Tags = make([]models.Tag, len(tags))
	for i, tag := range tags {
		course.Tags[i] = models.Tag{
			ID:   int64(tag.ID),
			Name: tag.Name,
		}
	}

	// Set current unit and module if they exist
	if courseData.CurrentUnitID.Valid {
		course.CurrentUnit = &models.Unit{
			BaseModel: models.BaseModel{
				ID:        int64(courseData.CurrentUnitID.Int32),
				CreatedAt: courseData.UnitCreatedAt.Time,
				UpdatedAt: courseData.UnitUpdatedAt.Time,
			},
			UnitNumber:  int16(courseData.UnitNumber.Int32),
			Name:        courseData.UnitName.String,
			Description: courseData.UnitDescription.String,
		}
	}

	if courseData.CurrentModuleID.Valid {
		course.CurrentModule = &models.Module{
			BaseModel: models.BaseModel{
				ID:        int64(courseData.CurrentModuleID.Int32),
				CreatedAt: courseData.ModuleCreatedAt.Time,
				UpdatedAt: courseData.ModuleUpdatedAt.Time,
			},
			ModuleNumber: int16(courseData.ModuleNumber.Int32),
			ModuleUnitID: int64(courseData.ModuleUnitID.Int32),
			Name:         courseData.ModuleName.String,
			Description:  courseData.ModuleDescription.String,
			Progress:     float32(courseData.ModuleProgress.Float64),
			Status:       string(courseData.ModuleStatus.ModuleProgressStatus),
		}
	}

	// Get units with modules and their progress
	units, err := r.queries.GetCourseUnits(ctx, courseData.ID)
	if err != nil {
		log.WithError(err).Error("failed to get course units")
		return nil, fmt.Errorf("failed to get course units: %w", err)
	}

	course.Units = make([]*models.Unit, len(units))
	for i, unit := range units {
		course.Units[i] = &models.Unit{
			BaseModel: models.BaseModel{
				ID:        int64(unit.ID),
				CreatedAt: unit.CreatedAt,
				UpdatedAt: unit.UpdatedAt,
			},
			UnitNumber:  int16(unit.UnitNumber),
			Name:        unit.Name,
			Description: unit.Description,
		}

		// Get modules with progress for each unit
		modules, err := r.queries.GetModuleProgressByUnit(ctx, gen.GetModuleProgressByUnitParams{
			UserID: int32(userID),
			UnitID: unit.ID,
		})
		if err != nil {
			log.WithError(err).Error("failed to get unit modules with progress")
			return nil, fmt.Errorf("failed to get unit modules with progress: %w", err)
		}

		course.Units[i].Modules = make([]models.Module, len(modules))
		for j, module := range modules {
			course.Units[i].Modules[j] = models.Module{
				BaseModel: models.BaseModel{
					ID:        int64(module.ID),
					CreatedAt: module.CreatedAt,
					UpdatedAt: module.UpdatedAt,
				},
				ModuleNumber: int16(module.ModuleNumber),
				ModuleUnitID: int64(module.UnitID),
				Name:         module.Name,
				Description:  module.Description,
				Progress:     float32(module.Progress.Float64),
				Status:       string(module.Status.ModuleProgressStatus),
			}

			// Get sections with progress for each module
			sections, err := r.queries.GetModuleSectionsWithProgress(ctx, gen.GetModuleSectionsWithProgressParams{
				UserID:   int32(userID),
				ModuleID: module.ID,
			})
			if err != nil {
				log.WithError(err).Error("failed to get module sections")
				return nil, fmt.Errorf("failed to get module sections: %w", err)
			}

			course.Units[i].Modules[j].Sections = make([]models.SectionInterface, len(sections))
			for k, section := range sections {
				sectionWithContent, err := r.getSectionContent(ctx, section)
				if err != nil {
					log.WithError(err).Error("failed to get section content")
					return nil, fmt.Errorf("failed to get section content: %w", err)
				}
				course.Units[i].Modules[j].Sections[k] = sectionWithContent
			}
		}
	}

	return course, nil
}

func (r *courseService) getSectionContent(ctx context.Context, section gen.GetModuleSectionsWithProgressRow) (models.SectionInterface, error) {
	log := r.log.WithBaseFields(logger.Service, "getSectionContent")

	var result models.SectionInterface

	switch section.Type {
	case "text":
		textContent, err := r.queries.GetTextSection(ctx, section.ID)
		if err != nil {
			log.WithError(err).Error("failed to get text section content")
			return nil, fmt.Errorf("failed to get text section content: %w", err)
		}

		result = &models.TextSection{
			BaseModel: models.BaseModel{
				ID:        int64(section.ID),
				CreatedAt: section.CreatedAt,
				UpdatedAt: section.UpdatedAt,
			},
			Type:     section.Type,
			Position: int16(section.Position),
			Content: models.TextContent{
				Text: textContent,
			},
			SectionProgress: &models.SectionProgress{
				SectionID:   int64(section.ID),
				SeenAt:      section.SeenAt.Time,
				HasSeen:     section.HasSeen.Bool,
				StartedAt:   section.StartedAt.Time,
				CompletedAt: section.CompletedAt.Time,
			},
		}

	case "video":
		url, err := r.queries.GetVideoSection(ctx, section.ID)
		if err != nil {
			log.WithError(err).Error("failed to get video section content")
			return nil, fmt.Errorf("failed to get video section content: %w", err)
		}
		result = &models.VideoSection{
			BaseModel: models.BaseModel{
				ID:        int64(section.ID),
				CreatedAt: section.CreatedAt,
				UpdatedAt: section.UpdatedAt,
			},
			Type:     section.Type,
			Position: int16(section.Position),
			Content: models.VideoContent{
				URL: url,
			},
			SectionProgress: &models.SectionProgress{
				SectionID:   int64(section.ID),
				SeenAt:      section.SeenAt.Time,
				HasSeen:     section.HasSeen.Bool,
				StartedAt:   section.StartedAt.Time,
				CompletedAt: section.CompletedAt.Time,
			},
		}

	case "question":
		questionContent, err := r.queries.GetQuestionSection(ctx, section.ID)
		if err != nil {
			log.WithError(err).Error("failed to get question section content")
			return nil, fmt.Errorf("failed to get question section content: %w", err)
		}

		var options []models.Option
		optionsBytes, ok := questionContent.QuestionOptions.([]byte)
		if !ok {
			return nil, fmt.Errorf("failed to convert question options to bytes")
		}
		if err := json.Unmarshal(optionsBytes, &options); err != nil {
			log.WithError(err).Error("failed to unmarshal question options")
			return nil, fmt.Errorf("failed to unmarshal question options: %w", err)
		}

		result = &models.QuestionSection{
			BaseModel: models.BaseModel{
				ID:        int64(section.ID),
				CreatedAt: section.CreatedAt,
				UpdatedAt: section.UpdatedAt,
			},
			Type:     section.Type,
			Position: int16(section.Position),
			Content: models.QuestionContent{
				ID:       int64(questionContent.ID),
				Question: questionContent.Question,
				Type:     questionContent.Type,
				Options:  options,
			},
			SectionProgress: &models.SectionProgress{
				SectionID:   int64(section.ID),
				SeenAt:      section.SeenAt.Time,
				HasSeen:     section.HasSeen.Bool,
				StartedAt:   section.StartedAt.Time,
				CompletedAt: section.CompletedAt.Time,
			},
		}

	default:
		return nil, fmt.Errorf("unknown section type: %s", section.Type)
	}

	return result, nil
}

func (r *courseService) StartCourse(ctx context.Context, userID int64, courseID int32) (int32, int32, error) {
	log := r.log.WithBaseFields(logger.Service, "StartCourse")

	if userID <= 0 {
		return 0, 0, fmt.Errorf("invalid user ID: %d", userID)
	}
	if courseID <= 0 {
		return 0, 0, fmt.Errorf("invalid course ID: %d", courseID)
	}

	firstUnitAndModule, err := r.queries.GetFirstUnitAndModule(ctx, courseID)
	if err != nil {
		if err == sql.ErrNoRows {
			return 0, 0, sql.ErrNoRows
		}
		log.WithError(err).Error("failed to get first unit and module")
		return 0, 0, fmt.Errorf("failed to get first unit and module: %w", err)
	}

	if firstUnitAndModule.UnitID == 0 {
		return 0, 0, fmt.Errorf("course %d has no valid unit", courseID)
	}

	if firstUnitAndModule.ModuleID == 0 {
		return 0, 0, fmt.Errorf("course %d has no valid module", courseID)
	}

	err = r.queries.StartCourse(ctx, gen.StartCourseParams{
		UserID:   int32(userID),
		CourseID: courseID,
		UnitID:   firstUnitAndModule.UnitID,
		ModuleID: firstUnitAndModule.ModuleID,
	})
	if err != nil {
		log.WithError(err).Error("failed to start course")
		return 0, 0, fmt.Errorf("failed to start course: %w", err)
	}

	return firstUnitAndModule.UnitID, firstUnitAndModule.ModuleID, nil
}

func (r *courseService) DeleteCourse(ctx context.Context, id int64) error {
	log := r.log.WithBaseFields(logger.Service, "DeleteCourse")

	if id <= 0 {
		return fmt.Errorf("invalid course ID: %d", id)
	}

	err := r.queries.DeleteCourse(ctx, int32(id))
	if err != nil {
		if err == sql.ErrNoRows {
			return codes.ErrNotFound
		}
		log.WithError(err).Error("failed to delete course")
		return fmt.Errorf("failed to delete course: %w", err)
	}
	return nil
}

func (r *courseService) DeleteCourseProgress(ctx context.Context, userID int64, courseID int64) error {
	log := r.log.WithBaseFields(logger.Service, "DeleteCourseProgress")

	if userID <= 0 {
		return fmt.Errorf("invalid user ID: %d", userID)
	}
	if courseID <= 0 {
		return fmt.Errorf("invalid course ID: %d", courseID)
	}

	err := r.queries.DeleteCourseProgress(ctx, gen.DeleteCourseProgressParams{
		UserID:   int32(userID),
		CourseID: int32(courseID),
	})
	if err != nil {
		if err == sql.ErrNoRows {
			return sql.ErrNoRows
		}
		log.WithError(err).Error("failed to delete course progress")
		return fmt.Errorf("failed to delete course progress: %w", err)
	}
	return nil
}
