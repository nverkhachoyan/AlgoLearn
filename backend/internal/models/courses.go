package models

import "time"

type Course struct {
	ID              int       `json:"id"`
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
	CreatedAt       time.Time `json:"created_at"`
	UpdatedAt       time.Time `json:"updated_at"`
	LastUpdated     time.Time `json:"last_updated"`
}

type Unit struct {
	ID          int       `json:"id"`
	CourseID    int       `json:"course_id"`
	Name        string    `json:"name"`
	Description string    `json:"description"`
	CreatedAt   time.Time `json:"created_at"`
	UpdatedAt   time.Time `json:"updated_at"`
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
	ID          int           `json:"id"`
	UnitID      int           `json:"unit_id"`
	Name        string        `json:"name"`
	Description string        `json:"description"`
	Content     ModuleContent `json:"content"` // JSON content
	CreatedAt   time.Time     `json:"created_at"`
	UpdatedAt   time.Time     `json:"updated_at"`
}

// ModuleQuestion and Answer Types

type ModuleQuestion struct {
	ID        int       `json:"id"`
	ModuleID  int       `json:"module_id"`
	Content   string    `json:"content"`
	CreatedAt time.Time `json:"created_at"`
	UpdatedAt time.Time `json:"updated_at"`
}

type ModuleQuestionAnswer struct {
	ID         int       `json:"id"`
	QuestionID int       `json:"question_id"`
	Content    string    `json:"content"`
	IsCorrect  bool      `json:"is_correct"`
	CreatedAt  time.Time `json:"created_at"`
	UpdatedAt  time.Time `json:"updated_at"`
}
