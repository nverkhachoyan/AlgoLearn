package models

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
	Progress        float64         `json:"progress"`
	Units           []*Unit         `json:"units"`
}

type Unit struct {
	BaseModel
	UnitNumber  int16    `json:"unitNumber"`
	Name        string   `json:"name"`
	Description string   `json:"description"`
	Modules     []Module `json:"modules"`
}
