package service

import (
	gen "algolearn/internal/database/generated"
	"algolearn/internal/models"
	"algolearn/pkg/logger"
	"context"
	"database/sql"
	"encoding/json"
	"fmt"
)

type CourseService interface {
	GetCourse(ctx context.Context, courseID int64) (*models.Course, error)
	GetCoursesCount(ctx context.Context) (int64, error)
	GetCourseByID(ctx context.Context, courseID int32) (*models.Course, error)
	GetCourseWithProgress(ctx context.Context, userID int64, courseID int64) (*models.Course, error)
	ListEnrolledCoursesWithProgress(ctx context.Context, page int, pageSize int, userID int64) (int64, []models.Course, error)
	ListAllCoursesWithOptionalProgress(ctx context.Context, page int, pageSize int, userID int64) (int64, []models.Course, error)
	SearchCourses(ctx context.Context, query string, page int, pageSize int, useFullText bool) (int64, []models.Course, error)
	StartCourse(ctx context.Context, userID int64, courseID int32) (int32, int32, error)
	CreateCourse(ctx context.Context, course models.Course) (*models.Course, error)
	UpdateCourse(ctx context.Context, course models.Course) error
	PublishCourse(ctx context.Context, courseID int64) error
	DeleteCourse(ctx context.Context, id int64) error
	ResetCourseProgress(ctx context.Context, userID int64, courseID int64) error
}

type courseService struct {
	queries *gen.Queries
	db      *sql.DB
	log     *logger.Logger
}

func NewCourseService(db *sql.DB) CourseService {
	return &courseService{
		queries: gen.New(db),
		db:      db,
		log:     logger.Get(),
	}
}

func (r *courseService) GetCoursesCount(ctx context.Context) (int64, error) {
	log := r.log.WithBaseFields(logger.Service, "GetCoursesCount")

	count, err := r.queries.GetCoursesCount(ctx)
	if err != nil {
		log.WithError(err).Error("failed to get courses count")
		return 0, fmt.Errorf("failed to get courses count: %w", err)
	}
	return count, nil
}

func (r *courseService) ListEnrolledCoursesWithProgress(ctx context.Context, page int, pageSize int, userID int64) (int64, []models.Course, error) {
	log := r.log.WithBaseFields(logger.Service, "ListEnrolledCoursesWithProgress")

	if page <= 0 {
		return 0, nil, fmt.Errorf("invalid page number: %d", page)
	}
	if pageSize <= 0 {
		return 0, nil, fmt.Errorf("invalid page size: %d", pageSize)
	}

	offset := (page - 1) * pageSize
	results, err := r.queries.GetEnrolledCoursesWithProgress(ctx, gen.GetEnrolledCoursesWithProgressParams{
		UserID:     int32(userID),
		PageLimit:  int32(pageSize),
		PageOffset: int32(offset),
	})
	if err != nil {
		log.WithError(err).Error("failed to get enrolled courses with progress")
		return 0, nil, fmt.Errorf("failed to get enrolled courses with progress: %w", err)
	}

	var coursesMap = make(map[int64]models.Course)
	var totalCount int64

	for _, result := range results {
		var course models.Course
		totalCount = result.TotalCount

		if _, exists := coursesMap[int64(result.ID)]; exists || result.ID == 0 {
			continue
		}

		course = models.Course{
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
				Name: author.FirstName.String + " " + author.LastName.String,
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

		if result.CurrentUnitID != 0 {
			course.CurrentUnit = &models.Unit{
				BaseModel: models.BaseModel{
					ID:        int64(result.CurrentUnitID),
					CreatedAt: result.UnitCreatedAt.Time,
					UpdatedAt: result.UnitUpdatedAt.Time,
				},
				UnitNumber:  int16(result.UnitNumber),
				Name:        result.UnitName,
				Description: result.UnitDescription,
			}
		}

		if result.CurrentModuleID != 0 {
			course.CurrentModule = &models.Module{
				BaseModel: models.BaseModel{
					ID:        int64(result.CurrentModuleID),
					CreatedAt: result.ModuleCreatedAt.Time,
					UpdatedAt: result.ModuleUpdatedAt.Time,
				},
				ModuleNumber: int16(result.ModuleNumber),
				Name:         result.ModuleName,
				Description:  result.ModuleDescription,
			}
		}

		coursesMap[course.ID] = course
	}

	courses := make([]models.Course, 0, len(coursesMap))
	for _, course := range coursesMap {
		courses = append(courses, course)
	}

	return totalCount, courses, nil
}

func (r *courseService) ListAllCoursesWithOptionalProgress(ctx context.Context, page int, pageSize int, userID int64) (int64, []models.Course, error) {
	log := r.log.WithBaseFields(logger.Service, "ListAllCoursesWithOptionalProgress")

	if page <= 0 {
		return 0, nil, fmt.Errorf("invalid page number: %d", page)
	}
	if pageSize <= 0 {
		return 0, nil, fmt.Errorf("invalid page size: %d", pageSize)
	}

	offset := (page - 1) * pageSize

	results, err := r.queries.GetAllCoursesWithOptionalProgress(ctx, gen.GetAllCoursesWithOptionalProgressParams{
		UserID:     int32(userID),
		PageLimit:  int32(pageSize),
		PageOffset: int32(offset),
	})
	if err != nil {
		log.WithError(err).Error("failed to get all courses with optional progress")
		return 0, nil, fmt.Errorf("failed to get all courses with optional progress: %w", err)
	}

	var coursesMap = make(map[int64]models.Course)
	var totalCount int64

	for _, result := range results {
		if _, exists := coursesMap[int64(result.ID)]; exists || result.ID == 0 {
			continue
		}

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

		authors, err := r.queries.GetCourseAuthors(ctx, result.ID)
		if err != nil {
			log.WithError(err).Error("failed to get course authors")
			return 0, nil, fmt.Errorf("failed to get course authors: %w", err)
		}
		course.Authors = make([]models.Author, len(authors))
		for i, author := range authors {
			course.Authors[i] = models.Author{
				ID:   int64(author.ID),
				Name: author.FirstName.String + " " + author.LastName.String,
			}
		}

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

		if result.CurrentUnitID.Valid && result.CurrentUnitID.Int32 != 0 {
			course.CurrentUnit = &models.Unit{
				BaseModel: models.BaseModel{
					ID:        int64(result.CurrentUnitID.Int32),
					CreatedAt: result.UnitCreatedAt.Time,
					UpdatedAt: result.UnitUpdatedAt.Time,
				},
				UnitNumber:  int16(result.UnitNumber.Int32),
				Name:        result.UnitName.String,
				Description: result.UnitDescription.String,
			}
		}

		if result.CurrentModuleID.Valid && result.CurrentModuleID.Int32 != 0 {
			course.CurrentModule = &models.Module{
				BaseModel: models.BaseModel{
					ID:        int64(result.CurrentModuleID.Int32),
					CreatedAt: result.ModuleCreatedAt.Time,
					UpdatedAt: result.ModuleUpdatedAt.Time,
				},
				ModuleNumber: int16(result.ModuleNumber.Int32),
				Name:         result.ModuleName.String,
				Description:  result.ModuleDescription.String,
				Progress:     float32(result.ModuleProgress),
				Status:       string(result.ModuleStatus),
			}
		}

		coursesMap[course.ID] = course
	}

	courses := make([]models.Course, 0, len(coursesMap))
	for _, course := range coursesMap {
		courses = append(courses, course)
	}

	return totalCount, courses, nil
}

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

	authors, err := r.queries.GetCourseAuthors(ctx, courseData.ID)
	if err != nil {
		log.WithError(err).Error("failed to get course authors")
		return nil, fmt.Errorf("failed to get course authors: %w", err)
	}
	course.Authors = make([]models.Author, len(authors))
	for i, author := range authors {
		course.Authors[i] = models.Author{
			ID:   int64(author.ID),
			Name: author.FirstName.String + " " + author.LastName.String,
		}
	}

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
				Name:         module.Name,
				Description:  module.Description,
			}
		}
	}

	return course, nil
}

func (r *courseService) GetCourseWithProgress(ctx context.Context, userID int64, courseID int64) (*models.Course, error) {
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

	authors, err := r.queries.GetCourseAuthors(ctx, courseData.ID)
	if err != nil {
		log.WithError(err).Error("failed to get course authors")
		return nil, fmt.Errorf("failed to get course authors: %w", err)
	}
	course.Authors = make([]models.Author, len(authors))
	for i, author := range authors {
		course.Authors[i] = models.Author{
			ID:   int64(author.ID),
			Name: author.FirstName.String + " " + author.LastName.String,
		}
	}

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

	currentUnitAndModule, err := r.queries.GetCurrentUnitAndModule(ctx, gen.GetCurrentUnitAndModuleParams{
		UserID:   int32(userID),
		CourseID: int32(courseID),
	})
	if err != nil && err != sql.ErrNoRows {
		log.WithError(err).Error("failed to get current unit and module")
		return nil, fmt.Errorf("failed to get current unit and module: %w", err)
	}

	if currentUnitAndModule.UnitID != 0 {
		course.CurrentUnit = &models.Unit{
			BaseModel: models.BaseModel{
				ID:        int64(currentUnitAndModule.UnitID),
				CreatedAt: currentUnitAndModule.UnitCreatedAt,
				UpdatedAt: currentUnitAndModule.UnitUpdatedAt,
			},
			UnitNumber:  int16(currentUnitAndModule.UnitNumber),
			Name:        currentUnitAndModule.UnitName,
			Description: currentUnitAndModule.UnitDescription,
		}
	}

	if currentUnitAndModule.ModuleID != 0 {
		course.CurrentModule = &models.Module{
			BaseModel: models.BaseModel{
				ID:        int64(currentUnitAndModule.ModuleID),
				CreatedAt: currentUnitAndModule.ModuleCreatedAt,
				UpdatedAt: currentUnitAndModule.ModuleUpdatedAt,
			},
			ModuleNumber: int16(currentUnitAndModule.ModuleNumber),
			Name:         currentUnitAndModule.ModuleName,
			Description:  currentUnitAndModule.ModuleDescription,
			Progress:     float32(currentUnitAndModule.ModuleProgress),
			Status:       string(currentUnitAndModule.ModuleStatus),
		}
	}

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
				Name:         module.Name,
				Description:  module.Description,
				Progress:     float32(module.Progress.Float64),
				Status:       string(module.Status.ModuleProgressStatus),
			}

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

	case "markdown":
		markdownContent, err := r.queries.GetMarkdownSection(ctx, section.ID)
		if err != nil {
			log.WithError(err).Error("failed to get markdown section content")
			return nil, fmt.Errorf("failed to get markdown section content: %w", err)
		}
		result = &models.MarkdownSection{
			BaseModel: models.BaseModel{
				ID:        int64(section.ID),
				CreatedAt: section.CreatedAt,
				UpdatedAt: section.UpdatedAt,
			},
			Type:     section.Type,
			Position: int16(section.Position),
			Content: models.MarkdownContent{
				Markdown: markdownContent,
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
	tx, err := r.db.BeginTx(ctx, nil)
	if err != nil {
		return 0, 0, fmt.Errorf("failed to begin transaction: %w", err)
	}
	defer tx.Rollback()

	qtx := r.queries.WithTx(tx)

	if err := qtx.StartCourseUserCourses(ctx, gen.StartCourseUserCoursesParams{
		UserID:   int32(userID),
		CourseID: courseID,
	}); err != nil {
		return 0, 0, fmt.Errorf("failed to start course: %w", err)
	}

	firstUnitAndModule, err := qtx.GetFirstUnitAndModuleInCourse(ctx, courseID)
	if err != nil {
		return 0, 0, fmt.Errorf("failed to get first module: %w", err)
	}

	if err := qtx.InitializeModuleProgress(ctx, gen.InitializeModuleProgressParams{
		UserID:   int32(userID),
		ModuleID: firstUnitAndModule.ModuleID,
	}); err != nil {
		return 0, 0, fmt.Errorf("failed to initialize module progress: %w", err)
	}

	if err := tx.Commit(); err != nil {
		return 0, 0, fmt.Errorf("failed to commit transaction: %w", err)
	}

	return firstUnitAndModule.UnitID, firstUnitAndModule.ModuleID, nil
}

func (r *courseService) CreateCourse(ctx context.Context, course models.Course) (*models.Course, error) {
	log := r.log.WithBaseFields(logger.Service, "CreateCourse")

	courseID, err := r.queries.CreateCourse(ctx, gen.CreateCourseParams{
		Name:            course.Name,
		Description:     course.Description,
		Requirements:    course.Requirements,
		WhatYouLearn:    course.WhatYouLearn,
		BackgroundColor: course.BackgroundColor,
		IconUrl:         course.IconURL,
		Duration:        int32(course.Duration),
		DifficultyLevel: gen.DifficultyLevel(course.DifficultyLevel),
		Rating:          float64(course.Rating),
	})
	if err != nil {
		log.WithError(err).Error("failed to create course")
		return nil, fmt.Errorf("failed to create course: %w", err)
	}

	return r.GetCourseByID(ctx, courseID)
}

func (r *courseService) GetCourseByID(ctx context.Context, courseID int32) (*models.Course, error) {
	course, err := r.queries.GetCourseByID(ctx, int32(courseID))
	if err != nil {
		return nil, fmt.Errorf("failed to get course by id: %w", err)
	}
	return &models.Course{
		BaseModel: models.BaseModel{
			ID:        int64(course.ID),
			CreatedAt: course.CreatedAt,
			UpdatedAt: course.UpdatedAt,
		},
		Name:            course.Name,
		Description:     course.Description,
		Requirements:    nullStringToString(course.Requirements),
		WhatYouLearn:    nullStringToString(course.WhatYouLearn),
		BackgroundColor: nullStringToString(course.BackgroundColor),
		IconURL:         nullStringToString(course.IconUrl),
		Duration:        nullInt32ToInt16(course.Duration),
		DifficultyLevel: models.DifficultyLevel(course.DifficultyLevel.DifficultyLevel),
		Rating:          course.Rating.Float64,
	}, nil
}

func (r *courseService) UpdateCourse(ctx context.Context, course models.Course) error {
	log := r.log.WithBaseFields(logger.Service, "UpdateCourse")

	if err := r.queries.UpdateCourse(ctx, gen.UpdateCourseParams{
		CourseID:        int32(course.ID),
		Name:            course.Name,
		Description:     course.Description,
		Requirements:    course.Requirements,
		WhatYouLearn:    course.WhatYouLearn,
		BackgroundColor: course.BackgroundColor,
		IconUrl:         course.IconURL,
		Duration:        int32(course.Duration),
		DifficultyLevel: gen.DifficultyLevel(course.DifficultyLevel),
		Rating:          float64(course.Rating),
	}); err != nil {
		log.WithError(err).Error("failed to update course")
		return fmt.Errorf("failed to update course: %w", err)
	}

	return nil
}

func (r *courseService) PublishCourse(ctx context.Context, courseID int64) error {
	log := r.log.WithBaseFields(logger.Service, "PublishCourse")

	if err := r.queries.PublishCourse(ctx, int32(courseID)); err != nil {
		log.WithError(err).Error("failed to publish course")
		return fmt.Errorf("failed to publish course: %w", err)
	}

	return nil
}

func (r *courseService) DeleteCourse(ctx context.Context, id int64) error {
	log := r.log.WithBaseFields(logger.Service, "DeleteCourse")

	if id <= 0 {
		return fmt.Errorf("invalid course ID: %d", id)
	}

	tx, err := r.db.BeginTx(ctx, nil)
	if err != nil {
		log.WithError(err).Error("failed to begin transaction")
		return fmt.Errorf("failed to begin transaction: %w", err)
	}
	defer tx.Rollback()

	qtx := r.queries.WithTx(tx)

	if err = qtx.DeleteSectionProgress(ctx, gen.DeleteSectionProgressParams{
		UserID:   0, // Delete for all users
		CourseID: int32(id),
	}); err != nil {
		log.WithError(err).Error("failed to delete section progress")
		return fmt.Errorf("failed to delete section progress: %w", err)
	}

	if err = qtx.DeleteModuleProgress(ctx, gen.DeleteModuleProgressParams{
		UserID:   0, // Delete for all users
		CourseID: int32(id),
	}); err != nil {
		log.WithError(err).Error("failed to delete module progress")
		return fmt.Errorf("failed to delete module progress: %w", err)
	}

	if err = qtx.DeleteCourse(ctx, int32(id)); err != nil {
		log.WithError(err).Error("failed to delete course")
		return fmt.Errorf("failed to delete course: %w", err)
	}

	if err = tx.Commit(); err != nil {
		log.WithError(err).Error("failed to commit transaction")
		return fmt.Errorf("failed to commit transaction: %w", err)
	}

	return nil
}

func (r *courseService) ResetCourseProgress(ctx context.Context, userID int64, courseID int64) error {
	log := r.log.WithBaseFields(logger.Service, "ResetCourseProgress")

	if userID <= 0 {
		return fmt.Errorf("invalid user ID: %d", userID)
	}
	if courseID <= 0 {
		return fmt.Errorf("invalid course ID: %d", courseID)
	}

	tx, err := r.db.BeginTx(ctx, nil)
	if err != nil {
		log.WithError(err).Error("failed to begin transaction")
		return fmt.Errorf("failed to begin transaction: %w", err)
	}
	defer tx.Rollback()

	qtx := r.queries.WithTx(tx)

	if err := qtx.DeleteUserCourse(ctx, gen.DeleteUserCourseParams{
		UserID:   int32(userID),
		CourseID: int32(courseID),
	}); err != nil {
		log.WithError(err).Error("failed to delete user course")
		return fmt.Errorf("failed to delete user course: %w", err)
	}

	if err = qtx.DeleteSectionProgress(ctx, gen.DeleteSectionProgressParams{
		UserID:   int32(userID),
		CourseID: int32(courseID),
	}); err != nil {
		log.WithError(err).Error("failed to delete section progress")
		return fmt.Errorf("failed to delete section progress: %w", err)
	}

	if err = qtx.DeleteModuleProgress(ctx, gen.DeleteModuleProgressParams{
		UserID:   int32(userID),
		CourseID: int32(courseID),
	}); err != nil {
		log.WithError(err).Error("failed to delete module progress")
		return fmt.Errorf("failed to delete module progress: %w", err)
	}

	if err = tx.Commit(); err != nil {
		log.WithError(err).Error("failed to commit transaction")
		return fmt.Errorf("failed to commit transaction: %w", err)
	}

	return nil
}

func (r *courseService) SearchCourses(ctx context.Context, query string, page int, pageSize int, useFullText bool) (int64, []models.Course, error) {
	log := r.log.WithBaseFields(logger.Service, "SearchCourses")

	if page <= 0 {
		return 0, nil, fmt.Errorf("invalid page number: %d", page)
	}
	if pageSize <= 0 {
		return 0, nil, fmt.Errorf("invalid page size: %d", pageSize)
	}

	offset := (page - 1) * pageSize
	searchQuery := "%" + query + "%"

	var courses []models.Course
	var totalCount int64

	if useFullText {
		results, err := r.queries.SearchCoursesFullText(ctx, gen.SearchCoursesFullTextParams{
			SearchQuery: query,
			PageLimit:   int32(pageSize),
			PageOffset:  int32(offset),
		})
		if err != nil {
			log.WithError(err).Error("failed to search courses")
			return 0, nil, fmt.Errorf("failed to search courses: %w", err)
		}

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
			r.enrichCourseWithMetadata(ctx, &course, result.ID)
			courses = append(courses, course)
		}
	} else {
		results, err := r.queries.SearchCourses(ctx, gen.SearchCoursesParams{
			SearchQuery: searchQuery,
			PageLimit:   int32(pageSize),
			PageOffset:  int32(offset),
		})
		if err != nil {
			log.WithError(err).Error("failed to search courses")
			return 0, nil, fmt.Errorf("failed to search courses: %w", err)
		}

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
			r.enrichCourseWithMetadata(ctx, &course, result.ID)
			courses = append(courses, course)
		}
	}

	return totalCount, courses, nil
}

func (r *courseService) enrichCourseWithMetadata(ctx context.Context, course *models.Course, courseID int32) {
	if authors, err := r.queries.GetCourseAuthors(ctx, courseID); err == nil {
		course.Authors = make([]models.Author, len(authors))
		for i, author := range authors {
			course.Authors[i] = models.Author{
				ID:   int64(author.ID),
				Name: author.FirstName.String + " " + author.LastName.String,
			}
		}
	}

	if tags, err := r.queries.GetCourseTags(ctx, courseID); err == nil {
		course.Tags = make([]models.Tag, len(tags))
		for i, tag := range tags {
			course.Tags[i] = models.Tag{
				ID:   int64(tag.ID),
				Name: tag.Name,
			}
		}
	}
}
