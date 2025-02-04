package service

import (
	gen "algolearn/internal/database/generated"
	httperr "algolearn/internal/errors"
	"algolearn/internal/models"
	"algolearn/pkg/logger"
	"context"
	"database/sql"
	"encoding/json"
	"errors"
	"fmt"
	"time"

	"github.com/sirupsen/logrus"
)

type ModuleService interface {
	GetModulesByUnitID(ctx context.Context, unitID int64) ([]models.Module, error)
	GetModulesCount(ctx context.Context) (int64, error)
	GetModuleWithProgress(ctx context.Context, userID, courseID, unitID, moduleID int64) (*ModuleWithProgressResponse, error)
	GetModulesWithProgress(ctx context.Context, userID, unitID int64, page, pageSize int) ([]models.Module, error)
	GetModuleTotalCount(ctx context.Context, unitID int64) (int64, error)
	CreateModule(ctx context.Context, unitID int64, name, description string) (*models.Module, error)
	CreateModuleWithContent(ctx context.Context, unitID int64, name, description string, sections []models.Section) (*models.Module, error)
	UpdateModule(ctx context.Context, moduleID int64, name, description string) (*models.Module, error)
	DeleteModule(ctx context.Context, moduleID int64) error
	SaveModuleProgress(ctx context.Context, userID, moduleID int64, sections []models.SectionProgress, questions []models.QuestionProgress) error
}

type moduleService struct {
	queries *gen.Queries
	db      *sql.DB
	log     *logger.Logger
}

func NewModuleService(db *sql.DB) ModuleService {
	return &moduleService{
		queries: gen.New(db),
		db:      db,
		log:     logger.Get(),
	}
}

func (s *moduleService) GetModulesByUnitID(ctx context.Context, unitID int64) ([]models.Module, error) {
	log := s.log.WithBaseFields(logger.Service, "GetModulesByUnitID")

	result, err := s.queries.GetModulesByUnitId(ctx, int32(unitID))
	if err != nil {
		log.WithError(err).Error("failed to get modules by unit id")
		return nil, fmt.Errorf("failed to get modules by unit id: %w", err)
	}

	modules := make([]models.Module, len(result))
	for i, m := range result {
		modules[i] = models.Module{
			BaseModel: models.BaseModel{
				ID:        int64(m.ID),
				CreatedAt: m.CreatedAt,
				UpdatedAt: m.UpdatedAt,
			},
		}
	}

	return modules, nil
}

func (s *moduleService) GetModulesCount(ctx context.Context) (int64, error) {
	log := s.log.WithBaseFields(logger.Service, "GetModulesCount")

	count, err := s.queries.GetModulesCount(ctx)
	if err != nil {
		log.WithError(err).Error("failed to get module total count")
		return 0, fmt.Errorf("failed to get module total count: %w", err)
	}
	return count, nil
}

type ModuleWithProgressResponse struct {
	Module           models.Module `json:"module"`
	NextModuleID     int32         `json:"nextModuleId"`
	PrevModuleID     int32         `json:"prevModuleId"`
	NextUnitID       int32         `json:"nextUnitId"`
	PrevUnitID       int32         `json:"prevUnitId"`
	NextUnitModuleID int32         `json:"nextUnitModuleId"`
	PrevUnitModuleID int32         `json:"prevUnitModuleId"`
}

func (s *moduleService) GetModuleWithProgress(ctx context.Context, userID, courseID, unitID, moduleID int64) (*ModuleWithProgressResponse, error) {
	log := s.log.WithBaseFields(logger.Service, "GetModuleWithProgress").WithFields(logrus.Fields{
		"course_id": courseID,
		"unit_id":   unitID,
		"module_id": moduleID,
	})

	moduleData, err := s.queries.GetModuleWithProgress(ctx, gen.GetModuleWithProgressParams{
		UserID:   int32(userID),
		UnitID:   int32(unitID),
		ModuleID: int32(moduleID),
	})
	if err != nil {
		if errors.Is(err, sql.ErrNoRows) {
			return nil, httperr.ErrNotFound
		}
		log.WithError(err).Error("failed to get module with progress")
		return nil, fmt.Errorf("failed to get module with progress: %w", err)
	}

	var module models.Module
	if err := json.Unmarshal(moduleData, &module); err != nil {
		log.WithError(err).Error("failed to unmarshal module")
		return nil, fmt.Errorf("failed to unmarshal module: %w", err)
	}

	sections, err := s.queries.GetSingleModuleSections(ctx, gen.GetSingleModuleSectionsParams{
		UserID:   int32(userID),
		ModuleID: int32(moduleID),
	})
	if err != nil {
		log.WithError(err).Error("failed to get module sections")
		return nil, fmt.Errorf("failed to get module sections: %w", err)
	}

	progress, err := s.queries.GetSectionProgress(ctx, gen.GetSectionProgressParams{
		UserID:   int32(userID),
		ModuleID: int32(moduleID),
	})
	if err != nil && !errors.Is(err, sql.ErrNoRows) {
		log.WithError(err).Error("failed to get section progress")
		return nil, fmt.Errorf("failed to get section progress: %w", err)
	}

	progressMap := make(map[int32]json.RawMessage)
	for _, p := range progress {
		progressMap[p.SectionID] = p.Progress
	}

	module.Sections = make([]models.SectionInterface, len(sections))
	for i, s := range sections {
		var section models.Section
		if err := json.Unmarshal([]byte(s.Content), &section.Content); err != nil {
			log.WithError(err).Error("failed to unmarshal section content")
			return nil, fmt.Errorf("failed to unmarshal section content: %w", err)
		}

		section.ID = int64(s.ID)
		section.CreatedAt = s.CreatedAt
		section.UpdatedAt = s.UpdatedAt
		section.Type = models.SectionType(s.Type)

		section.Position = int16(s.Position)

		if progress, ok := progressMap[s.ID]; ok {
			if err := json.Unmarshal(progress, &section.Progress); err != nil {
				log.WithError(err).Error("failed to unmarshal section progress")
				return nil, fmt.Errorf("failed to unmarshal section progress: %w", err)
			}
		}

		module.Sections[i] = &section
	}

	nextModuleID, err := s.queries.GetNextModuleId(ctx, gen.GetNextModuleIdParams{
		UnitID:       int32(unitID),
		ModuleNumber: int32(module.ModuleNumber),
	})
	if err != nil && !errors.Is(err, sql.ErrNoRows) {
		log.WithError(err).Error("failed to get next module id")
		return nil, fmt.Errorf("failed to get next module id: %w", err)
	}

	prevModuleID, err := s.queries.GetPrevModuleId(ctx, gen.GetPrevModuleIdParams{
		UnitID:       int32(unitID),
		ModuleNumber: int32(module.ModuleNumber),
	})
	if err != nil && !errors.Is(err, sql.ErrNoRows) {
		log.WithError(err).Error("failed to get prev module id")
		return nil, fmt.Errorf("failed to get prev module id: %w", err)
	}

	unitNumber, err := s.queries.GetUnitNumber(ctx, int32(unitID))
	if err != nil && !errors.Is(err, sql.ErrNoRows) {
		log.WithError(err).Error("failed to get unit number")
		return nil, fmt.Errorf("failed to get unit number: %w", err)
	}

	nextUnitID, err := s.queries.GetNextUnitId(ctx, gen.GetNextUnitIdParams{
		CourseID:   int32(courseID),
		UnitNumber: int32(unitNumber),
	})
	if err != nil && !errors.Is(err, sql.ErrNoRows) {
		log.WithError(err).Error("failed to get next unit id")
		return nil, fmt.Errorf("failed to get next unit id: %w", err)
	}

	prevUnitID, err := s.queries.GetPrevUnitId(ctx, gen.GetPrevUnitIdParams{
		CourseID:   int32(courseID),
		UnitNumber: int32(unitNumber),
	})
	if err != nil && !errors.Is(err, sql.ErrNoRows) {
		log.WithError(err).Error("failed to get prev unit id")
		return nil, fmt.Errorf("failed to get prev unit id: %w", err)
	}

	nextUnitModuleID, err := s.queries.GetNextUnitModuleId(ctx, int32(nextUnitID))
	if err != nil && !errors.Is(err, sql.ErrNoRows) {
		log.WithError(err).Error("failed to get next unit module id")
		return nil, fmt.Errorf("failed to get next unit module id: %w", err)
	}

	prevUnitModuleID, err := s.queries.GetPrevUnitModuleId(ctx, int32(prevUnitID))
	if err != nil && !errors.Is(err, sql.ErrNoRows) {
		log.WithError(err).Error("failed to get prev unit module id")
		return nil, fmt.Errorf("failed to get prev unit module id: %w", err)
	}

	response := &ModuleWithProgressResponse{
		Module:           module,
		NextModuleID:     nextModuleID,
		PrevModuleID:     prevModuleID,
		NextUnitID:       nextUnitID,
		PrevUnitID:       prevUnitID,
		NextUnitModuleID: nextUnitModuleID,
		PrevUnitModuleID: prevUnitModuleID,
	}
	return response, nil
}

func (s *moduleService) GetModulesWithProgress(ctx context.Context, userID, unitID int64, page, pageSize int) ([]models.Module, error) {
	log := s.log.WithBaseFields(logger.Service, "GetModulesWithProgress")

	modules, err := s.queries.GetModulesList(ctx, gen.GetModulesListParams{
		UserID:     int32(userID),
		UnitID:     int32(unitID),
		PageSize:   int32(pageSize),
		PageOffset: int32((page - 1) * pageSize),
	})
	if err != nil {
		log.WithError(err).Error("failed to get modules list")
		return nil, fmt.Errorf("failed to get modules list: %w", err)
	}

	result := make([]models.Module, len(modules))
	for i, m := range modules {
		var progress struct {
			Progress             float32   `json:"progress"`
			Status               string    `json:"status"`
			StartedAt            time.Time `json:"startedAt"`
			CompletedAt          time.Time `json:"completedAt,omitempty"`
			LastAccessed         time.Time `json:"lastAccessed"`
			CurrentSectionNumber int32     `json:"currentSectionNumber,omitempty"`
		}
		if err := json.Unmarshal(m.ModuleProgress, &progress); err != nil {
			log.WithError(err).Error("failed to unmarshal module progress")
			return nil, fmt.Errorf("failed to unmarshal module progress: %w", err)
		}

		result[i] = models.Module{
			BaseModel: models.BaseModel{
				ID:        int64(m.ID),
				CreatedAt: m.CreatedAt,
				UpdatedAt: m.UpdatedAt,
			},
			ModuleNumber:         int16(m.ModuleNumber),
			Name:                 m.Name,
			Description:          m.Description,
			Progress:             progress.Progress,
			Status:               progress.Status,
			StartedAt:            progress.StartedAt,
			CompletedAt:          progress.CompletedAt,
			LastAccessed:         progress.LastAccessed,
			CurrentSectionNumber: progress.CurrentSectionNumber,
			Sections:             make([]models.SectionInterface, 0),
		}
	}

	return result, nil
}

func (s *moduleService) GetModuleTotalCount(ctx context.Context, unitID int64) (int64, error) {
	log := s.log.WithBaseFields(logger.Service, "GetModuleTotalCount")

	count, err := s.queries.GetModuleTotalCountByUnitId(ctx, int32(unitID))
	if err != nil {
		log.WithError(err).Error("failed to get module total count")
		return 0, fmt.Errorf("failed to get module total count: %w", err)
	}
	return count, nil
}

func (s *moduleService) CreateModule(ctx context.Context, unitID int64, name, description string) (*models.Module, error) {
	log := s.log.WithBaseFields(logger.Service, "CreateModule")

	tx, err := s.db.BeginTx(ctx, nil)
	if err != nil {
		log.WithError(err).Error("failed to begin transaction")
		return nil, fmt.Errorf("failed to begin transaction: %w", err)
	}
	defer tx.Rollback()

	qtx := s.queries.WithTx(tx)

	lastNumber, err := qtx.GetLastModuleNumber(ctx, int32(unitID))
	if err != nil {
		log.WithError(err).Error("failed to get last module number")
		return nil, fmt.Errorf("failed to get last module number: %w", err)
	}

	module, err := qtx.InsertModule(ctx, gen.InsertModuleParams{
		ModuleNumber: int32(lastNumber.(int64)) + 1,
		UnitID:       int32(unitID),
		Name:         name,
		Description:  description,
	})
	if err != nil {
		log.WithError(err).Error("failed to insert module")
		return nil, fmt.Errorf("failed to insert module: %w", err)
	}

	if err = tx.Commit(); err != nil {
		log.WithError(err).Error("failed to commit transaction")
		return nil, fmt.Errorf("failed to commit transaction: %w", err)
	}

	return &models.Module{
		BaseModel: models.BaseModel{
			ID:        int64(module.ID),
			CreatedAt: module.CreatedAt,
			UpdatedAt: module.UpdatedAt,
		},
		ModuleNumber: int16(module.ModuleNumber),
		Name:         module.Name,
		Description:  module.Description,
		Sections:     make([]models.SectionInterface, 0),
	}, nil
}

func (s *moduleService) UpdateModule(ctx context.Context, moduleID int64, name, description string) (*models.Module, error) {
	log := s.log.WithBaseFields(logger.Service, "UpdateModule")

	module, err := s.queries.UpdateModule(ctx, gen.UpdateModuleParams{
		ModuleID:    int32(moduleID),
		Name:        name,
		Description: description,
	})
	if err != nil {
		log.WithError(err).Error("failed to update module")
		return nil, fmt.Errorf("failed to update module: %w", err)
	}

	return &models.Module{
		BaseModel: models.BaseModel{
			ID:        int64(module.ID),
			CreatedAt: module.CreatedAt,
			UpdatedAt: module.UpdatedAt,
		},
		ModuleNumber: int16(module.ModuleNumber),
		Name:         module.Name,
		Description:  module.Description,
		Sections:     make([]models.SectionInterface, 0),
	}, nil
}

func (s *moduleService) DeleteModule(ctx context.Context, moduleID int64) error {
	log := s.log.WithBaseFields(logger.Service, "DeleteModule")

	err := s.queries.DeleteModule(ctx, int32(moduleID))
	if err != nil {
		log.WithError(err).Error("failed to delete module")
		return fmt.Errorf("failed to delete module: %w", err)
	}
	return nil
}

func (s *moduleService) SaveModuleProgress(ctx context.Context, userID, moduleID int64, sections []models.SectionProgress, questions []models.QuestionProgress) error {
	log := s.log.WithBaseFields(logger.Service, "SaveModuleProgress")

	tx, err := s.db.BeginTx(ctx, nil)
	if err != nil {
		log.WithError(err).Error("failed to begin transaction")
		return fmt.Errorf("failed to begin transaction: %w", err)
	}
	defer tx.Rollback()

	qtx := s.queries.WithTx(tx)

	ids, err := qtx.GetCourseAndUnitIDs(ctx, int32(moduleID))
	if err != nil {
		log.WithError(err).Error("failed to get course and unit IDs")
		return fmt.Errorf("failed to get course and unit IDs: %w", err)
	}

	var progress float32
	progressID, err := qtx.UpsertUserModuleProgress(ctx, gen.UpsertUserModuleProgressParams{
		UserID:   int32(userID),
		ModuleID: int32(moduleID),
	})
	if err != nil {
		log.WithError(err).Error("failed to upsert module progress")
		return fmt.Errorf("failed to upsert module progress: %w", err)
	}

	for _, section := range sections {
		err = qtx.UpsertSectionProgress(ctx, gen.UpsertSectionProgressParams{
			UserID:    int32(userID),
			ModuleID:  int32(moduleID),
			SectionID: int32(section.SectionID),
			HasSeen:   section.HasSeen,
			SeenAt:    sql.NullTime{Time: section.SeenAt, Valid: !section.SeenAt.IsZero()},
		})
		if err != nil {
			log.WithError(err).Error("failed to upsert section progress")
			return fmt.Errorf("failed to upsert section progress: %w", err)
		}
	}

	for _, question := range questions {
		var optionID int32
		if question.OptionID != nil {
			optionID = int32(*question.OptionID)
		}
		err = qtx.UpsertQuestionAnswer(ctx, gen.UpsertQuestionAnswerParams{
			UserModuleProgressID: progressID,
			QuestionID:           int32(question.QuestionID),
			OptionID:             optionID,
			IsCorrect:            question.IsCorrect != nil && *question.IsCorrect,
		})
		if err != nil {
			log.WithError(err).Error("failed to upsert question answer")
			return fmt.Errorf("failed to upsert question answer: %w", err)
		}
	}

	moduleProgressResult, err := qtx.CalculateModuleProgress(ctx, gen.CalculateModuleProgressParams{
		UserID:               int32(userID),
		UserModuleProgressID: progressID,
		ModuleID:             int32(moduleID),
	})
	if err != nil {
		log.WithError(err).Error("failed to calculate module progress")
		return fmt.Errorf("failed to calculate module progress: %w", err)
	}

	progress = float32(moduleProgressResult.(float64))

	_, err = qtx.UpsertUserModuleProgress(ctx, gen.UpsertUserModuleProgressParams{
		UserID:   int32(userID),
		ModuleID: int32(moduleID),
	})
	if err != nil {
		log.WithError(err).Error("failed to update module progress")
		return fmt.Errorf("failed to update module progress: %w", err)
	}

	if progress >= 100 {
		courseProgressResult, err := qtx.CalculateCourseProgress(ctx, gen.CalculateCourseProgressParams{
			UserID:   int32(userID),
			CourseID: ids.CourseID,
		})
		if err != nil {
			log.WithError(err).Error("failed to calculate course progress")
			return fmt.Errorf("failed to calculate course progress: %w", err)
		}

		courseProgress := float64(courseProgressResult.(float64))

		err = qtx.UpsertUserCourse(ctx, gen.UpsertUserCourseParams{
			UserID:   int32(userID),
			CourseID: ids.CourseID,
			Progress: courseProgress,
		})
		if err != nil {
			log.WithError(err).Error("failed to upsert user course")
			return fmt.Errorf("failed to upsert user course: %w", err)
		}
	}

	if err = tx.Commit(); err != nil {
		log.WithError(err).Error("failed to commit transaction")
		return fmt.Errorf("failed to commit transaction: %w", err)
	}

	return nil
}

func (s *moduleService) CreateModuleWithContent(ctx context.Context, unitID int64, name, description string, sections []models.Section) (*models.Module, error) {
	log := s.log.WithBaseFields(logger.Service, "CreateModuleWithContent")

	tx, err := s.db.BeginTx(ctx, nil)
	if err != nil {
		log.WithError(err).Error("failed to begin transaction")
		return nil, fmt.Errorf("failed to begin transaction: %w", err)
	}
	defer tx.Rollback()

	qtx := s.queries.WithTx(tx)

	lastNumberResult, err := qtx.GetLastModuleNumber(ctx, int32(unitID))
	if err != nil {
		log.WithError(err).Error("failed to get last module number")
		return nil, fmt.Errorf("failed to get last module number: %w", err)
	}

	lastNumber := lastNumberResult.(int64)

	module, err := qtx.InsertModule(ctx, gen.InsertModuleParams{
		ModuleNumber: int32(lastNumber + 1),
		UnitID:       int32(unitID),
		Name:         name,
		Description:  description,
	})
	if err != nil {
		log.WithError(err).Error("failed to insert module")
		return nil, fmt.Errorf("failed to insert module: %w", err)
	}

	for _, section := range sections {
		createdSection, err := qtx.InsertSection(ctx, gen.InsertSectionParams{
			ModuleID:    module.ID,
			SectionType: gen.SectionType(section.Type),
			Position:    int32(section.Position),
		})
		if err != nil {
			log.WithError(err).Error("failed to insert section")
			return nil, fmt.Errorf("failed to insert section: %w", err)
		}

		switch section.Type {
		case "markdown":
			var content models.MarkdownContent
			if err := json.Unmarshal(section.Content, &content); err != nil {
				return nil, fmt.Errorf("failed to unmarshal text content: %w", err)
			}
			err = qtx.InsertMarkdownSection(ctx, gen.InsertMarkdownSectionParams{
				SectionID: createdSection.ID,
				Markdown:  content.Markdown,
			})
			if err != nil {
				log.WithError(err).Error("failed to insert text section")
				return nil, fmt.Errorf("failed to insert text section: %w", err)
			}

		case "code":
			var content models.CodeContent
			if err := json.Unmarshal(section.Content, &content); err != nil {
				return nil, fmt.Errorf("failed to unmarshal code content: %w", err)
			}

			sectionParams := gen.InsertCodeSectionParams{
				SectionID: createdSection.ID,
				Code:      content.Code,
			}

			if content.Language != "" {
				sectionParams.Language = sql.NullString{String: content.Language, Valid: true}
			}

			err = qtx.InsertCodeSection(ctx, sectionParams)
			if err != nil {
				log.WithError(err).Error("failed to insert code section")
				return nil, fmt.Errorf("failed to insert code section: %w", err)
			}

		case "question":
			var content models.QuestionContent
			if err := json.Unmarshal(section.Content, &content); err != nil {
				return nil, fmt.Errorf("failed to unmarshal question content: %w", err)
			}

			question, err := qtx.InsertQuestion(ctx, gen.InsertQuestionParams{
				Type:            content.Type,
				Question:        content.Question,
				DifficultyLevel: gen.NullDifficultyLevel{DifficultyLevel: "beginner", Valid: true},
			})
			if err != nil {
				log.WithError(err).Error("failed to insert question")
				return nil, fmt.Errorf("failed to insert question: %w", err)
			}

			err = qtx.InsertQuestionSection(ctx, gen.InsertQuestionSectionParams{
				SectionID:  createdSection.ID,
				QuestionID: question.ID,
			})
			if err != nil {
				log.WithError(err).Error("failed to insert question section")
				return nil, fmt.Errorf("failed to insert question section: %w", err)
			}

			for _, opt := range content.Options {
				err = qtx.InsertQuestionOption(ctx, gen.InsertQuestionOptionParams{
					QuestionID: question.ID,
					Content:    opt.Content,
					IsCorrect:  opt.IsCorrect,
				})
				if err != nil {
					log.WithError(err).Error("failed to insert question option")
					return nil, fmt.Errorf("failed to insert question option: %w", err)
				}
			}

			for _, tagName := range content.Tags {
				tagID, err := qtx.InsertTag(ctx, tagName)
				if err != nil {
					log.WithError(err).Error("failed to insert tag")
					return nil, fmt.Errorf("failed to insert tag: %w", err)
				}

				err = qtx.InsertQuestionTag(ctx, gen.InsertQuestionTagParams{
					QuestionID: question.ID,
					TagID:      tagID,
				})
				if err != nil {
					log.WithError(err).Error("failed to insert question tag")
					return nil, fmt.Errorf("failed to insert question tag: %w", err)
				}
			}

		case "video":
			var content models.VideoContent
			if err := json.Unmarshal(section.Content, &content); err != nil {
				return nil, fmt.Errorf("failed to unmarshal video content: %w", err)
			}
			err = qtx.InsertVideoSection(ctx, gen.InsertVideoSectionParams{
				SectionID: createdSection.ID,
				Url:       content.URL,
			})
			if err != nil {
				log.WithError(err).Error("failed to insert video section")
				return nil, fmt.Errorf("failed to insert video section: %w", err)
			}
		}

	}

	if err = tx.Commit(); err != nil {
		log.WithError(err).Error("failed to commit transaction")
		return nil, fmt.Errorf("failed to commit transaction: %w", err)
	}

	return &models.Module{
		BaseModel: models.BaseModel{
			ID:        int64(module.ID),
			CreatedAt: module.CreatedAt,
			UpdatedAt: module.UpdatedAt,
		},
		ModuleNumber: int16(module.ModuleNumber),
		Name:         module.Name,
		Description:  module.Description,
		Sections:     make([]models.SectionInterface, 0),
	}, nil
}
