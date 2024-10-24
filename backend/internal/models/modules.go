package models

type Module struct {
	BaseModel
	UnitID      int64     `json:"unit_id"`
	Name        string    `json:"name"`
	Description string    `json:"description"`
	Sections    []Section `json:"sections,omitempty"`
}

type Section interface{}

type BaseSection struct {
	ModuleID int64  `json:"module_id"`
	Type     string `json:"type"`
	Position int16  `json:"position"`
}

type TextSection struct {
	BaseModel
	BaseSection
	Content string `json:"content"`
}

type VideoSection struct {
	BaseModel
	BaseSection
	Url string `json:"url"`
}

type QuestionSection struct {
	BaseModel
	BaseSection
	QuestionID int64 `json:"question_id"`
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
