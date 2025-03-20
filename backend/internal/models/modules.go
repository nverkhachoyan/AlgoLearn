package models

import (
	"encoding/json"
	"fmt"
	"time"

	"github.com/google/uuid"

	"errors"
)

type ModuleQueryParams struct {
	Type   string
	Filter string
}

type ModulePayload struct {
	Module        Module `json:"module"`
	NextModuleID  int64  `json:"nextModuleId"`
	HasNextModule bool   `json:"hasNextModule"`
}

type Module struct {
	BaseModel
	FolderObjectKey      uuid.NullUUID      `json:"folderObjectKey"`
	ImgKey               uuid.NullUUID      `json:"imgKey"`
	MediaExt             string             `json:"mediaExt"`
	ModuleNumber         int16              `json:"moduleNumber"`
	Name                 string             `json:"name"`
	Description          string             `json:"description"`
	Progress             float32            `json:"progress"`
	Status               string             `json:"status"`
	StartedAt            time.Time          `json:"startedAt"`
	CompletedAt          time.Time          `json:"completedAt,omitempty"`
	LastAccessed         time.Time          `json:"lastAccessed"`
	CurrentSectionNumber int32              `json:"currentSectionNumber,omitempty"`
	Sections             []SectionInterface `json:"sections"`
}

func (m *Module) UnmarshalJSON(data []byte) error {
	type TempModule struct {
		BaseModel
		FolderObjectKey uuid.NullUUID     `json:"folderObjectKey"`
		ImgKey          uuid.NullUUID     `json:"imgKey"`
		MediaExt        string            `json:"mediaExt"`
		ModuleNumber    int16             `json:"moduleNumber"`
		Name            string            `json:"name"`
		Description     string            `json:"description"`
		Progress        float32           `json:"progress"`
		Status          string            `json:"status"`
		StartedAt       time.Time         `json:"startedAt"`
		CompletedAt     time.Time         `json:"completedAt,omitempty"`
		LastAccessed    time.Time         `json:"lastAccessed"`
		Sections        []json.RawMessage `json:"sections"`
	}

	var temp TempModule
	if err := json.Unmarshal(data, &temp); err != nil {
		return fmt.Errorf("failed to unmarshal module: %w", err)
	}

	m.BaseModel = temp.BaseModel
	m.FolderObjectKey = temp.FolderObjectKey
	m.ImgKey = temp.ImgKey
	m.MediaExt = temp.MediaExt
	m.ModuleNumber = temp.ModuleNumber
	m.Name = temp.Name
	m.Description = temp.Description
	m.Progress = temp.Progress
	m.Status = temp.Status
	m.StartedAt = temp.StartedAt
	m.CompletedAt = temp.CompletedAt
	m.LastAccessed = temp.LastAccessed

	m.Sections = make([]SectionInterface, 0, len(temp.Sections))
	for _, rawSection := range temp.Sections {
		var baseSection struct {
			Type string `json:"type"`
		}
		if err := json.Unmarshal(rawSection, &baseSection); err != nil {
			return fmt.Errorf("failed to unmarshal section type: %w", err)
		}

		var section SectionInterface
		switch baseSection.Type {
		case "markdown":
			var s MarkdownSection
			if err := json.Unmarshal(rawSection, &s); err != nil {
				return fmt.Errorf("failed to unmarshal markdown section: %w", err)
			}
			section = &s
		case "code":
			var s CodeSection
			if err := json.Unmarshal(rawSection, &s); err != nil {
				return fmt.Errorf("failed to unmarshal code section: %w", err)
			}
			section = &s
		case "question":
			var s QuestionSection
			if err := json.Unmarshal(rawSection, &s); err != nil {
				return fmt.Errorf("failed to unmarshal question section: %w", err)
			}
			section = &s
		case "video":
			var s VideoSection
			if err := json.Unmarshal(rawSection, &s); err != nil {
				return fmt.Errorf("failed to unmarshal video section: %w", err)
			}
			section = &s
		case "lottie":
			var s LottieSection
			if err := json.Unmarshal(rawSection, &s); err != nil {
				return fmt.Errorf("failed to unmarshal lottie section: %w", err)
			}
			section = &s
		default:
			return fmt.Errorf("unknown section type: %s", baseSection.Type)
		}

		m.Sections = append(m.Sections, section)
	}

	return nil
}

func (m *Module) Validate() error {
	positions := make(map[int16]bool)
	for _, section := range m.Sections {
		position := section.GetPosition()
		if position < 0 {
			return errors.New("section position must be positive")
		}

		if positions[position] {
			return errors.New("duplicate position")
		}
		positions[position] = true
	}

	return nil
}

type SectionType string

const (
	SectionTypeMarkdown SectionType = "markdown"
	SectionTypeCode     SectionType = "code"
	SectionTypeQuestion SectionType = "question"
	SectionTypeVideo    SectionType = "video"
	SectionTypeImage    SectionType = "image"
	SectionTypeLottie   SectionType = "lottie"
)

type SectionInterface interface {
	GetType() SectionType
	GetPosition() int16
}

type SectionProgress struct {
	SectionID   int64     `json:"sectionId"`
	SeenAt      time.Time `json:"seenAt,omitempty"`
	HasSeen     bool      `json:"hasSeen"`
	StartedAt   time.Time `json:"startedAt,omitempty"`
	CompletedAt time.Time `json:"completedAt,omitempty"`
	Progress    float32   `json:"progress"`
}

type QuestionProgress struct {
	QuestionID  int64     `json:"questionId"`
	OptionID    *int64    `json:"optionId"`
	HasAnswered bool      `json:"hasAnswered"`
	IsCorrect   *bool     `json:"isCorrect,omitempty"`
	AnsweredAt  time.Time `json:"answeredAt"`
	Progress    float32   `json:"progress"`
}

type BatchModuleProgress struct {
	UserID    int64              `json:"userId"`
	ModuleID  int64              `json:"moduleId"`
	Sections  []SectionProgress  `json:"sections"`
	Questions []QuestionProgress `json:"questions"`
}

type MarkdownContent struct {
	Markdown  string        `json:"markdown"`
	ObjectKey uuid.NullUUID `json:"objectKey"`
	MediaExt  string        `json:"mediaExt"`
}

type VideoContent struct {
	URL       string        `json:"url"`
	ObjectKey uuid.NullUUID `json:"objectKey"`
	MediaExt  string        `json:"mediaExt"`
}

type QuestionContent struct {
	ID                 int64         `json:"id"`
	Question           string        `json:"question"`
	Type               string        `json:"type"`
	Options            []Option      `json:"options"`
	Tags               []string      `json:"tags"`
	UserQuestionAnswer *UserAnswer   `json:"userQuestionAnswer,omitempty"`
	ObjectKey          uuid.NullUUID `json:"objectKey"`
	MediaExt           string        `json:"mediaExt"`
}

type Option struct {
	ID        int64  `json:"id"`
	Content   string `json:"content"`
	IsCorrect bool   `json:"isCorrect"`
}

type CodeContent struct {
	Code      string        `json:"code"`
	Language  string        `json:"language"`
	ObjectKey uuid.NullUUID `json:"objectKey"`
	MediaExt  string        `json:"mediaExt"`
}

type LottieContent struct {
	Caption     string        `json:"caption"`
	Description string        `json:"description"`
	Width       int           `json:"width"`
	Height      int           `json:"height"`
	AltText     string        `json:"alt_text"`
	FallbackURL string        `json:"fallback_url"`
	Autoplay    bool          `json:"autoplay"`
	Loop        bool          `json:"loop"`
	Speed       float32       `json:"speed"`
	ObjectKey   uuid.NullUUID `json:"objectKey"`
	MediaExt    string        `json:"mediaExt"`
}

type UserAnswer struct {
	OptionID   *int64    `json:"optionId"`
	AnsweredAt time.Time `json:"answeredAt"`
	IsCorrect  bool      `json:"isCorrect"`
	Progress   float32   `json:"progress"`
}

type Section struct {
	ID              int64            `json:"id"`
	CreatedAt       time.Time        `json:"createdAt"`
	UpdatedAt       time.Time        `json:"updatedAt"`
	Type            SectionType      `json:"type"`
	Position        int16            `json:"position"`
	Content         json.RawMessage  `json:"content"`
	SectionProgress *SectionProgress `json:"sectionProgress,omitempty"`
	Progress        json.RawMessage  `json:"progress"`
}

func (s *Section) UnmarshalJSON(data []byte) error {
	type TempSection struct {
		ID              int64            `json:"id"`
		CreatedAt       time.Time        `json:"createdAt"`
		UpdatedAt       time.Time        `json:"updatedAt"`
		Type            SectionType      `json:"type"`
		Position        int16            `json:"position"`
		Content         json.RawMessage  `json:"content"`
		SectionProgress *SectionProgress `json:"sectionProgress"`
		Progress        interface{}      `json:"progress"`
	}

	var temp TempSection
	if err := json.Unmarshal(data, &temp); err != nil {
		return fmt.Errorf("failed to unmarshal section: %w", err)
	}

	s.ID = temp.ID
	s.CreatedAt = temp.CreatedAt
	s.UpdatedAt = temp.UpdatedAt
	s.Type = temp.Type
	s.Position = temp.Position
	s.SectionProgress = temp.SectionProgress

	// Handle nil content
	if temp.Content == nil {
		s.Content = json.RawMessage("{}")
	} else {
		s.Content = temp.Content
	}

	// Handle nil progress
	if temp.Progress == nil {
		s.Progress = json.RawMessage("{}")
	} else {
		var err error
		s.Progress, err = json.Marshal(temp.Progress)
		if err != nil {
			return fmt.Errorf("failed to marshal progress: %w", err)
		}
	}

	return nil
}

func (s *Section) GetType() SectionType { return s.Type }
func (s *Section) GetPosition() int16   { return s.Position }

type VideoSection struct {
	BaseModel
	Type            SectionType      `json:"type"`
	Position        int16            `json:"position"`
	Content         VideoContent     `json:"content"`
	SectionProgress *SectionProgress `json:"sectionProgress"`
}

func (vs *VideoSection) GetType() SectionType { return vs.Type }
func (vs *VideoSection) GetPosition() int16   { return vs.Position }

type QuestionSection struct {
	BaseModel
	Type            SectionType      `json:"type"`
	Position        int16            `json:"position"`
	Content         QuestionContent  `json:"content"`
	SectionProgress *SectionProgress `json:"sectionProgress"`
}

func (qs *QuestionSection) GetType() SectionType { return qs.Type }
func (qs *QuestionSection) GetPosition() int16   { return qs.Position }

type MarkdownSection struct {
	BaseModel
	Type            SectionType      `json:"type"`
	Position        int16            `json:"position"`
	Content         MarkdownContent  `json:"content"`
	SectionProgress *SectionProgress `json:"sectionProgress"`
}

func (ms *MarkdownSection) GetType() SectionType { return ms.Type }
func (ms *MarkdownSection) GetPosition() int16   { return ms.Position }

type CodeSection struct {
	BaseModel
	Type            SectionType      `json:"type"`
	Position        int16            `json:"position"`
	Content         CodeContent      `json:"content"`
	SectionProgress *SectionProgress `json:"sectionProgress"`
}

func (cs *CodeSection) GetType() SectionType { return cs.Type }
func (cs *CodeSection) GetPosition() int16   { return cs.Position }

type ImageSection struct {
	BaseModel
	Type            SectionType      `json:"type"`
	Position        int16            `json:"position"`
	Content         string           `json:"content"`
	SectionProgress *SectionProgress `json:"sectionProgress"`
}

func (is *ImageSection) GetType() SectionType { return is.Type }
func (is *ImageSection) GetPosition() int16   { return is.Position }

type LottieSection struct {
	BaseModel
	Type            SectionType      `json:"type"`
	Position        int16            `json:"position"`
	Content         LottieContent    `json:"content"`
	SectionProgress *SectionProgress `json:"sectionProgress"`
}

func (ls *LottieSection) GetType() SectionType { return ls.Type }
func (ls *LottieSection) GetPosition() int16   { return ls.Position }
