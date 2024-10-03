package models

import (
	"algolearn-backend/internal/utils"
	"database/sql"

	"github.com/LukaGiorgadze/gonull"
)

type Course struct {
	BaseModel
	Name            gonull.Nullable[string]   `json:"name"`
	Description     gonull.Nullable[string]   `json:"description"`
	BackgroundColor gonull.Nullable[string]   `json:"background_color"`
	IconURL         gonull.Nullable[string]   `json:"icon_url,omitempty"`
	Duration        gonull.Nullable[string]   `json:"duration,omitempty"`
	DifficultyLevel gonull.Nullable[string]   `json:"difficulty_level,omitempty"`
	Authors         utils.NullableStringSlice `json:"authors,omitempty"`
	Tags            utils.NullableStringSlice `json:"tags,omitempty"`
	Rating          gonull.Nullable[float64]  `json:"rating,omitempty"`
	LearnersCount   gonull.Nullable[int64]    `json:"learners_count"`
}

type Unit struct {
	BaseModel
	CourseID    int64  `json:"course_id"`
	Name        string `json:"name"`
	Description string `json:"description"`
}

type Module struct {
	BaseModel
	UnitID      int64     `json:"unit_id"`
	CourseID    int64     `json:"course_id"`
	Name        string    `json:"name"`
	Description string    `json:"description"`
	Sections    []Section `json:"sections,omitempty"`
}

type Section struct {
	BaseModel
	ModuleID         string          `json:"module_id"`
	Type             string          `json:"type"`
	Position         int             `json:"position"`
	Content          sql.NullString  `json:"content"`
	QuestionID       sql.NullInt64   `json:"question_id"`
	Question         sql.NullString  `json:"question"`
	UserAnswerID     sql.NullInt64   `json:"user_answer_id,omitempty"`
	CorrectAnswerIDs []sql.NullInt64 `json:"correct_answer_ids"`
	URL              sql.NullString  `json:"url"`
	Animation        sql.NullString  `json:"animation"`
	Description      sql.NullString  `json:"description"`
}

func (t Section) GetType() string {
	return t.Type
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
