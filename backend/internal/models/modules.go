package models

import (
	"encoding/json"
	"database/sql"
)
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

func (s Section) MarshalJSON() ([]byte, error) {
	data := map[string]interface{}{
		"id":         s.ID,
		"created_at": s.CreatedAt,
		"updated_at": s.UpdatedAt,
		"module_id":  s.ModuleID,
		"type":       s.Type,
		"position":   s.Position,
	}

	if s.Content.Valid {
		data["content"] = s.Content.String
	}
	if s.QuestionID.Valid {
		data["question_id"] = s.QuestionID.Int64
	}
	if s.Question.Valid {
		data["question"] = s.Question.String
	}
	if s.UserAnswerID.Valid {
		data["user_answer_id"] = s.UserAnswerID.Int64
	}
	if s.URL.Valid {
		data["url"] = s.URL.String
	}
	if s.Animation.Valid {
		data["animation"] = s.Animation.String
	}
	if s.Description.Valid {
		data["description"] = s.Description.String
	}

	if len(s.CorrectAnswerIDs) > 0 {
		data["correct_answer_ids"] = filterValidInt64s(s.CorrectAnswerIDs)
	}

	return json.Marshal(data)
}

func filterValidInt64s(nullInts []sql.NullInt64) []int64 {
	var result []int64
	for _, n := range nullInts {
		if n.Valid {
			result = append(result, n.Int64)
		}
	}
	return result
}

func (s Section) GetType() string {
	return s.Type
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