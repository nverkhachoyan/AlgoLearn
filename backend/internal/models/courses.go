package models

import (
	"encoding/json"
	"errors"
	"fmt"
	"time"
)

type DifficultyLevel string
type Status string

var (
	Beginner     DifficultyLevel = "beginner"
	Intermediate DifficultyLevel = "intermediate"
	Advanced     DifficultyLevel = "advanced"
	Expert       DifficultyLevel = "expert"
)

const (
	Uninitiated Status = "uninitiated"
	InProgress  Status = "in_progress"
	Completed   Status = "completed"
	Abandoned   Status = "abandoned"
)

type Course struct {
	BaseModel
	Name            string          `json:"name"`
	Description     string          `json:"description"`
	Requirements    string          `json:"requirements"`
	WhatYouLearn    string          `json:"whatYouLearn"`
	BackgroundColor string          `json:"backgroundColor"`
	IconURL         string          `json:"iconUrl"`
	Duration        int16           `json:"duration"`
	DifficultyLevel DifficultyLevel `json:"difficultyLevel"`
	Authors         []Author        `json:"authors"`
	Tags            []Tag           `json:"tags"`
	Rating          float64         `json:"rating"`
	CurrentUnit     *Unit           `json:"currentUnit"`
	CurrentModule   *Module         `json:"currentModule"`
	Units           []*Unit         `json:"units"`
}

type Unit struct {
	BaseModel
	UnitNumber  int16    `json:"unitNumber"`
	Name        string   `json:"name"`
	Description string   `json:"description"`
	Modules     []Module `json:"modules"`
}

type Module struct {
	BaseModel
	ModuleNumber int16              `json:"moduleNumber"`
	ModuleUnitID int64              `json:"moduleUnitId"`
	Name         string             `json:"name"`
	Description  string             `json:"description"`
	Progress     float32            `json:"progress"`
	Status       string             `json:"status"`
	Sections     []SectionInterface `json:"sections"`
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
}

type QuestionProgress struct {
	QuestionID  int64     `json:"questionId"`
	OptionID    *int64    `json:"optionId"`
	HasAnswered bool      `json:"hasAnswered"`
	IsCorrect   *bool     `json:"isCorrect,omitempty"`
	AnsweredAt  time.Time `json:"answeredAt"`
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
}

type Section struct {
	ID              int64            `json:"id"`
	CreatedAt       time.Time        `json:"createdAt"`
	UpdatedAt       time.Time        `json:"updatedAt"`
	Type            string           `json:"type"`
	Position        int16            `json:"position"`
	Content         json.RawMessage  `json:"content"`
	SectionProgress *SectionProgress `json:"sectionProgress,omitempty"`
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

	return nil
}

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
