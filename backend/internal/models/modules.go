package models

import (
	"encoding/json"
	"errors"
	"fmt"
)

type Module struct {
	BaseModel
	UnitID      int64     `json:"unit_id"`
	Name        string    `json:"name"`
	Description string    `json:"description"`
	Sections    []Section `json:"sections,omitempty"`
}

func (m *Module) UnmarshalJSON(data []byte) error {
	type TempModule struct {
		BaseModel
		UnitID      int64             `json:"unit_id"`
		Name        string            `json:"name"`
		Description string            `json:"description"`
		Sections    []json.RawMessage `json:"sections,omitempty"`
	}

	var temp TempModule
	if err := json.Unmarshal(data, &temp); err != nil {
		return fmt.Errorf("failed to unmarshal module: %w", err)
	}

	m.BaseModel = temp.BaseModel
	m.UnitID = temp.UnitID
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
}

type BaseSection struct {
	ModuleID int64  `json:"module_id,omitempty"`
	Type     string `json:"type"`
	Position int16  `json:"position"`
}

type TextSection struct {
	BaseModel
	BaseSection
	Content string `json:"content"`
}

func (ts TextSection) GetBaseSection() BaseSection {
	return ts.BaseSection
}

func (ts TextSection) GetType() string {
	return ts.Type
}

type VideoSection struct {
	BaseModel
	BaseSection
	Url string `json:"url"`
}

func (vs VideoSection) GetBaseSection() BaseSection {
	return vs.BaseSection
}

func (vs VideoSection) GetType() string {
	return vs.Type
}

type QuestionSection struct {
	BaseModel
	BaseSection
	QuestionID int64 `json:"question_id,omitempty"`
	Question   Question
}

func (qs QuestionSection) GetBaseSection() BaseSection {
	return qs.BaseSection
}

func (qs QuestionSection) GetType() string {
	return qs.Type
}

type Question struct {
	BaseModel
	Type            string
	Question        string
	DifficultyLevel DifficultyLevel
	Options         []QuestionOption
}

type QuestionOption struct {
	ID         int64
	QuestionID int64
	Content    string
	IsCorrect  bool
}

type ModuleQuestion struct {
	BaseModel
	ModuleID int    `json:"module_id"`
	Content  string `json:"content"`
}

type ModuleQuestionOption struct {
	BaseModel
	QuestionID int    `json:"question_id"`
	Content    string `json:"content"`
	IsCorrect  bool   `json:"is_correct"`
}
