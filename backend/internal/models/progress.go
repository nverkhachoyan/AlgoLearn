package models

type Status string

const (
	Uninitiated Status = "uninitiated"
	InProgress  Status = "in_progress"
	Completed   Status = "completed"
	Abandoned   Status = "abandoned"
)

type CourseProgressSummary struct {
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
	CurrentUnit     *UnitProgressSummary   `json:"current_unit"`
	CurrentModule   *ModuleProgressSummary `json:"current_module"`
	Units           []*UnitProgressSummary `json:"units"`
}

type UnitProgressSummary struct {
	BaseModel
	UnitNumber  int16                   `json:"unit_number"`
	Name        string                  `json:"name"`
	Description string                  `json:"description"`
	Modules     []ModuleProgressSummary `json:"modules"`
}

type ModuleProgressSummary struct {
	BaseModel
	ModuleNumber int16   `json:"module_number"`
	ModuleUnitID int64   `json:"module_unit_id"`
	Name         string  `json:"name"`
	Description  string  `json:"description"`
	Progress     float32 `json:"progress"`
	Status       string  `json:"status"`
}
