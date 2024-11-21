package models

import (
	"encoding/json"
	"errors"
	"fmt"
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
	Name            string                 `json:"name"`
	Description     string                 `json:"description"`
	Requirements    string                 `json:"requirements"`
	WhatYouLearn    string                 `json:"what_you_learn"`
	BackgroundColor string                 `json:"background_color"`
	IconURL         string                 `json:"icon_url"`
	Duration        int16                  `json:"duration"`
	DifficultyLevel DifficultyLevel        `json:"difficulty_level"`
	Authors         []Author               `json:"authors"`
	Tags            []Tag                  `json:"tags"`
	Rating          float64                `json:"rating"`
	CurrentUnit     *Unit  `json:"current_unit"`
	CurrentModule   *Module `json:"current_module"`
	Units           []*Unit `json:"units"`
}

type Unit struct {
	BaseModel
	UnitNumber  int16                   `json:"unit_number"`
	Name        string                  `json:"name"`
	Description string                  `json:"description"`
	Modules     []Module `json:"modules"`
}

type Module struct {
	BaseModel
	ModuleNumber int16   `json:"module_number"`
	ModuleUnitID int64   `json:"module_unit_id"`
	Name         string  `json:"name"`
	Description  string  `json:"description"`
	Progress     float32 `json:"progress"`
	Status       string  `json:"status"`
	Sections []Section `json:"sections"`
}

func (m *Module) UnmarshalJSON(data []byte) error {
	type TempModule struct {
		BaseModel
		ModuleUnitID    int64             `json:"unit_id"`
		Name        	string            `json:"name"`
		Description 	string            `json:"description"`
		Sections    	[]json.RawMessage `json:"sections"`
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

type BaseSection struct {
	ModuleID int64  `json:"module_id,omitempty"`
	Type     string `json:"type"`
	Position int16  `json:"position"`
	Content any `json:"content"`
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
	QuestionID int64    `json:"question_id"`
	Question   Question `json:"question"`
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
	DifficultyLevel DifficultyLevel  `json:"difficulty_level"`
	Options         []QuestionOption `json:"options"`
}

type QuestionOption struct {
	ID         int64  `json:"id"`
	QuestionID int64  `json:"question_id"`
	Content    string `json:"content"`
	IsCorrect  bool   `json:"is_correct"`
}
