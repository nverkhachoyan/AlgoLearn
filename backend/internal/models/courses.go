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
	ModuleNumber int16     `json:"moduleNumber"`
	ModuleUnitID int64     `json:"moduleUnitId"`
	Name         string    `json:"name"`
	Description  string    `json:"description"`
	Progress     float32   `json:"progress"`
	Status       string    `json:"status"`
	Sections     []Section `json:"sections"`
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

	m.Sections = make([]Section, 0, len(temp.Sections))
	for _, rawSection := range temp.Sections {
		var baseSection struct {
			Type string `json:"type"`
		}
		if err := json.Unmarshal(rawSection, &baseSection); err != nil {
			return fmt.Errorf("failed to unmarshal section type: %w", err)
		}

		var section Section
		switch baseSection.Type {
		case "text":
			var s TextSection
			if err := json.Unmarshal(rawSection, &s); err != nil {
				return fmt.Errorf("failed to unmarshal text section: %w", err)
			}
			section = s
		case "video":
			var s VideoSection
			if err := json.Unmarshal(rawSection, &s); err != nil {
				return fmt.Errorf("failed to unmarshal video section: %w", err)
			}
			section = s
		case "question":
			var s QuestionSection
			if err := json.Unmarshal(rawSection, &s); err != nil {
				return fmt.Errorf("failed to unmarshal question section: %w", err)
			}
			section = s
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
		bs, ok := section.(interface{ GetBaseSection() BaseSection })
		if !ok {
			return errors.New("invalid section")
		}

		baseSection := bs.GetBaseSection()
		if baseSection.Position < 0 {
			return errors.New("section position must be positive")
		}

		if positions[baseSection.Position] {
			return errors.New("duplicate position")
		}
		positions[baseSection.Position] = true
	}

	return nil
}

type Section interface {
	GetBaseSection() BaseSection
	GetType() string
	SetID(ID int64)
}

type SectionProgress struct {
	SectionID   int64     `json:"sectionId,omitempty"`
	SeenAt      time.Time `json:"seenAt"`
	HasSeen     bool      `json:"hasSeen"`
	StartedAt   time.Time `json:"startedAt"`
	CompletedAt time.Time `json:"completedAt"`
}

type BaseSection struct {
	ModuleID        int64           `json:"moduleId"`
	Type            string          `json:"type"`
	Position        int16           `json:"position"`
	Content         any             `json:"content"`
	SectionProgress SectionProgress `json:"sectionProgress"`
}

type TextSection struct {
	BaseModel
	BaseSection
}

func (ts TextSection) GetBaseSection() BaseSection {
	return ts.BaseSection
}

func (ts TextSection) GetType() string {
	return ts.Type
}

func (ts TextSection) SetID(ID int64) {
	ts.ID = ID
}

type VideoSection struct {
	BaseModel
	BaseSection
}

func (vs VideoSection) GetBaseSection() BaseSection {
	return vs.BaseSection
}

func (vs VideoSection) GetType() string {
	return vs.Type
}

func (vs VideoSection) SetID(ID int64) {
	vs.ID = ID
}

type QuestionSection struct {
	BaseModel
	BaseSection
}

func (qs QuestionSection) GetBaseSection() BaseSection {
	return qs.BaseSection
}

func (qs QuestionSection) GetType() string {
	return qs.Type
}

func (qs QuestionSection) SetID(ID int64) {
	qs.ID = ID
}

type Question struct {
	BaseModel
	Type            string           `json:"type"`
	Question        string           `json:"question"`
	DifficultyLevel DifficultyLevel  `json:"difficultyLevel"`
	Options         []QuestionOption `json:"options"`
}

type QuestionOption struct {
	ID         int64  `json:"id"`
	QuestionID int64  `json:"questionId"`
	Content    string `json:"content"`
	IsCorrect  bool   `json:"isCorrect"`
}

type BatchModuleProgress struct {
	UserID    int64                `json:"userId"`
	ModuleID  int64                `json:"moduleId"`
	Sections  []SectionProgress    `json:"sections"`
	Questions []UserQuestionAnswer `json:"questions"`
}
