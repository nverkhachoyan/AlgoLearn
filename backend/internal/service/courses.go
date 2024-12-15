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
	GetCourseSummary(ctx context.Context, courseID int64) (*models.Course, error)
	GetCourseFull(ctx context.Context, courseID int64) (*models.Course, error)
	DeleteCourse(ctx context.Context, id int64) error
	GetCourseProgressSummary(ctx context.Context, userID int64, courseID int64) (*models.Course, error)
	GetCourseProgressFull(ctx context.Context, userID int64, courseID int64) (*models.Course, error)
	GetCoursesProgressSummary(ctx context.Context, page int, pageSize int, userID int64, queryFilter string) (int64, []models.Course, error)
}

type courseService struct {
	queries *gen.Queries
}

func NewCourseService(db *sql.DB) CourseService {
	return &courseService{queries: gen.New(db)}
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

func nullBoolToBool(n sql.NullBool) bool {
	if n.Valid {
		return n.Bool
	}
	return false
}

// SectionContent holds all possible section content fields
type sectionContent struct {
	// Text section
	TextContent string

	// Video section
	URL          string
	Duration     sql.NullFloat64
	ThumbnailURL sql.NullString

	// Question section
	QuestionID   int32
	Question     string
	QuestionType string
	Explanation  string
	Options      json.RawMessage
}

func (r *courseService) GetCourseSummary(ctx context.Context, courseID int64) (*models.Course, error) {
	log := logger.Get().WithBaseFields(logger.Service, "GetCourseProgress")

	// Get base course info
	courseData, err := r.queries.GetCourseByID(ctx, int32(courseID))
	if err != nil {
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

func (r *courseService) DeleteCourse(ctx context.Context, id int64) error {
	err := r.queries.DeleteCourse(ctx, int32(id))
	if err != nil {
		if err == sql.ErrNoRows {
			return codes.ErrNotFound
		}
		return fmt.Errorf("failed to delete course: %w", err)
	}
	return nil
}

func (r *courseService) GetCoursesProgressSummary(ctx context.Context, page int, pageSize int, userID int64, queryFilter string) (int64, []models.Course, error) {
	log := logger.Get().WithBaseFields(logger.Service, "GetCoursesProgress")

	offset := (page - 1) * pageSize

	results, err := r.queries.GetCoursesProgressSummary(ctx, gen.GetCoursesProgressSummaryParams{
		UserID:     int32(userID),
		PageLimit:  int32(pageSize),
		PageOffset: int32(offset),
		FilterType: queryFilter,
	})
	if err != nil {
		log.WithError(err).Error("failed to get courses progress")
		return 0, nil, err
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

func (r *courseService) GetCourseProgressSummary(ctx context.Context, userID int64, courseID int64) (*models.Course, error) {
	log := logger.Get().WithBaseFields(logger.Service, "GetCourseProgress")

	// Get base course info with current progress
	courseData, err := r.queries.GetCourseProgressSummaryBase(ctx, gen.GetCourseProgressSummaryBaseParams{
		UserID:   int32(userID),
		CourseID: int32(courseID),
	})
	if err != nil {
		log.WithError(err).Error("failed to get course progress summary")
		return nil, fmt.Errorf("failed to get course progress summary: %w", err)
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
		}
	}

	return course, nil
}

func (r *courseService) getSectionContent(ctx context.Context, section gen.GetModuleSectionsWithProgressRow) (models.Section, error) {
	log := logger.Get().WithBaseFields(logger.Service, "getSectionContent")

	baseSection := models.BaseSection{
		ModuleID: int64(section.ModuleID),
		Type:     section.Type,
		Position: int16(section.Position),
		SectionProgress: models.SectionProgress{
			SeenAt:      section.SeenAt.Time,
			StartedAt:   section.StartedAt.Time,
			CompletedAt: section.CompletedAt.Time,
			HasSeen:     section.HasSeen.Bool,
		},
	}

	var result models.Section
	var content sectionContent

	switch section.Type {
	case "text":
		textContent, err := r.queries.GetTextSection(ctx, section.ID)
		if err != nil {
			log.WithError(err).Error("failed to get text section content")
			return nil, fmt.Errorf("failed to get text section content: %w", err)
		}
		content.TextContent = textContent
		result = &models.TextSection{
			BaseModel: models.BaseModel{
				ID:        int64(section.ID),
				CreatedAt: section.CreatedAt,
				UpdatedAt: section.UpdatedAt,
			},
			BaseSection: baseSection,
			Content:     content.TextContent,
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
			BaseSection: baseSection,
			URL:         url,
		}

	case "question":
		questionContent, err := r.queries.GetQuestionSection(ctx, section.ID)
		if err != nil {
			log.WithError(err).Error("failed to get question section content")
			return nil, fmt.Errorf("failed to get question section content: %w", err)
		}

		var options []models.QuestionOption
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
			BaseSection: baseSection,
			Question: models.Question{
				ID:       int64(questionContent.ID),
				Question: questionContent.Question,
				Type:     questionContent.Type,
				Options:  options,
			},
		}

	default:
		return nil, fmt.Errorf("unknown section type: %s", section.Type)
	}

	return result, nil
}

func (r *courseService) getSectionContentWithoutProgress(ctx context.Context, section gen.GetModuleSectionsRow) (models.Section, error) {

	baseSection := models.BaseSection{
		ModuleID: int64(section.ModuleID),
		Type:     section.Type,
		Position: int16(section.Position),
	}

	var result models.Section

	switch section.Type {
	case "text":
		textContent, err := r.queries.GetTextSection(ctx, section.ID)
		if err != nil {
			return nil, fmt.Errorf("failed to get text section content: %w", err)
		}
		result = &models.TextSection{
			BaseModel: models.BaseModel{
				ID:        int64(section.ID),
				CreatedAt: section.CreatedAt,
				UpdatedAt: section.UpdatedAt,
			},
			BaseSection: baseSection,
			Content:     textContent,
		}

	case "video":
		url, err := r.queries.GetVideoSection(ctx, section.ID)
		if err != nil {
			return nil, fmt.Errorf("failed to get video section content: %w", err)
		}
		result = &models.VideoSection{
			BaseModel: models.BaseModel{
				ID:        int64(section.ID),
				CreatedAt: section.CreatedAt,
				UpdatedAt: section.UpdatedAt,
			},
			BaseSection: baseSection,
			URL:         url,
		}

	case "question":
		questionContent, err := r.queries.GetQuestionSection(ctx, section.ID)
		if err != nil {
			return nil, fmt.Errorf("failed to get question section content: %w", err)
		}

		var options []models.QuestionOption
		optionsBytes, ok := questionContent.QuestionOptions.([]byte)
		if !ok {
			return nil, fmt.Errorf("failed to convert question options to bytes")
		}
		if err := json.Unmarshal(optionsBytes, &options); err != nil {
			return nil, fmt.Errorf("failed to unmarshal question options: %w", err)
		}

		result = &models.QuestionSection{
			BaseModel: models.BaseModel{
				ID:        int64(section.ID),
				CreatedAt: section.CreatedAt,
				UpdatedAt: section.UpdatedAt,
			},
			BaseSection: baseSection,
			Question: models.Question{
				ID:       int64(questionContent.ID),
				Question: questionContent.Question,
				Type:     questionContent.Type,
				Options:  options,
			},
		}

	default:
		return nil, fmt.Errorf("unknown section type: %s", section.Type)
	}

	return result, nil
}

func (r *courseService) GetCourseProgressFull(ctx context.Context, userID int64, courseID int64) (*models.Course, error) {
	log := logger.Get().WithBaseFields(logger.Service, "GetCourseProgress")

	// Get base course info with current progress
	courseData, err := r.queries.GetCourseProgressFullBase(ctx, gen.GetCourseProgressFullBaseParams{
		UserID:   int32(userID),
		CourseID: int32(courseID),
	})
	if err != nil {
		log.WithError(err).Error("failed to get course progress full")
		return nil, fmt.Errorf("failed to get course progress full: %w", err)
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

		// Get modules with progress and sections for each unit
		modules, err := r.queries.GetModuleProgressWithSections(ctx, gen.GetModuleProgressWithSectionsParams{
			UserID: int32(userID),
			UnitID: unit.ID,
		})
		if err != nil {
			log.WithError(err).Error("failed to get unit modules with sections")
			return nil, fmt.Errorf("failed to get unit modules with sections: %w", err)
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

			course.Units[i].Modules[j].Sections = make([]models.Section, len(sections))
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

func (r *courseService) GetCourseFull(ctx context.Context, courseID int64) (*models.Course, error) {
	log := logger.Get().WithBaseFields(logger.Service, "GetCourseFull")

	// Get base course info
	courseData, err := r.queries.GetCourseByID(ctx, int32(courseID))
	if err != nil {
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

			// Get sections for each module
			sections, err := r.queries.GetModuleSections(ctx, module.ID)
			if err != nil {
				log.WithError(err).Error("failed to get module sections")
				return nil, fmt.Errorf("failed to get module sections: %w", err)
			}

			course.Units[i].Modules[j].Sections = make([]models.Section, len(sections))
			for k, section := range sections {
				sectionWithContent, err := r.getSectionContentWithoutProgress(ctx, section)
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
