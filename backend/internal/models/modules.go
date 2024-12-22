package models

import (
	"encoding/json"
	"fmt"
	"time"

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
	ModuleNumber     int16              `json:"moduleNumber"`
	ModuleUnitID     int64              `json:"moduleUnitId"`
	Name             string             `json:"name"`
	Description      string             `json:"description"`
	Progress         float32            `json:"progress"`
	Status           string             `json:"status"`
	StartedAt        time.Time          `json:"startedAt"`
	CompletedAt      time.Time          `json:"completedAt,omitempty"`
	LastAccessed     time.Time          `json:"lastAccessed"`
	CurrentSectionID int32              `json:"currentSectionId,omitempty"`
	Sections         []SectionInterface `json:"sections"`
}

func (m *Module) UnmarshalJSON(data []byte) error {
	type TempModule struct {
		BaseModel
		ModuleUnitID int64             `json:"unitId"`
		Name         string            `json:"name"`
		Description  string            `json:"description"`
		Sections     []json.RawMessage `json:"sections"`
	}

	var temp TempModule
	if err := json.Unmarshal(data, &temp); err != nil {
		return fmt.Errorf("failed to unmarshal module: %w", err)
	}

	m.BaseModel = temp.BaseModel
	m.ModuleUnitID = temp.ModuleUnitID
	m.Name = temp.Name
	m.Description = temp.Description

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
		case "text":
			var s TextSection
			if err := json.Unmarshal(rawSection, &s); err != nil {
				return fmt.Errorf("failed to unmarshal text section: %w", err)
			}
			section = &s
		case "video":
			var s VideoSection
			if err := json.Unmarshal(rawSection, &s); err != nil {
				return fmt.Errorf("failed to unmarshal video section: %w", err)
			}
			section = &s
		case "question":
			var s QuestionSection
			if err := json.Unmarshal(rawSection, &s); err != nil {
				return fmt.Errorf("failed to unmarshal question section: %w", err)
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

type SectionInterface interface {
	GetType() string
	GetPosition() int16
	GetModuleID() int64
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

type TextContent struct {
	Text string `json:"text"`
}

type VideoContent struct {
	URL string `json:"url"`
}

type QuestionContent struct {
	ID                 int64       `json:"id"`
	Question           string      `json:"question"`
	Type               string      `json:"type"`
	Options            []Option    `json:"options"`
	UserQuestionAnswer *UserAnswer `json:"userQuestionAnswer,omitempty"`
}

type Option struct {
	ID        int64  `json:"id"`
	Content   string `json:"content"`
	IsCorrect bool   `json:"isCorrect"`
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
	Type            string           `json:"type"`
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
		Type            string           `json:"type"`
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
	s.Content = temp.Content
	s.SectionProgress = temp.SectionProgress
	s.Progress = temp.Progress.(json.RawMessage)

	return nil
}

func (s *Section) GetModuleID() int64 { return 0 }
func (s *Section) GetType() string    { return s.Type }
func (s *Section) GetPosition() int16 { return s.Position }

type TextSection struct {
	BaseModel
	Type            string           `json:"type"`
	Position        int16            `json:"position"`
	Content         TextContent      `json:"content"`
	SectionProgress *SectionProgress `json:"sectionProgress,omitempty"`
}

type VideoSection struct {
	BaseModel
	Type            string           `json:"type"`
	Position        int16            `json:"position"`
	Content         VideoContent     `json:"content"`
	SectionProgress *SectionProgress `json:"sectionProgress"`
}

type QuestionSection struct {
	BaseModel
	Type            string           `json:"type"`
	Position        int16            `json:"position"`
	Content         QuestionContent  `json:"content"`
	SectionProgress *SectionProgress `json:"sectionProgress"`
}

func (ts *TextSection) GetModuleID() int64     { return 0 }
func (vs *VideoSection) GetModuleID() int64    { return 0 }
func (qs *QuestionSection) GetModuleID() int64 { return 0 }

func (ts *TextSection) GetType() string     { return ts.Type }
func (vs *VideoSection) GetType() string    { return vs.Type }
func (qs *QuestionSection) GetType() string { return qs.Type }

func (ts *TextSection) GetPosition() int16     { return ts.Position }
func (vs *VideoSection) GetPosition() int16    { return vs.Position }
func (qs *QuestionSection) GetPosition() int16 { return qs.Position }
