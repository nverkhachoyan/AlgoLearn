package models

import (
	"errors"
	"time"
)

type Course struct {
	BaseModel
	Name            string    `json:"name"`
	Description     string    `json:"description"`
	BackgroundColor string    `json:"background_color"`
	IconURL         string    `json:"icon_url,omitempty"`
	Duration        string    `json:"duration,omitempty"`
	DifficultyLevel string    `json:"difficulty_level,omitempty"`
	Author          string    `json:"author,omitempty"`
	Tags            []string  `json:"tags,omitempty"`
	Rating          float64   `json:"rating,omitempty"`
	LearnersCount   int       `json:"learners_count"`
	LastUpdated     time.Time `json:"last_updated"`
}

type Unit struct {
	BaseModel
	CourseID    int    `json:"course_id"`
	Name        string `json:"name"`
	Description string `json:"description"`
}

// Section Interface and Implementations

// Section is the interface that different types of module sections implement
type Section interface {
	GetType() string
}

// BaseSection provides common fields for all sections
type BaseSection struct {
	Type     string `json:"type"`
	Position int    `json:"position"`
}

type TextSection struct {
	BaseSection
	Content string `json:"content"`
}

type QuestionOption struct {
	ID      int    `json:"id"`
	Content string `json:"content"`
}

type QuestionSection struct {
	BaseSection
	QuestionID       int              `json:"question_id"`
	Question         string           `json:"question"`
	Options          []QuestionOption `json:"options"`
	UserAnswerID     *int             `json:"user_answer_id,omitempty"`
	CorrectAnswerIDs []int            `json:"correct_answer_ids"`
}

type VideoSection struct {
	BaseSection
	URL string `json:"url"`
}

type CodeSection struct {
	BaseSection
	Content string `json:"content"`
}

type LottieSection struct {
	BaseSection
	Animation string `json:"animation"`
}

type ImageSection struct {
	BaseSection
	Url         string `json:"url"`
	Description string `json:"description"`
}

// Implementing the GetType method for each section type

func (t TextSection) GetType() string {
	return t.Type
}

func (q QuestionSection) GetType() string {
	return q.Type
}

func (v VideoSection) GetType() string {
	return v.Type
}

func (c CodeSection) GetType() string {
	return c.Type
}

func (l LottieSection) GetType() string {
	return l.Type
}

func (i ImageSection) GetType() string {
	return i.Type
}

// ModuleContent contains the list of sections in a module
type ModuleContent struct {
	Sections []Section `json:"sections"`
}

// Module represents a module within a unit
type Module struct {
	BaseModel
	UnitID      int           `json:"unit_id"`
	CourseID    int           `json:"course_id"`
	Name        string        `json:"name"`
	Description string        `json:"description"`
	Content     ModuleContent `json:"content"` // JSON content
}

func (m *Module) Validate() error {
	if m.UnitID == 0 {
		return errors.New("Unit ID is required")
	}
	if m.CourseID == 0 {
		return errors.New("Course ID is required")
	}
	if m.Name == "" {
		return errors.New("Module name required")
	}
	if m.Description == "" {
		return errors.New("Module description required")
	}
	if len(m.Content.Sections) == 0 {
		return errors.New("Module content required")
	}
	return nil
}

// ModuleQuestion and Answer Types

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
